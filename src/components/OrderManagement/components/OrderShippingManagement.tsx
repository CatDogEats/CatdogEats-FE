// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useCallback } from "react";
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
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  Avatar,
  Stack,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  Sync as SyncIcon,
  Payment as PaymentIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  DirectionsRun as TransitIcon,
  CheckCircle as DeliveredIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import OrderDetailModal from "./OrderDetailModal";
import OrderStatusUpdateModal from "./OrderStatusUpdateModal";
import {
  useSellerOrderManagement,
  useOrderModals,
  useOrderFilter,
} from "@/hooks/useSellerOrders";
import type { OrderStatus, SellerOrderItem } from "@/types/sellerOrder.types";
import { ORDER_STATUS_INFO_MAP } from "@/types/sellerOrder.types";

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
 * 주문 배송 관리 메인 컴포넌트 - 프로토타입 디자인 완전 복원
 *
 * 탭 구조:
 * 0. 출고 지연 요청 관리 (긴급 처리가 필요한 주문)
 * 1. 주문 현황별 관리 (전체 주문 목록 및 상태별 관리)
 * 2. 주문 검색 및 필터링 (다양한 조건으로 주문 검색)
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

  // ===== 테이블 메뉴 상태 =====
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState<OrderStatus>("PAYMENT_COMPLETED");

  // ===== 데이터 및 액션 훅 사용 =====
  const {
    orders,
    ordersLoading,
    ordersError,
    actionLoading,
    actionError,
    refreshOrders,
    deleteOrder,
    syncShipmentStatus,
    updateOrderStatus,
  } = useSellerOrderManagement(0, "createdAt,desc");

  // ===== 통계 계산 (orders 데이터 기반) =====
  const orderStats = React.useMemo(() => {
    if (!orders?.orders) {
      return {
        orderSummary: {
          paymentCompleted: 0,
          preparing: 0,
          readyForShipment: 0,
          inTransit: 0,
          delivered: 0,
        },
        urgentTasks: {
          delayRequests: 0,
          longTermUndelivered: 0,
        },
      };
    }

    const orderList = orders.orders;
    return {
      orderSummary: {
        paymentCompleted: orderList.filter(
          (o) => o.orderStatus === "PAYMENT_COMPLETED"
        ).length,
        preparing: orderList.filter((o) => o.orderStatus === "PREPARING")
          .length,
        readyForShipment: orderList.filter(
          (o) => o.orderStatus === "READY_FOR_SHIPMENT"
        ).length,
        inTransit: orderList.filter((o) => o.orderStatus === "IN_DELIVERY")
          .length,
        delivered: orderList.filter((o) => o.orderStatus === "DELIVERED")
          .length,
      },
      urgentTasks: {
        delayRequests: orderList.filter(
          (o) => o.orderStatus === "PREPARING" && o.isDelayed
        ).length,
        longTermUndelivered: 0,
      },
    };
  }, [orders]);

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

  // ===== 메뉴 핸들러 =====
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    orderNumber: string,
    status: OrderStatus
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderNumber(orderNumber);
    setSelectedOrderStatus(status);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderNumber("");
  };

  // ===== 액션 핸들러들 =====
  const handleDetailView = (orderNumber: string) => {
    openDetailModal(orderNumber);
    handleMenuClose();
  };

  const handleStatusChange = (
    orderNumber: string,
    currentStatus: OrderStatus
  ) => {
    openStatusUpdateModal(orderNumber, currentStatus);
    handleMenuClose();
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    try {
      await deleteOrder({ orderNumber });
      showSnackbar("주문이 삭제되었습니다.", "success");
    } catch (error) {
      showSnackbar("주문 삭제에 실패했습니다.", "error");
    }
    handleMenuClose();
  };

  const handleSync = async () => {
    try {
      const result = await syncShipmentStatus();
      if (result && result.updatedOrders !== undefined) {
        showSnackbar(
          `배송 상태가 동기화되었습니다. (${result.updatedOrders}건 업데이트)`,
          "success"
        );
      } else {
        showSnackbar("배송 상태가 동기화되었습니다.", "success");
      }
    } catch (error) {
      showSnackbar("배송 상태 동기화에 실패했습니다.", "error");
    }
  };

  // ===== 탭별 필터링된 주문 데이터 =====
  const getFilteredOrdersForTab = (tabIndex: number) => {
    if (!orders?.orders) return [];

    switch (tabIndex) {
      case 0: // 출고 지연 요청 관리
        return orders.orders.filter(
          (order) => order.orderStatus === "PREPARING" && order.isDelayed
        );
      case 1: // 주문 현황별 관리
        return orders.orders;
      case 2: // 주문 검색 및 필터링
        let filtered = orders.orders;

        if (filters.statusFilter !== "ALL") {
          filtered = filtered.filter(
            (order) => order.orderStatus === filters.statusFilter
          );
        }

        if (filters.searchKeyword) {
          const keyword = filters.searchKeyword.toLowerCase();
          filtered = filtered.filter((order) => {
            switch (filters.searchType) {
              case "orderNumber":
                return order.orderNumber.toLowerCase().includes(keyword);
              case "buyerName":
                return order.buyerName.toLowerCase().includes(keyword);
              case "productName":
                // 실제 데이터 구조에 맞게 수정 필요
                return order.orderNumber.toLowerCase().includes(keyword); // 임시로 orderNumber 사용
              default:
                return true;
            }
          });
        }

        return filtered;
      default:
        return orders.orders;
    }
  };

  // ===== 대시보드 상태 카드 컴포넌트 =====
  const StatusCard: React.FC<{
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    urgent?: boolean;
    urgentLabel?: string;
    description: string;
    onClick?: () => void;
  }> = ({
    title,
    count,
    icon,
    color,
    bgColor,
    urgent,
    urgentLabel,
    description,
    onClick,
  }) => (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : {},
        border: `1px solid ${BRAND_COLORS.BORDER}`,
        position: "relative",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {icon}
          </Box>
          {urgent && urgentLabel && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 16 }} />}
              label={urgentLabel}
              color="error"
              size="small"
              variant="filled"
            />
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY, mb: 1 }}
        >
          {count.toLocaleString()}
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY, mb: 1 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: BRAND_COLORS.TEXT_SECONDARY, lineHeight: 1.4 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  // ===== 주문 상태 칩 컴포넌트 =====
  const OrderStatusChip: React.FC<{
    status: OrderStatus;
    isDelayed?: boolean;
  }> = ({ status, isDelayed }) => {
    const statusInfo = ORDER_STATUS_INFO_MAP[status];

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
        {isDelayed && (
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
            label="지연"
            color="error"
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        )}
      </Box>
    );
  };

  // ===== 테이블 컴포넌트 =====
  const OrderTable: React.FC<{
    data: SellerOrderItem[];
    showDelayInfo?: boolean;
  }> = ({ data, showDelayInfo = false }) => (
    <TableContainer
      component={Paper}
      sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT }}>
            <TableCell sx={{ fontWeight: 600 }}>주문번호</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>주문일시</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>구매자</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>상품정보</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
            {showDelayInfo && (
              <TableCell sx={{ fontWeight: 600 }}>지연정보</TableCell>
            )}
            <TableCell sx={{ fontWeight: 600 }}>액션</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.orderNumber} hover>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", fontWeight: 600 }}
                >
                  {order.orderNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(
                    order.orderDate || order.createdAt || Date.now()
                  ).toLocaleDateString("ko-KR")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(
                    order.orderDate || order.createdAt || Date.now()
                  ).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: BRAND_COLORS.PRIMARY,
                    }}
                  >
                    {order.buyerName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.buyerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.buyerPhone || "연락처 없음"}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.orderItems[0]?.productName}
                  </Typography>
                  {order.orderItems.length > 1 && (
                    <Typography variant="caption" color="text.secondary">
                      외 {order.orderItems.length - 1}개
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    수량:{" "}
                    {order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                    개
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {order.totalAmount.toLocaleString()}원
                </Typography>
              </TableCell>
              <TableCell>
                <OrderStatusChip
                  status={order.orderStatus}
                  isDelayed={order.isDelayed}
                />
              </TableCell>
              {showDelayInfo && (
                <TableCell>
                  {order.isDelayed && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        사유: {order.delayReason || "미입력"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        예상:{" "}
                        {order.expectedShipDate
                          ? new Date(order.expectedShipDate).toLocaleDateString(
                              "ko-KR"
                            )
                          : "미정"}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              )}
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) =>
                    handleMenuClick(e, order.orderNumber, order.orderStatus)
                  }
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            주문 내역이 없습니다.
          </Typography>
        </Box>
      )}
    </TableContainer>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* 페이지 헤더 */}
      <PageHeader title="주문/배송 관리" />

      {/* 대시보드 현황 카드 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
        >
          주문 현황 대시보드
        </Typography>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={2.4}>
            <StatusCard
              title="결제완료"
              count={orderStats.orderSummary.paymentCompleted}
              icon={<PaymentIcon sx={{ fontSize: 32 }} />}
              color={BRAND_COLORS.PRIMARY}
              bgColor={`${BRAND_COLORS.PRIMARY}15`}
              description="결제가 완료되어 상품 준비를 시작할 수 있는 주문"
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatusCard
              title="상품준비중"
              count={orderStats.orderSummary.preparing}
              icon={<InventoryIcon sx={{ fontSize: 32 }} />}
              color="#f57c00"
              bgColor="#fff3e0"
              urgent={orderStats.urgentTasks.delayRequests > 0}
              urgentLabel={`지연 ${orderStats.urgentTasks.delayRequests}건`}
              description="현재 상품을 준비하고 있는 주문"
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatusCard
              title="배송준비완료"
              count={orderStats.orderSummary.readyForShipment}
              icon={<ShippingIcon sx={{ fontSize: 32 }} />}
              color="#1976d2"
              bgColor="#e3f2fd"
              description="배송 준비가 완료된 주문"
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatusCard
              title="배송중"
              count={orderStats.orderSummary.inTransit}
              icon={<TransitIcon sx={{ fontSize: 32 }} />}
              color="#9c27b0"
              bgColor="#f3e5f5"
              description="현재 배송 중인 주문"
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatusCard
              title="배송완료"
              count={orderStats.orderSummary.delivered}
              icon={<DeliveredIcon sx={{ fontSize: 32 }} />}
              color="#4caf50"
              bgColor="#e8f5e8"
              description="배송이 완료된 주문"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 탭 인터페이스 */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
            borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 60,
            },
            "& .Mui-selected": {
              color: BRAND_COLORS.PRIMARY,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: BRAND_COLORS.PRIMARY,
              height: 3,
            },
          }}
        >
          <Tab
            icon={<WarningIcon />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                출고 지연 요청 관리
                {orderStats.urgentTasks.delayRequests > 0 && (
                  <Chip
                    label={orderStats.urgentTasks.delayRequests}
                    color="error"
                    size="small"
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Box>
            }
            iconPosition="start"
          />
          <Tab
            icon={<AssessmentIcon />}
            label="주문 현황별 관리"
            iconPosition="start"
          />
          <Tab
            icon={<SearchIcon />}
            label="주문 검색 및 필터링"
            iconPosition="start"
          />
        </Tabs>

        {/* 출고 지연 요청 관리 탭 */}
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
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                긴급 처리가 필요한 주문 ({getFilteredOrdersForTab(0).length}건)
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  actionLoading ? <CircularProgress size={16} /> : <SyncIcon />
                }
                onClick={handleSync}
                disabled={actionLoading}
                sx={{
                  borderColor: BRAND_COLORS.PRIMARY,
                  color: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    borderColor: BRAND_COLORS.PRIMARY_HOVER,
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  },
                }}
              >
                {actionLoading ? "동기화 중..." : "상태 동기화"}
              </Button>
            </Box>

            {orderStats.urgentTasks.delayRequests > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>{orderStats.urgentTasks.delayRequests}건</strong>의
                  출고 지연 요청이 있습니다. 빠른 처리가 필요합니다.
                </Typography>
              </Alert>
            )}

            <OrderTable
              data={getFilteredOrdersForTab(0)}
              showDelayInfo={true}
            />
          </Box>
        </TabPanel>

        {/* 주문 현황별 관리 탭 */}
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
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                전체 주문 관리 ({orders?.totalElements || 0}건)
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  actionLoading ? <CircularProgress size={16} /> : <SyncIcon />
                }
                onClick={handleSync}
                disabled={actionLoading}
                sx={{
                  borderColor: BRAND_COLORS.PRIMARY,
                  color: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    borderColor: BRAND_COLORS.PRIMARY_HOVER,
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  },
                }}
              >
                {actionLoading ? "동기화 중..." : "상태 동기화"}
              </Button>
            </Box>

            <OrderTable data={getFilteredOrdersForTab(1)} />

            {/* 페이지네이션 */}
            {orders && (
              <TablePagination
                component="div"
                count={orders.totalElements}
                page={orders.currentPage}
                onPageChange={(_, newPage) => {
                  // 페이지 변경 로직 - 실제 구현에 맞게 수정 필요
                  console.log("Page changed to:", newPage);
                }}
                rowsPerPage={orders.pageSize}
                onRowsPerPageChange={(e) => {
                  // 페이지 사이즈 변경 로직 - 실제 구현에 맞게 수정 필요
                  console.log(
                    "Page size changed to:",
                    parseInt(e.target.value, 10)
                  );
                }}
                labelRowsPerPage="페이지당 행 수:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / 총 ${count}개`
                }
                sx={{
                  borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                }}
              />
            )}
          </Box>
        </TabPanel>

        {/* 주문 검색 및 필터링 탭 */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            {/* 검색 필터 섹션 */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                border: `1px solid ${BRAND_COLORS.BORDER}`,
                backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                }}
              >
                주문 검색 및 필터
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>검색 조건</InputLabel>
                    <Select
                      value={filters.searchType}
                      onChange={(e) => setFilter("searchType", e.target.value)}
                      label="검색 조건"
                    >
                      <MenuItem value="orderNumber">주문번호</MenuItem>
                      <MenuItem value="buyerName">구매자명</MenuItem>
                      <MenuItem value="productName">상품명</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="검색어를 입력하세요"
                    value={filters.searchKeyword}
                    onChange={(e) => setFilter("searchKeyword", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: filters.searchKeyword && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setFilter("searchKeyword", "")}
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>주문 상태</InputLabel>
                    <Select
                      value={filters.statusFilter}
                      onChange={(e) =>
                        setFilter("statusFilter", e.target.value)
                      }
                      label="주문 상태"
                    >
                      <MenuItem value="ALL">전체 상태</MenuItem>
                      <MenuItem value="PAYMENT_COMPLETED">결제완료</MenuItem>
                      <MenuItem value="PREPARING">상품준비중</MenuItem>
                      <MenuItem value="READY_FOR_SHIPMENT">
                        배송준비완료
                      </MenuItem>
                      <MenuItem value="IN_DELIVERY">배송중</MenuItem>
                      <MenuItem value="DELIVERED">배송완료</MenuItem>
                      <MenuItem value="CANCELLED">주문취소</MenuItem>
                      <MenuItem value="REFUNDED">환불완료</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={2}>
                  <Stack direction="row" spacing={1}>
                    <PrimaryButton
                      fullWidth
                      size="small"
                      startIcon={<SearchIcon />}
                      onClick={() => {
                        // 검색 로직 - 실제 구현에 맞게 수정 필요
                        console.log("Search with filters:", filters);
                      }}
                    >
                      검색
                    </PrimaryButton>
                    <SecondaryButton size="small" onClick={resetFilters}>
                      초기화
                    </SecondaryButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* 검색 결과 */}
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
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                검색 결과 ({getFilteredOrdersForTab(2).length}건)
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  actionLoading ? <CircularProgress size={16} /> : <SyncIcon />
                }
                onClick={handleSync}
                disabled={actionLoading}
                sx={{
                  borderColor: BRAND_COLORS.PRIMARY,
                  color: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    borderColor: BRAND_COLORS.PRIMARY_HOVER,
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  },
                }}
              >
                {actionLoading ? "동기화 중..." : "상태 동기화"}
              </Button>
            </Box>

            <OrderTable data={getFilteredOrdersForTab(2)} />
          </Box>
        </TabPanel>
      </Paper>

      {/* 액션 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            border: `1px solid ${BRAND_COLORS.BORDER}`,
            boxShadow: 3,
          },
        }}
      >
        <MenuItem onClick={() => handleDetailView(selectedOrderNumber)}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} />
          상세 보기
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleStatusChange(selectedOrderNumber, selectedOrderStatus)
          }
        >
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          상태 변경
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleDeleteOrder(selectedOrderNumber)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          주문 삭제
        </MenuItem>
      </Menu>

      {/* 모달들 */}
      {modals.detail.open && modals.detail.orderNumber && (
        <OrderDetailModal
          open={modals.detail.open}
          onClose={closeDetailModal}
          orderNumber={modals.detail.orderNumber}
        />
      )}

      {modals.statusUpdate.open && modals.statusUpdate.orderNumber && (
        <OrderStatusUpdateModal
          open={modals.statusUpdate.open}
          onClose={closeStatusUpdateModal}
          orderNumber={modals.statusUpdate.orderNumber}
          currentStatus={modals.statusUpdate.currentStatus!}
          onSuccess={() => {
            refreshOrders();
            showSnackbar("주문 상태가 변경되었습니다.", "success");
          }}
        />
      )}

      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 에러 처리 */}
      {ordersError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof ordersError === "string"
            ? ordersError
            : "주문 목록을 불러오는 중 오류가 발생했습니다."}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof actionError === "string"
            ? actionError
            : "작업 처리 중 오류가 발생했습니다."}
        </Alert>
      )}
    </Box>
  );
};

export default OrderShippingManagement;
