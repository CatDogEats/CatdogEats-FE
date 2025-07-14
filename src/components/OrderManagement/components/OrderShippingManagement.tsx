// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useEffect } from "react";
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
  Card,
  CardContent,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Schedule as ScheduleIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import Grid from "@mui/material/GridLegacy";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import {
  useSellerOrderManagement,
  useSellerOrderDetail,
} from "@/hooks/useSellerOrders";
import type {
  OrderStatus,
  SellerOrderItem,
  CourierCompany,
  OrderStatusUpdateRequest,
} from "@/types/sellerOrder.types";
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
 * 주문 배송 관리 메인 컴포넌트 - 프로토타입 완전 복원 (모든 UI 통합)
 *
 * 탭 구조:
 * 0. 출고 지연 요청 관리 (긴급 처리가 필요한 주문)
 * 1. 주문 현황별 관리 (전체 주문 목록 및 상태별 관리)
 * 2. 주문 검색 및 필터링 (다양한 조건으로 주문 검색)
 */
const OrderShippingManagement: React.FC = () => {
  // ===== 탭 상태 =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== 모달 상태 관리 (직접 관리) =====
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState<OrderStatus>("PAYMENT_COMPLETED");

  // ===== 검색/필터 상태 (직접 관리) =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState("orderNumber");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // ===== UI 상태 =====
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // ===== 테이블 메뉴 상태 =====
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenuOrderNumber, setCurrentMenuOrderNumber] =
    useState<string>("");
  const [currentMenuOrderStatus, setCurrentMenuOrderStatus] =
    useState<OrderStatus>("PAYMENT_COMPLETED");

  // ===== 페이지네이션 상태 =====
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy] = useState("createdAt,desc");

  // ===== 고급 검색 상태 =====
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // ===== 데이터 및 액션 훅 사용 (실제 API 연동) =====
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
  } = useSellerOrderManagement(page, sortBy);

  // ===== 주문 상세 정보 훅 (모달용) =====
  const {
    orderDetail,
    loading: detailLoading,
    error: detailError,
  } = useSellerOrderDetail(selectedOrderNumber);

  // ===== 헬퍼 함수들 =====
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDetailDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

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
        longTermUndelivered: orderList.filter((o) => {
          const daysSinceOrder =
            (Date.now() - new Date(o.orderDate).getTime()) /
            (1000 * 60 * 60 * 24);
          return (
            daysSinceOrder > 7 &&
            !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.orderStatus)
          );
        }).length,
      },
    };
  }, [orders]);

  // ===== 이벤트 핸들러들 =====
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDetailView = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setDetailModalOpen(true);
  };

  const handleStatusChange = (
    orderNumber: string,
    currentStatus: OrderStatus
  ) => {
    setSelectedOrderNumber(orderNumber);
    setSelectedOrderStatus(currentStatus);
    setStatusUpdateModalOpen(true);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    orderNumber: string,
    orderStatus: OrderStatus
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentMenuOrderNumber(orderNumber);
    setCurrentMenuOrderStatus(orderStatus);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentMenuOrderNumber("");
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    try {
      await deleteOrder(orderNumber);
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

  const handleSearch = () => {
    refreshOrders();
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSearchType("orderNumber");
    setStatusFilter("ALL");
    setDateRange("30days");
    setStartDate(null);
    setEndDate(null);
    refreshOrders();
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

        if (statusFilter !== "ALL") {
          filtered = filtered.filter(
            (order) => order.orderStatus === statusFilter
          );
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          filtered = filtered.filter((order) => {
            switch (searchType) {
              case "orderNumber":
                return order.orderNumber.toLowerCase().includes(keyword);
              case "buyerName":
                return order.buyerName.toLowerCase().includes(keyword);
              case "productName":
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
    icon: React.ReactElement<SvgIconProps>;
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
              boxShadow: "0 8px 25px rgba(239, 153, 66, 0.15)",
            }
          : {},
        border: `1px solid ${BRAND_COLORS.BORDER}`,
        position: "relative",
        overflow: "visible",
      }}
      onClick={onClick}
    >
      {urgent && (
        <Chip
          label={urgentLabel}
          size="small"
          sx={{
            position: "absolute",
            top: -8,
            right: 12,
            backgroundColor: "#ff4444",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      )}
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
              p: 1.5,
              borderRadius: 2,
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
          >
            {count.toLocaleString()}
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 1, color: BRAND_COLORS.TEXT_PRIMARY }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  // ===== 주문 목록 테이블 컴포넌트 =====
  const OrderListTable: React.FC<{
    data: SellerOrderItem[];
    loading: boolean;
  }> = ({ data, loading }) => (
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
            <TableCell sx={{ fontWeight: 600 }}>주문금액</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>주문상태</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>배송정보</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress
                  size={32}
                  sx={{ color: BRAND_COLORS.PRIMARY }}
                />
                <Typography sx={{ mt: 2, color: BRAND_COLORS.TEXT_SECONDARY }}>
                  주문 정보를 불러오고 있습니다...
                </Typography>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} sx={{ textAlign: "center", py: 6 }}>
                <Typography
                  variant="body1"
                  sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                >
                  주문 내역이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((order) => (
              <TableRow
                key={order.orderNumber}
                hover
                sx={{
                  "&:hover": { backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT },
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: BRAND_COLORS.PRIMARY }}
                  >
                    {order.orderNumber}
                  </Typography>
                  {order.isDelayed && (
                    <Chip
                      label="지연"
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: "#ff4444",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.orderDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.buyerName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                    >
                      {order.recipientName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    총 {order.orderItemCount}개 상품
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      ORDER_STATUS_INFO_MAP[order.orderStatus]?.label ||
                      order.orderStatus
                    }
                    color={
                      ORDER_STATUS_INFO_MAP[order.orderStatus]?.color as any
                    }
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  {order.trackingNumber ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.courierCompany}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                      >
                        {order.trackingNumber}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                    >
                      미등록
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) =>
                      handleMenuClick(e, order.orderNumber, order.orderStatus)
                    }
                    sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={orders?.totalElements || 0}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / 총 ${count}개`
        }
      />
    </TableContainer>
  );

  // ===== 검색 필터 컴포넌트 =====
  const SearchFilters: React.FC = () => (
    <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                label="검색 조건"
              >
                <MenuItem value="orderNumber">주문번호</MenuItem>
                <MenuItem value="buyerName">구매자명</MenuItem>
                <MenuItem value="productName">상품명</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="검색어"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색할 내용을 입력하세요"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: BRAND_COLORS.TEXT_SECONDARY }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>주문상태</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as OrderStatus | "ALL")
                }
                label="주문상태"
              >
                <MenuItem value="ALL">전체</MenuItem>
                <MenuItem value="PAYMENT_COMPLETED">결제완료</MenuItem>
                <MenuItem value="PREPARING">상품준비중</MenuItem>
                <MenuItem value="READY_FOR_SHIPMENT">배송준비완료</MenuItem>
                <MenuItem value="IN_DELIVERY">배송중</MenuItem>
                <MenuItem value="DELIVERED">배송완료</MenuItem>
                <MenuItem value="CANCELLED">주문취소</MenuItem>
                <MenuItem value="REFUNDED">환불완료</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>조회 기간</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="조회 기간"
              >
                <MenuItem value="today">오늘</MenuItem>
                <MenuItem value="7days">최근 7일</MenuItem>
                <MenuItem value="30days">최근 30일</MenuItem>
                <MenuItem value="90days">최근 90일</MenuItem>
                <MenuItem value="custom">직접 선택</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <PrimaryButton
              fullWidth
              onClick={handleSearch}
              disabled={ordersLoading}
              startIcon={
                ordersLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SearchIcon />
                )
              }
              sx={{ height: "40px" }}
            >
              검색
            </PrimaryButton>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <SecondaryButton
              fullWidth
              onClick={handleResetFilters}
              startIcon={<ClearIcon />}
              sx={{ height: "40px" }}
            >
              초기화
            </SecondaryButton>
          </Grid>
        </Grid>

        <Accordion
          expanded={advancedSearchOpen}
          onChange={() => setAdvancedSearchOpen(!advancedSearchOpen)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              고급 검색 옵션
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {dateRange === "custom" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ko}
                    >
                      <DatePicker
                        label="시작일"
                        value={startDate}
                        onChange={setStartDate}
                        slotProps={{
                          textField: { fullWidth: true, size: "small" },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ko}
                    >
                      <DatePicker
                        label="종료일"
                        value={endDate}
                        onChange={setEndDate}
                        slotProps={{
                          textField: { fullWidth: true, size: "small" },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );

  // ===== 주문 상세 모달 컴포넌트 =====
  const OrderDetailModal: React.FC = () => (
    <Dialog
      open={detailModalOpen}
      onClose={() => setDetailModalOpen(false)}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          maxHeight: "90vh",
          border: `2px solid ${BRAND_COLORS.BORDER}`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.PRIMARY_HOVER} 100%)`,
          color: "white",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <ReceiptIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                주문 상세 정보
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                주문번호: {selectedOrderNumber}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton
          onClick={() => setDetailModalOpen(false)}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "white",
            backgroundColor: "rgba(255,255,255,0.1)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {detailLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={50} sx={{ color: BRAND_COLORS.PRIMARY }} />
            <Typography variant="body1" color="text.secondary">
              주문 정보를 불러오는 중...
            </Typography>
          </Box>
        ) : detailError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          </Box>
        ) : orderDetail ? (
          <Box sx={{ p: 3 }}>
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <PersonIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    주문 정보
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      주문일시
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDetailDate(orderDetail.orderDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      구매자명
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {orderDetail.buyerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      주문상태
                    </Typography>
                    <Chip
                      label={
                        ORDER_STATUS_INFO_MAP[orderDetail.orderStatus]?.label
                      }
                      color={
                        ORDER_STATUS_INFO_MAP[orderDetail.orderStatus]
                          ?.color as any
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      최종 결제금액
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: BRAND_COLORS.PRIMARY }}
                    >
                      {formatCurrency(
                        orderDetail.orderSummary.finalPaymentAmount
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <LocationIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    배송 정보
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      수령인
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {orderDetail.recipientInfo.recipientName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      연락처
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatPhoneNumber(
                        orderDetail.recipientInfo.recipientPhone
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      배송주소
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {orderDetail.recipientInfo.shippingAddress}
                    </Typography>
                    {orderDetail.recipientInfo.addressDetail && (
                      <Typography variant="body2" color="text.secondary">
                        {orderDetail.recipientInfo.addressDetail}
                      </Typography>
                    )}
                  </Grid>
                  {orderDetail.recipientInfo.deliveryRequest && (
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        배송 요청사항
                      </Typography>
                      <Typography variant="body1">
                        {orderDetail.recipientInfo.deliveryRequest}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <ShoppingBagIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    주문 상품
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>상품명</TableCell>
                        <TableCell align="center">수량</TableCell>
                        <TableCell align="right">단가</TableCell>
                        <TableCell align="right">소계</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetail.orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                src={item.productImage}
                                sx={{ width: 48, height: 48, borderRadius: 2 }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {item.productName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item.sellerName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.quantity}개
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(item.unitPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatCurrency(item.totalPrice)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ maxWidth: 400, ml: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">상품 금액</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        orderDetail.orderSummary.totalProductAmount
                      )}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">배송비</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        orderDetail.orderSummary.totalShippingFee
                      )}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">할인 금액</Typography>
                    <Typography variant="body2" sx={{ color: "#f44336" }}>
                      -
                      {formatCurrency(
                        orderDetail.orderSummary.totalDiscountAmount
                      )}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      최종 결제금액
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: BRAND_COLORS.PRIMARY }}
                    >
                      {formatCurrency(
                        orderDetail.orderSummary.finalPaymentAmount
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{ p: 3, borderTop: `1px solid ${BRAND_COLORS.BORDER}` }}
      >
        <SecondaryButton onClick={() => setDetailModalOpen(false)}>
          닫기
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            setDetailModalOpen(false);
            handleStatusChange(selectedOrderNumber, selectedOrderStatus);
          }}
          startIcon={<EditIcon />}
        >
          상태 변경
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );

  // ===== 주문 상태 변경 모달 컴포넌트 =====
  const OrderStatusUpdateModal: React.FC = () => {
    // 상태별 선택 가능한 다음 상태들
    const getAvailableStatuses = (currentStatus: OrderStatus) => {
      switch (currentStatus) {
        case "PAYMENT_COMPLETED":
          return [{ value: "PREPARING", label: "상품준비중으로 변경" }];
        case "PREPARING":
          return [
            { value: "PREPARING", label: "상품준비중 유지 (출고 지연 처리)" },
            { value: "READY_FOR_SHIPMENT", label: "배송준비완료" },
          ];
        case "READY_FOR_SHIPMENT":
          return [{ value: "IN_DELIVERY", label: "배송중 (운송장 등록)" }];
        case "IN_DELIVERY":
          return [{ value: "DELIVERED", label: "배송완료" }];
        default:
          return [];
      }
    };

    // 택배사 옵션
    const COURIER_OPTIONS: { value: CourierCompany; label: string }[] = [
      { value: "CJ_DAEHAN", label: "CJ대한통운" },
      { value: "HANJIN", label: "한진택배" },
      { value: "LOTTE", label: "롯데택배" },
      { value: "LOGEN", label: "로젠택배" },
      { value: "POST_OFFICE", label: "우체국택배" },
    ];

    // 상태별 폼 상태
    const [newStatus, setNewStatus] =
      useState<OrderStatus>(selectedOrderStatus);
    const [delayReason, setDelayReason] = useState<string>("");
    const [expectedShipDate, setExpectedShipDate] = useState<Date | null>(null);
    const [courierCompany, setCourierCompany] = useState<CourierCompany | "">(
      ""
    );
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const availableStatuses = getAvailableStatuses(selectedOrderStatus);
    const isDelayProcess =
      newStatus === "PREPARING" && selectedOrderStatus === "PREPARING";
    const isShippingProcess = newStatus === "IN_DELIVERY";

    // 폼 제출 처리
    const handleSubmit = async () => {
      const errors: string[] = [];

      if (!newStatus) errors.push("변경할 상태를 선택해주세요.");

      if (isShippingProcess) {
        if (!courierCompany) errors.push("택배사를 선택해주세요.");
        if (!trackingNumber.trim()) errors.push("운송장번호를 입력해주세요.");
      }

      if (isDelayProcess) {
        if (!delayReason.trim()) errors.push("지연 사유를 입력해주세요.");
        if (!expectedShipDate) errors.push("예상 출고일을 선택해주세요.");
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      try {
        const updateRequest: OrderStatusUpdateRequest = {
          orderNumber: selectedOrderNumber,
          newStatus,
          ...(isShippingProcess && {
            courierCompany: courierCompany as CourierCompany,
            trackingNumber: trackingNumber.trim(),
          }),
          ...(isDelayProcess && {
            reason: delayReason.trim(),
            isDelayed: true,
            expectedShipDate: expectedShipDate?.toISOString(),
          }),
        };

        await updateOrderStatus(updateRequest);
        showSnackbar("주문 상태가 변경되었습니다.", "success");
        setStatusUpdateModalOpen(false);
        refreshOrders();
      } catch (error) {
        showSnackbar("상태 변경에 실패했습니다.", "error");
        console.error("상태 변경 실패:", error);
      }
    };

    // 모달 열릴 때 초기화
    useEffect(() => {
      if (statusUpdateModalOpen) {
        setNewStatus(selectedOrderStatus);
        setDelayReason("");
        setExpectedShipDate(null);
        setCourierCompany("");
        setTrackingNumber("");
        setValidationErrors([]);
      }
    }, [statusUpdateModalOpen, selectedOrderStatus]);

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Dialog
          open={statusUpdateModalOpen}
          onClose={() => setStatusUpdateModalOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
              maxHeight: "90vh",
              border: `2px solid ${BRAND_COLORS.BORDER}`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.PRIMARY_HOVER} 100%)`,
              color: "white",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <EditIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    주문 상태 변경
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    주문번호: {selectedOrderNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  현재 주문 상태
                </Typography>
                <Chip
                  label={ORDER_STATUS_INFO_MAP[selectedOrderStatus]?.label}
                  color={
                    ORDER_STATUS_INFO_MAP[selectedOrderStatus]?.color as any
                  }
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  변경할 상태 선택
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>새로운 상태</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as OrderStatus)
                    }
                    label="새로운 상태"
                  >
                    {availableStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {isDelayProcess && (
              <Card sx={{ mb: 3, border: `1px solid #ff9800` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <ScheduleIcon sx={{ color: "#ff9800" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      출고 지연 처리
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="지연 사유"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="출고가 지연되는 사유를 입력해주세요"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <DatePicker
                        label="예상 출고일"
                        value={expectedShipDate}
                        onChange={setExpectedShipDate}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {isShippingProcess && (
              <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.PRIMARY}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <ShippingIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      운송장 정보 등록
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>택배사</InputLabel>
                        <Select
                          value={courierCompany}
                          onChange={(e) =>
                            setCourierCompany(e.target.value as CourierCompany)
                          }
                          label="택배사"
                        >
                          {COURIER_OPTIONS.map((courier) => (
                            <MenuItem key={courier.value} value={courier.value}>
                              {courier.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="운송장 번호"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="운송장 번호를 입력해주세요"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </DialogContent>

          <DialogActions
            sx={{ p: 3, borderTop: `1px solid ${BRAND_COLORS.BORDER}` }}
          >
            <SecondaryButton onClick={() => setStatusUpdateModalOpen(false)}>
              취소
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={actionLoading}
              startIcon={
                actionLoading ? <CircularProgress size={16} /> : <SendIcon />
              }
            >
              {actionLoading ? "처리 중..." : "상태 변경"}
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1, color: BRAND_COLORS.TEXT_PRIMARY }}
        >
          주문 배송 관리
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
          >
            주문 현황을 관리하고 배송 상태를 추적할 수 있습니다
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
      </Box>

      {/* 대시보드 개요 - 탭 0과 1에서만 표시 */}
      {activeTab <= 1 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: BRAND_COLORS.TEXT_PRIMARY }}
          >
            주문 현황 개요
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatusCard
                title="결제완료"
                count={orderStats.orderSummary.paymentCompleted}
                icon={<PaymentIcon />}
                color={BRAND_COLORS.PRIMARY}
                bgColor={`${BRAND_COLORS.PRIMARY}15`}
                description="결제가 완료된 주문"
                onClick={() => setActiveTab(1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatusCard
                title="상품준비중"
                count={orderStats.orderSummary.preparing}
                icon={<InventoryIcon />}
                color="#ff9800"
                bgColor="#ff980015"
                description="상품을 준비하고 있는 주문"
                urgent={orderStats.urgentTasks.delayRequests > 0}
                urgentLabel={`지연 ${orderStats.urgentTasks.delayRequests}건`}
                onClick={() => setActiveTab(0)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatusCard
                title="배송준비완료"
                count={orderStats.orderSummary.readyForShipment}
                icon={<ShippingIcon />}
                color="#2196f3"
                bgColor="#2196f315"
                description="배송 준비가 완료된 주문"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatusCard
                title="배송중"
                count={orderStats.orderSummary.inTransit}
                icon={<TransitIcon />}
                color="#9c27b0"
                bgColor="#9c27b015"
                description="현재 배송 중인 주문"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatusCard
                title="배송완료"
                count={orderStats.orderSummary.delivered}
                icon={<DeliveredIcon />}
                color="#4caf50"
                bgColor="#4caf5015"
                description="배송이 완료된 주문"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
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
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon sx={{ fontSize: 20 }} />
                출고 지연 요청 관리
                {orderStats.urgentTasks.delayRequests > 0 && (
                  <Chip
                    label={orderStats.urgentTasks.delayRequests}
                    size="small"
                    sx={{
                      backgroundColor: "#ff4444",
                      color: "white",
                      minWidth: 20,
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssessmentIcon sx={{ fontSize: 20 }} />
                주문 현황별 관리
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SearchIcon sx={{ fontSize: 20 }} />
                주문 검색 및 필터링
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* 탭 컨텐츠 */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              border: `1px solid #ff9800`,
              backgroundColor: "#fff3e0",
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                출고 지연 요청이 {orderStats.urgentTasks.delayRequests}건
                있습니다
              </Typography>
              <Typography variant="body2">
                빠른 처리가 필요한 주문들입니다. 고객에게 지연 사유를 안내하고
                예상 출고일을 업데이트해주세요.
              </Typography>
            </Box>
          </Alert>
        </Box>
        <OrderListTable
          data={getFilteredOrdersForTab(0)}
          loading={ordersLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <OrderListTable
          data={getFilteredOrdersForTab(1)}
          loading={ordersLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SearchFilters />
        <OrderListTable
          data={getFilteredOrdersForTab(2)}
          loading={ordersLoading}
        />
      </TabPanel>

      {/* 테이블 액션 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            border: `1px solid ${BRAND_COLORS.BORDER}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleDetailView(currentMenuOrderNumber);
            handleMenuClose();
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
          상세 보기
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleStatusChange(currentMenuOrderNumber, currentMenuOrderStatus);
            handleMenuClose();
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <EditIcon sx={{ fontSize: 18 }} />
          상태 변경
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteOrder(currentMenuOrderNumber)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#f44336",
          }}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
          주문 삭제
        </MenuItem>
      </Menu>

      {/* 모달들 */}
      <OrderDetailModal />
      <OrderStatusUpdateModal />

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
          sx={{
            border: `1px solid ${BRAND_COLORS.BORDER}`,
            backgroundColor: "white",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 에러 표시 */}
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
