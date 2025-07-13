// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PageHeader,
} from "@/components/SellerDashboard/SellerInfo";
import OrderStatusDashboard from "./OrderStatusDashboard";
import OrderSearchTab from "./OrderSearchTab";
import OrderListTable from "./OrderListTable";
import OrderDetailModal from "./OrderDetailModal";
import OrderStatusUpdateModal from "./OrderStatusUpdateModal";
import { useSellerOrderManagement } from "@/hooks/useSellerOrders";
import { useOrderModals } from "@/hooks/useOrderModals";
import type {
  OrderStatus,
  ShipmentSyncResponse,
} from "@/types/sellerOrder.types";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * 주문 배송 관리 메인 컴포넌트
 * Frontend-prototype 디자인을 완전히 복원한 탭 기반 인터페이스
 */
const OrderShippingManagement: React.FC = () => {
  // ===== 탭 상태 =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== 검색/필터 상태 =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState("orderNumber");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // ===== 페이지네이션 상태 =====
  const [page, setPage] = useState(0);

  // ===== 모달 상태 관리 =====
  const {
    modals,
    openDetailModal,
    openStatusUpdateModal,
    closeDetailModal,
    closeStatusUpdateModal,
  } = useOrderModals();

  // ===== UI 상태 =====
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");

  // ===== 데이터 및 액션 훅 사용 =====
  const {
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    actionLoading,
    actionError,
    syncShipmentStatus,
  } = useSellerOrderManagement(page, "createdAt,desc");

  // ===== 주문 현황 데이터 계산 =====
  const orderSummary = React.useMemo(() => {
    if (!orders?.orders) {
      return {
        paymentCompleted: 0,
        preparing: 0,
        readyForDelivery: 0,
        inTransit: 0,
        delivered: 0,
      };
    }

    const summary = orders.orders.reduce(
      (acc, order) => {
        switch (order.orderStatus) {
          case "PAYMENT_COMPLETED":
            acc.paymentCompleted += 1;
            break;
          case "PREPARING":
            acc.preparing += 1;
            break;
          case "READY_FOR_SHIPMENT":
            acc.readyForDelivery += 1;
            break;
          case "IN_DELIVERY":
            acc.inTransit += 1;
            break;
          case "DELIVERED":
            acc.delivered += 1;
            break;
        }
        return acc;
      },
      {
        paymentCompleted: 0,
        preparing: 0,
        readyForDelivery: 0,
        inTransit: 0,
        delivered: 0,
      }
    );

    return summary;
  }, [orders]);

  // ===== 출고 지연 데이터 계산 =====
  const urgentTasks = React.useMemo(() => {
    if (!orders?.orders) {
      return { delayRequests: 0, longTermUndelivered: 0 };
    }

    const delayRequests = orders.orders.filter(
      (order) =>
        order.orderStatus === "PREPARING" && order.orderSummary?.delayReason
    ).length;

    const longTermUndelivered = orders.orders.filter((order) => {
      if (order.orderStatus !== "IN_DELIVERY") return false;
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      const diffDays = Math.ceil(
        (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays > 7;
    }).length;

    return { delayRequests, longTermUndelivered };
  }, [orders]);

  // ===== 탭별 필터링된 데이터 =====
  const getFilteredOrdersForTab = useCallback(
    (tabIndex: number) => {
      if (!orders) return null;

      switch (tabIndex) {
        case 0: // 출고 지연 요청 탭
          return {
            ...orders,
            orders: orders.orders.filter(
              (order) =>
                order.orderStatus === "PREPARING" &&
                order.orderSummary?.delayReason
            ),
          };
        case 1: // 주문 현황 탭 (전체)
          return orders;
        case 2: // 주문 검색 탭 (검색/필터 적용)
          return orders;
        default:
          return orders;
      }
    },
    [orders]
  );

  // ===== 에러 처리 =====
  useEffect(() => {
    if (ordersError) {
      showSnackbar(ordersError.message, "error");
    }
  }, [ordersError]);

  useEffect(() => {
    if (actionError) {
      showSnackbar(actionError.message, "error");
    }
  }, [actionError]);

  // ===== 스낵바 표시 헬퍼 =====
  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  // ===== 탭 변경 핸들러 =====
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  // ===== 검색/필터 핸들러들 =====
  const handleSearch = useCallback(() => {
    setPage(0);
    refreshOrders();
    showSnackbar("검색을 실행했습니다.", "info");
  }, [refreshOrders]);

  const handleReset = useCallback(() => {
    setSearchKeyword("");
    setSearchType("orderNumber");
    setStatusFilter("ALL");
    setPage(0);
    refreshOrders();
    showSnackbar("검색 조건을 초기화했습니다.", "info");
  }, [refreshOrders]);

  // ===== 동기화 핸들러 =====
  const handleSync = useCallback(async () => {
    try {
      const result = await syncShipmentStatus();

      if (result) {
        const {
          totalCheckedOrders,
          updatedOrders,
          failedOrders,
        }: ShipmentSyncResponse = result;

        let message = `총 ${totalCheckedOrders}건 확인`;

        if (updatedOrders > 0) {
          message += `, ${updatedOrders}건 배송완료로 업데이트됨`;
        }

        if (failedOrders > 0) {
          message += `, ${failedOrders}건 실패`;
        }

        showSnackbar(message, updatedOrders > 0 ? "success" : "info");
      }
    } catch (error) {
      showSnackbar("동기화 중 오류가 발생했습니다.", "error");
    }
  }, [syncShipmentStatus, showSnackbar]);

  // ===== 테이블 핸들러들 =====
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback(
    (_rowsPerPage: number) => {
      setPage(0);
      refreshOrders();
    },
    [refreshOrders]
  );

  const handleDetailView = useCallback(
    (orderNumber: string) => {
      openDetailModal(orderNumber);
    },
    [openDetailModal]
  );

  const handleStatusChange = useCallback(
    (orderNumber: string, currentStatus: OrderStatus) => {
      openStatusUpdateModal(orderNumber, currentStatus);
    },
    [openStatusUpdateModal]
  );

  const handleDeleteOrder = useCallback(
    (orderNumber: string) => {
      // TODO: 삭제 API 호출
      console.log("Delete order:", orderNumber);
      showSnackbar("주문이 삭제되었습니다.", "success");
      refreshOrders();
    },
    [refreshOrders, showSnackbar]
  );

  // ===== 모달 성공 콜백들 =====
  const handleModalSuccess = useCallback(() => {
    refreshOrders();
    showSnackbar("처리가 완료되었습니다.", "success");
  }, [refreshOrders, showSnackbar]);

  // ===== 대시보드 카드 클릭 핸들러 =====
  const handleDashboardCardClick = useCallback((status: string) => {
    // 해당 상태로 필터링하고 검색 탭으로 이동
    if (status !== "ALL") {
      setStatusFilter(status as OrderStatus);
    }
    setActiveTab(2); // 주문 검색 탭으로 이동
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Frontend-prototype 스타일 페이지 헤더 */}
      <PageHeader
        title="주문/배송 관리"
        onCustomerViewClick={() => window.open("/buyer/orders", "_blank")}
      />

      {/* 주문 현황 대시보드 */}
      <OrderStatusDashboard
        orderSummary={orderSummary}
        urgentTasks={urgentTasks}
        onCardClick={handleDashboardCardClick}
      />

      {/* 관리 카테고리 탭 */}
      <Paper
        sx={{ borderRadius: 2, border: `1px solid ${BRAND_COLORS.BORDER}` }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "1rem",
              color: BRAND_COLORS.TEXT_SECONDARY,
              "&.Mui-selected": {
                color: BRAND_COLORS.PRIMARY,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: BRAND_COLORS.PRIMARY,
            },
          }}
        >
          <Tab
            icon={<WarningIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                출고 지연 요청
                {urgentTasks.delayRequests > 0 && (
                  <Chip
                    size="small"
                    label={urgentTasks.delayRequests}
                    color="error"
                    sx={{ height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="주문 현황"
          />
          <Tab icon={<SearchIcon />} iconPosition="start" label="주문 검색" />
        </Tabs>

        {/* 탭별 컨텐츠 */}
        <Box sx={{ p: 3 }}>
          {/* 출고 지연 요청 탭 */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <WarningIcon sx={{ color: "#f57c00" }} />
                출고 지연 요청 관리 ({urgentTasks.delayRequests}건)
              </Typography>

              {urgentTasks.delayRequests > 0 && (
                <Alert
                  severity="warning"
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<WarningIcon />}
                >
                  출고 지연 요청은 고객 만족도에 직접적인 영향을 미칩니다.
                  가능한 한 빠른 시일 내에 처리해 주세요.
                </Alert>
              )}
            </Box>

            <OrderListTable
              data={getFilteredOrdersForTab(0)}
              loading={ordersLoading}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDetailView={handleDetailView}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </TabPanel>

          {/* 주문 현황 탭 */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                }}
              >
                전체 주문 현황
              </Typography>
            </Box>

            <OrderListTable
              data={getFilteredOrdersForTab(1)}
              loading={ordersLoading}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDetailView={handleDetailView}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </TabPanel>

          {/* 주문 검색 탭 */}
          <TabPanel value={activeTab} index={2}>
            <OrderSearchTab
              searchKeyword={searchKeyword}
              onSearchKeywordChange={setSearchKeyword}
              searchType={searchType}
              onSearchTypeChange={setSearchType}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onSearch={handleSearch}
              onReset={handleReset}
              onSync={handleSync}
              data={getFilteredOrdersForTab(2)}
              loading={ordersLoading}
              syncLoading={actionLoading}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDetailView={handleDetailView}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </TabPanel>
        </Box>
      </Paper>

      {/* 모달들 */}
      <OrderDetailModal
        open={modals.detail.open}
        onClose={closeDetailModal}
        orderNumber={modals.detail.orderNumber}
      />

      <OrderStatusUpdateModal
        open={modals.statusUpdate.open}
        onClose={closeStatusUpdateModal}
        orderNumber={modals.statusUpdate.orderNumber}
        currentStatus={modals.statusUpdate.currentStatus}
        onSuccess={handleModalSuccess}
      />

      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderShippingManagement;
