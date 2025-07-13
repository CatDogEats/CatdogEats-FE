// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  Sync as SyncIcon,
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
import {
  useSellerOrderManagement,
  useOrderModals,
  useOrderFilter,
} from "@/hooks/useSellerOrders";
import type { OrderStatus, SellerOrderItem } from "@/types/sellerOrder.types";

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
 *
 * 탭 구조:
 * 0. 출고 지연 요청 관리
 * 1. 주문 현황별 관리
 * 2. 주문 검색 및 필터링
 */
const OrderShippingManagement: React.FC = () => {
  // ===== 탭 상태 =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== 모달 상태 관리 =====
  const {
    modals,
    openDetailModal,
    openStatusUpdateModal,
    closeDetailModal,
    closeStatusUpdateModal,
  } = useOrderModals();

  // ===== 검색/필터 상태 =====
  const { filters, setFilter, resetFilters } = useOrderFilter();

  // ===== UI 상태 =====
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // ===== 데이터 및 액션 훅 사용 =====
  const {
    orders,
    orderStats,
    ordersLoading,
    ordersError,
    actionLoading,
    actionError,
    setPagination,
    refreshOrders,
    deleteOrder,
    syncShipmentStatus,
    searchOrders,
  } = useSellerOrderManagement(0, "createdAt,desc");

  // ===== 스낵바 헬퍼 =====
  const showSnackbar = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "success"
    ) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // ===== 탭 변경 핸들러 =====
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  // ===== 탭별 데이터 필터링 =====
  const getFilteredOrdersForTab = useCallback(
    (tabIndex: number): SellerOrderItem[] => {
      if (!orders?.orders) return [];

      switch (tabIndex) {
        case 0: // 출고 지연 요청
          return orders.orders.filter((order) => order.isDelayed === true);
        case 1: // 주문 현황별 관리 (전체)
          return orders.orders;
        case 2: // 주문 검색 (필터 적용)
          let filtered = orders.orders;

          // 상태 필터
          if (filters.statusFilter !== "ALL") {
            filtered = filtered.filter(
              (order) => order.orderStatus === filters.statusFilter
            );
          }

          // 검색어 필터
          if (filters.searchKeyword) {
            filtered = filtered.filter((order) => {
              const keyword = filters.searchKeyword.toLowerCase();
              switch (filters.searchType) {
                case "orderNumber":
                  return order.orderNumber.toLowerCase().includes(keyword);
                case "buyerName":
                  return order.buyerName.toLowerCase().includes(keyword);
                case "productName":
                  // 실제로는 orderItems를 확인해야 하지만, 간단히 구현
                  return false;
                default:
                  return false;
              }
            });
          }

          return filtered;
        default:
          return orders.orders;
      }
    },
    [orders, filters]
  );

  // ===== 검색 핸들러 =====
  const handleSearch = useCallback(async () => {
    const searchParams = {
      searchType: filters.searchType,
      searchKeyword: filters.searchKeyword,
      statusFilter:
        filters.statusFilter !== "ALL" ? filters.statusFilter : undefined,
    };

    try {
      await searchOrders(searchParams);
      showSnackbar("검색이 완료되었습니다.", "success");
    } catch (error) {
      showSnackbar("검색 중 오류가 발생했습니다.", "error");
    }
  }, [filters, searchOrders, showSnackbar]);

  // ===== 필터 리셋 핸들러 =====
  const handleReset = useCallback(async () => {
    resetFilters();
    await refreshOrders();
    showSnackbar("필터가 초기화되었습니다.", "info");
  }, [resetFilters, refreshOrders, showSnackbar]);

  // ===== 동기화 핸들러 =====
  const handleSync = useCallback(async () => {
    try {
      const result = await syncShipmentStatus();
      if (result.updatedOrders > 0) {
        showSnackbar(
          `${result.updatedOrders}개 주문의 배송 상태가 업데이트되었습니다.`,
          "success"
        );
      } else {
        showSnackbar("업데이트할 배송 정보가 없습니다.", "info");
      }
    } catch (error) {
      showSnackbar("동기화 중 오류가 발생했습니다.", "error");
    }
  }, [syncShipmentStatus, showSnackbar]);

  // ===== 테이블 핸들러들 =====
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPagination({ page: newPage });
    },
    [setPagination]
  );

  const handleRowsPerPageChange = useCallback(
    (rowsPerPage: number) => {
      setPagination({ page: 0, size: rowsPerPage });
    },
    [setPagination]
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
    async (orderNumber: string) => {
      try {
        await deleteOrder({ orderNumber });
        showSnackbar("주문이 삭제되었습니다.", "success");
      } catch (error) {
        showSnackbar("주문 삭제 중 오류가 발생했습니다.", "error");
      }
    },
    [deleteOrder, showSnackbar]
  );

  // ===== 모달 성공 콜백들 =====
  const handleModalSuccess = useCallback(() => {
    showSnackbar("처리가 완료되었습니다.", "success");
  }, [showSnackbar]);

  // ===== 대시보드 카드 클릭 핸들러 =====
  const handleDashboardCardClick = useCallback(
    (status: string) => {
      // 해당 상태로 필터링하고 검색 탭으로 이동
      if (status !== "ALL") {
        setFilter("statusFilter", status as OrderStatus);
      }
      setActiveTab(2); // 주문 검색 탭으로 이동
    },
    [setFilter]
  );

  // ===== 에러 처리 =====
  useEffect(() => {
    if (ordersError) {
      showSnackbar(ordersError, "error");
    }
  }, [ordersError, showSnackbar]);

  useEffect(() => {
    if (actionError) {
      showSnackbar(actionError, "error");
    }
  }, [actionError, showSnackbar]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Frontend-prototype 스타일 페이지 헤더 */}
      <PageHeader
        title="주문/배송 관리"
        onCustomerViewClick={() => window.open("/buyer/orders", "_blank")}
      />

      {/* 주문 현황 대시보드 */}
      <OrderStatusDashboard
        orderSummary={orderStats.orderSummary}
        urgentTasks={orderStats.urgentTasks}
        onCardClick={handleDashboardCardClick}
      />

      {/* 관리 카테고리 탭 */}
      <Paper
        sx={{
          borderRadius: 2,
          border: `1px solid ${BRAND_COLORS.BORDER}`,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
            backgroundColor: "#f9fafb",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: BRAND_COLORS.TEXT_SECONDARY,
              py: 2,
              px: 3,
              "&.Mui-selected": {
                color: BRAND_COLORS.PRIMARY,
                fontWeight: 700,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: BRAND_COLORS.PRIMARY,
              height: 3,
            },
          }}
        >
          <Tab
            icon={<WarningIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                출고 지연 요청
                {orderStats.urgentTasks.delayRequests > 0 && (
                  <Chip
                    label={orderStats.urgentTasks.delayRequests}
                    size="small"
                    color="error"
                    sx={{ minWidth: 20, height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="주문 현황별 관리"
          />
          <Tab icon={<SearchIcon />} iconPosition="start" label="주문 검색" />
        </Tabs>

        {/* 탭 패널 내용 */}

        {/* 출고 지연 요청 탭 */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                }}
              >
                출고 지연 요청 관리
              </Typography>

              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSync}
                disabled={actionLoading}
                sx={{
                  color: BRAND_COLORS.PRIMARY,
                  borderColor: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                    borderColor: BRAND_COLORS.PRIMARY,
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={16} /> : "상태 동기화"}
              </Button>
            </Box>

            {orderStats.urgentTasks.delayRequests > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  {orderStats.urgentTasks.delayRequests}건의 출고 지연 요청이
                  있습니다. 가능한 한 빠른 시일 내에 처리해 주세요.
                </Typography>
              </Alert>
            )}

            <OrderListTable
              data={{
                orders: getFilteredOrdersForTab(0),
                totalElements: getFilteredOrdersForTab(0).length,
                totalPages: 1,
                currentPage: 0,
                pageSize: 20,
                hasNext: false,
                hasPrevious: false,
              }}
              loading={ordersLoading}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDetailView={handleDetailView}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </Box>
        </TabPanel>

        {/* 주문 현황 탭 */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                }}
              >
                전체 주문 현황
              </Typography>

              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSync}
                disabled={actionLoading}
                sx={{
                  color: BRAND_COLORS.PRIMARY,
                  borderColor: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                    borderColor: BRAND_COLORS.PRIMARY,
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={16} /> : "상태 동기화"}
              </Button>
            </Box>

            <OrderListTable
              data={
                orders || {
                  orders: [],
                  totalElements: 0,
                  totalPages: 0,
                  currentPage: 0,
                  pageSize: 20,
                  hasNext: false,
                  hasPrevious: false,
                }
              }
              loading={ordersLoading}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDetailView={handleDetailView}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </Box>
        </TabPanel>

        {/* 주문 검색 탭 */}
        <TabPanel value={activeTab} index={2}>
          <OrderSearchTab
            searchKeyword={filters.searchKeyword}
            onSearchKeywordChange={(value) => setFilter("searchKeyword", value)}
            searchType={filters.searchType}
            onSearchTypeChange={(value) => setFilter("searchType", value)}
            statusFilter={filters.statusFilter}
            onStatusFilterChange={(value) => setFilter("statusFilter", value)}
            onSearch={handleSearch}
            onReset={handleReset}
            onSync={handleSync}
            data={{
              orders: getFilteredOrdersForTab(2),
              totalElements: getFilteredOrdersForTab(2).length,
              totalPages: 1,
              currentPage: 0,
              pageSize: 20,
              hasNext: false,
              hasPrevious: false,
            }}
            loading={ordersLoading}
            syncLoading={actionLoading}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onDetailView={handleDetailView}
            onStatusChange={handleStatusChange}
            onDeleteOrder={handleDeleteOrder}
          />
        </TabPanel>
      </Paper>

      {/* 모달들 */}
      {modals.detail.open && modals.detail.orderNumber && (
        <OrderDetailModal
          open={modals.detail.open}
          onClose={closeDetailModal}
          orderNumber={modals.detail.orderNumber}
        />
      )}

      {modals.statusUpdate.open &&
        modals.statusUpdate.orderNumber &&
        modals.statusUpdate.currentStatus && (
          <OrderStatusUpdateModal
            open={modals.statusUpdate.open}
            onClose={closeStatusUpdateModal}
            orderNumber={modals.statusUpdate.orderNumber}
            currentStatus={modals.statusUpdate.currentStatus}
            onSuccess={handleModalSuccess}
          />
        )}

      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderShippingManagement;
