// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { Warning as WarningIcon, Info as InfoIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";

// ===== 정확한 타입 정의 =====

// ✅ 백엔드와 정확히 일치하는 타입 정의
interface SellerOrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SellerOrderSummary {
  orderNumber: string;
  orderStatus: string;
  orderDate: string;
  buyerName: string;
  maskedBuyerName: string;
  orderItems: SellerOrderItem[]; // ✅ 이것이 핵심! orderItems 배열이 여기에 있음
  orderSummary: {
    itemCount: number;
    totalAmount: number;
  };
  shipmentInfo: {
    courier?: string;
    trackingNumber?: string;
    isShipped: boolean;
    shippedAt?: string;
  };
}

interface SellerOrderListResponse {
  orders: SellerOrderSummary[]; // ✅ SellerOrderSummary 배열 (SellerOrderItem 배열이 아님!)
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 프로토타입 Order 타입
interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  productName: string;
  quantity: number;
  amount: number;
  shippingStatus: string;
  customerPhone?: string;
  shippingAddress: string;
  trackingNumber?: string;
  shippingCompany?: string;
  delayReason?: string;
  isDirect?: boolean;
  orderItems?: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface OrderFilter {
  dateRange: string;
  startDate: string;
  endDate: string;
  shippingStatus: string[];
  searchCondition: "customer_name" | "order_number" | "product_name";
  searchKeyword: string;
  directShippingOnly: boolean;
}

interface OrderSummary {
  paymentCompleted: number;
  preparing: number;
  readyForDelivery: number;
  inTransit: number;
  delivered: number;
}

// API 연동 imports
import {
  useSellerOrderManagement,
  useSellerOrderDetail,
} from "@/hooks/useSellerOrders";
import type {
  OrderStatus as APIOrderStatus,
  CourierCompany,
} from "@/types/sellerOrder.types";

import { ORDER_STATUS_INFO_MAP } from "@/types/sellerOrder.types";

// ===== 데이터 변환 함수들 =====

// API 상태를 프로토타입 상태로 변환
const mapAPIStatusToPrototype = (apiStatus: APIOrderStatus): string => {
  const statusMap: Record<APIOrderStatus, string> = {
    PAYMENT_COMPLETED: "payment_completed",
    PREPARING: "preparing",
    READY_FOR_SHIPMENT: "ready_for_delivery",
    IN_DELIVERY: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "order_cancelled",
    REFUNDED: "order_cancelled",
  };
  return statusMap[apiStatus] || "payment_completed";
};

// 프로토타입 상태를 API 상태로 변환
const mapPrototypeStatusToAPI = (prototypeStatus: string): APIOrderStatus => {
  const statusMap: Record<string, APIOrderStatus> = {
    payment_completed: "PAYMENT_COMPLETED",
    preparing: "PREPARING",
    ready_for_delivery: "READY_FOR_SHIPMENT",
    in_transit: "IN_DELIVERY",
    delivered: "DELIVERED",
    order_cancelled: "CANCELLED",
  };
  return statusMap[prototypeStatus] || "PAYMENT_COMPLETED";
};

// ✅ 정확한 API 데이터 변환 함수 (타입 에러 완전 해결)
const convertAPIDataToPrototype = (
  apiResponse: SellerOrderListResponse
): Order[] => {
  if (!apiResponse?.orders) return [];

  return apiResponse.orders.map((orderSummary: SellerOrderSummary) => ({
    id: orderSummary.orderNumber,
    orderNumber: orderSummary.orderNumber,
    orderDate: orderSummary.orderDate.split("T")[0],
    customerName: orderSummary.buyerName,
    productName:
      orderSummary.orderItems.length > 1
        ? `${orderSummary.orderItems[0]?.productName || "상품"} 외 ${orderSummary.orderItems.length - 1}건`
        : orderSummary.orderItems[0]?.productName || "상품 정보 없음",
    // ✅ 수량 계산: 총 구매 개수 (타입 완전 명시)
    quantity: orderSummary.orderItems.reduce(
      (total: number, item: SellerOrderItem) => total + item.quantity,
      0
    ),
    amount: orderSummary.orderSummary.totalAmount,
    shippingStatus: mapAPIStatusToPrototype(
      orderSummary.orderStatus as APIOrderStatus
    ),
    shippingAddress: `${orderSummary.buyerName} / 연락처`,
    delayReason: undefined,
    orderItems: orderSummary.orderItems.map((item: SellerOrderItem) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  }));
};

// ===== 배송 상태 라벨 매핑 =====
const SHIPPING_STATUS_LABELS = {
  payment_completed: { label: "주문확인", color: "primary" },
  preparing: { label: "상품준비중", color: "warning" },
  delay_requested: { label: "출고지연중", color: "error" },
  ready_for_delivery: { label: "배송준비 완료", color: "info" },
  in_transit: { label: "배송중", color: "secondary" },
  delivered: { label: "배송완료", color: "success" },
  order_cancelled: { label: "주문 취소", color: "error" },
} as const;

// ✅ 상태 변경 유효성 검증 (타입 안전성 확보)
const STATUS_FLOW = {
  payment_completed: ["preparing"] as const,
  preparing: ["ready_for_delivery", "delay_requested"] as const,
  ready_for_delivery: ["in_transit"] as const,
  delay_requested: ["preparing", "ready_for_delivery"] as const,
} as const;

// ===== 메인 컴포넌트 =====
const OrderShippingManagement: React.FC = () => {
  // ✅ API 연동 hooks
  const {
    orders: apiOrdersResponse,
    ordersLoading,
    ordersError,
    updateOrderStatus,
    registerTrackingNumber,
    syncShipmentStatus,
    actionLoading,
  } = useSellerOrderManagement();

  // ===== 상태 관리 =====
  const [filter, setFilter] = useState<OrderFilter>({
    dateRange: "30days",
    startDate: "",
    endDate: "",
    shippingStatus: ["all"],
    searchCondition: "customer_name",
    searchKeyword: "",
    directShippingOnly: false,
  });

  const resetFormData = useCallback(() => {
    setNewStatus("payment_completed");
    setTrackingNumber("");
    setShippingCompany("");
    setIsDelayRequested(false);
    setDelayReason("");
  }, []);

  const [appliedFilter, setAppliedFilter] = useState<OrderFilter>(filter);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 모달 상태들
  const [statusEditDialog, setStatusEditDialog] = useState(false);
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");

  // ✅ 상세 정보 hook (orderNumber가 있을 때만 호출)
  const {
    orderDetail,
    loading: detailLoading,
    error: detailError,
  } = useSellerOrderDetail(selectedOrderNumber);

  // 상태 변경 폼 상태들
  const [newStatus, setNewStatus] = useState<string>("payment_completed");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCompany, setShippingCompany] = useState<CourierCompany | "">(
    ""
  );
  const [isDelayRequested, setIsDelayRequested] = useState(false);
  const [delayReason, setDelayReason] = useState("");

  // UI 상태들
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );

  // 날짜 피커 상태들
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // ===== 상수들 =====
  const COURIER_OPTIONS = [
    { label: "CJ대한통운", value: "CJ_LOGISTICS" },
    { label: "우체국택배", value: "KOREA_POST" },
    { label: "롯데택배", value: "LOTTE_GLOBAL_LOGISTICS" },
    { label: "한진택배", value: "HANJIN" },
    { label: "로젠택배", value: "LOGEN" },
  ] as const;

  // ===== 계산된 값들 =====

  // ✅ API 데이터를 프로토타입 형식으로 변환 (타입 안전성 확보)
  const orders = useMemo(() => {
    if (!apiOrdersResponse) return [];
    return convertAPIDataToPrototype(apiOrdersResponse);
  }, [apiOrdersResponse]);

  // 주문 현황 계산
  const orderSummary: OrderSummary = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        paymentCompleted: 0,
        preparing: 0,
        readyForDelivery: 0,
        inTransit: 0,
        delivered: 0,
      };
    }

    const summary = orders
      .filter((order) => order.shippingStatus !== "order_cancelled")
      .reduce(
        (acc, order) => {
          switch (order.shippingStatus) {
            case "payment_completed":
              acc.paymentCompleted++;
              break;
            case "preparing":
            case "delay_requested":
              acc.preparing++;
              break;
            case "ready_for_delivery":
              acc.readyForDelivery++;
              break;
            case "in_transit":
              acc.inTransit++;
              break;
            case "delivered":
              acc.delivered++;
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

  // 출고 지연 요청 개수 계산
  const delayRequestedCount = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    return orders.filter((order) => order.shippingStatus === "delay_requested")
      .length;
  }, [orders]);

  // 필터링된 주문 계산
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 상태 필터링
    if (
      appliedFilter.shippingStatus.length > 0 &&
      !appliedFilter.shippingStatus.includes("all")
    ) {
      filtered = filtered.filter((order) =>
        appliedFilter.shippingStatus.includes(order.shippingStatus)
      );
    }

    // 검색어 필터링
    if (appliedFilter.searchKeyword) {
      const keyword = appliedFilter.searchKeyword.toLowerCase();

      filtered = filtered.filter((order) => {
        switch (appliedFilter.searchCondition) {
          case "customer_name":
            return order.customerName.toLowerCase().includes(keyword);
          case "order_number":
            return order.orderNumber.toLowerCase().includes(keyword);
          case "product_name":
            return order.productName.toLowerCase().includes(keyword);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, appliedFilter]);

  // ===== 이벤트 핸들러들 =====
  const handleStatusChange = useCallback((value: string) => {
    setNewStatus(value);

    // 상품준비중이 아니면 지연 관련 값 초기화
    if (value !== "preparing") {
      setIsDelayRequested(false);
      setDelayReason("");
    }

    // 배송중이 아니면 운송장 관련 값 초기화
    if (value !== "in_transit") {
      setShippingCompany("");
      setTrackingNumber("");
    }
  }, []);

  // 상태 편집 핸들러
  const handleEditStatus = (order: Order) => {
    resetFormData();
    setSelectedOrder(order);
    setNewStatus(order.shippingStatus);
    setStatusEditDialog(true);
  };

  // ✅ 상세 정보 모달 열기 핸들러
  const handleShowOrderDetail = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setOrderDetailDialog(true);
  };

  // 날짜 범위 클릭 핸들러
  const handleDateRangeClick = (range: string) => {
    setFilter((prev) => ({ ...prev, dateRange: range }));
  };

  // 배송 상태 체크박스 핸들러
  const handleShippingStatusChange = (status: string) => {
    setFilter((prev) => {
      if (status === "all") {
        return { ...prev, shippingStatus: ["all"] };
      }

      let newStatuses = prev.shippingStatus.filter((s) => s !== "all");

      if (newStatuses.includes(status)) {
        newStatuses = newStatuses.filter((s) => s !== status);
      } else {
        newStatuses.push(status);
      }

      if (newStatuses.length === 0) {
        newStatuses = ["all"];
      }

      return { ...prev, shippingStatus: newStatuses };
    });
  };

  // 검색 버튼 핸들러
  const handleSearch = () => {
    setAppliedFilter({ ...filter });
    setPage(0);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    const resetFilter: OrderFilter = {
      dateRange: "30days",
      startDate: "",
      endDate: "",
      shippingStatus: ["all"],
      searchCondition: "customer_name",
      searchKeyword: "",
      directShippingOnly: false,
    };
    setFilter(resetFilter);
    setAppliedFilter(resetFilter);
    setPage(0);
    setStartDate(null);
    setEndDate(null);
  };

  /** 배송중 주문 최신화 -------------------------------------------------- */
  const handleSyncShipmentStatus = async () => {
    if (actionLoading) return; // 중복 호출 방지

    try {
      await syncShipmentStatus(); // ▶️ API 호출
      setAlertMessage("배송중 주문 정보를 최신 상태로 동기화했습니다.");
      setAlertSeverity("success");
    } catch (e) {
      setAlertMessage("배송중 주문 동기화에 실패했습니다.");
      setAlertSeverity("error");
    } finally {
      setShowAlert(true);
    }
  };

  // 상태 변경 저장 핸들러
  const handleSaveStatusChange = async () => {
    if (!selectedOrder) return;

    /** 1) 상태 변경 유효성 검증 ------------------------------------------------ */
    const currentStatus =
      selectedOrder.shippingStatus as keyof typeof STATUS_FLOW;
    const availableStatuses = STATUS_FLOW[currentStatus] || [];

    // delay 요청이면 delay_requested, 아니면 사용자가 고른 newStatus
    const finalStatus = isDelayRequested ? "delay_requested" : newStatus;
    const validStatuses = availableStatuses as readonly string[];

    if (!validStatuses.includes(finalStatus)) {
      setAlertMessage("유효하지 않은 상태 변경입니다.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    /** 2) API 호출 ------------------------------------------------------------ */
    try {
      if (newStatus === "in_transit") {
        /* ── 배송중: 운송장 등록만 호출 ─────────────────────────────────────── */
        if (!shippingCompany || !trackingNumber) {
          setAlertMessage("배송사와 운송장 번호를 모두 입력하세요.");
          setAlertSeverity("error");
          setShowAlert(true);
          return;
        }

        await registerTrackingNumber({
          orderNumber: selectedOrder.orderNumber,
          courierCompany: shippingCompany as CourierCompany,
          trackingNumber,
        });
        // 백엔드가 운송장 등록 → 상태를 자동으로 IN_DELIVERY 로 변경
      } else {
        /* ── 그 외: 일반 상태 변경 ─────────────────────────────────────────── */
        await updateOrderStatus({
          orderNumber: selectedOrder.orderNumber,
          newStatus: mapPrototypeStatusToAPI(
            isDelayRequested ? "preparing" : newStatus
          ),
          reason: delayReason || undefined,
          isDelayed: isDelayRequested,
        });
      }

      /** 3) 성공 후 UI 처리 --------------------------------------------------- */
      setAlertMessage("주문 상태가 성공적으로 변경되었습니다.");
      setAlertSeverity("success");
      setShowAlert(true);
      setStatusEditDialog(false);

      // 폼 초기화
      setSelectedOrder(null);
      setNewStatus("payment_completed");
      setTrackingNumber("");
      setShippingCompany("");
      setIsDelayRequested(false);
      setDelayReason("");
    } catch (error) {
      setAlertMessage("주문 상태 변경에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  // 페이지네이션 핸들러들
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 안전한 숫자 변환 함수
  const safeToLocaleString = (value: any): string => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toLocaleString();
  };

  // ===== 렌더링 =====

  if (ordersLoading) {
    return (
      <Backdrop open={true} sx={{ color: "#fff", zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        {/* 헤더 */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#2d2a27",
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          주문/배송 관리
          {delayRequestedCount > 0 && (
            <Box
              sx={{
                backgroundColor: "#ff4444",
                color: "white",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {delayRequestedCount}
            </Box>
          )}
        </Typography>

        {/* 에러 표시 */}
        {ordersError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            주문 데이터를 불러오는데 실패했습니다: {ordersError.message}
          </Alert>
        )}

        {/* 긴급 알림 */}
        {delayRequestedCount > 0 && (
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{ mb: 3, fontWeight: 500 }}
          >
            출고 지연 요청이 {delayRequestedCount}건 있습니다. 긴급 처리가
            필요합니다!
          </Alert>
        )}

        {/* 주문 현황 대시보드 */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            주문 현황
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {orderSummary.paymentCompleted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  주문확인
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="warning.main"
                  sx={{ fontWeight: 700 }}
                >
                  {orderSummary.preparing}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  상품준비중
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="info.main"
                  sx={{ fontWeight: 700 }}
                >
                  {orderSummary.readyForDelivery}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  배송준비 완료
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="secondary.main"
                  sx={{ fontWeight: 700 }}
                >
                  {orderSummary.inTransit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  배송중
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{ fontWeight: 700 }}
                >
                  {orderSummary.delivered}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  배송완료
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ✅ 주문 검색 섹션 (원래 코드로 복원) */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#2d2a27", mb: 2 }}
          >
            주문 검색
          </Typography>

          {/* 첫째 줄: 주문일 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              주문일
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant={
                  filter.dateRange === "today" ? "contained" : "outlined"
                }
                onClick={() => handleDateRangeClick("today")}
                size="small"
              >
                오늘
              </Button>
              <Button
                variant={
                  filter.dateRange === "7days" ? "contained" : "outlined"
                }
                onClick={() => handleDateRangeClick("7days")}
                size="small"
              >
                7일
              </Button>
              <Button
                variant={
                  filter.dateRange === "30days" ? "contained" : "outlined"
                }
                onClick={() => handleDateRangeClick("30days")}
                size="small"
              >
                30일
              </Button>
              <DatePicker
                label="시작일"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
              <DatePicker
                label="종료일"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
            </Box>
          </Box>

          {/* 둘째 줄: 배송상태 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              배송 상태
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "all", label: "전체" },
                { value: "payment_completed", label: "주문확인" },
                { value: "preparing", label: "상품준비중" },
                { value: "delay_requested", label: "출고지연중" },
                { value: "ready_for_delivery", label: "배송준비 완료" },
                { value: "in_transit", label: "배송중" },
                { value: "delivered", label: "배송완료" },
                { value: "order_cancelled", label: "주문 취소" },
              ].map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={filter.shippingStatus.includes(value)}
                      onChange={() => handleShippingStatusChange(value)}
                      value={value}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </Box>

          {/* 셋째 줄: 검색 조건 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              검색 조건
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filter.searchCondition}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      searchCondition: e.target.value as
                        | "customer_name"
                        | "order_number"
                        | "product_name",
                    }))
                  }
                >
                  <MenuItem value="customer_name">주문자명</MenuItem>
                  <MenuItem value="order_number">주문번호</MenuItem>
                  <MenuItem value="product_name">상품명</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="검색어를 입력하세요"
                value={filter.searchKeyword}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    searchKeyword: e.target.value,
                  }))
                }
                sx={{ minWidth: 250 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  backgroundColor: "#ef9942",
                  "&:hover": { backgroundColor: "#d6853c" },
                  textTransform: "none",
                  height: "40px",
                }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  textTransform: "none",
                  height: "40px",
                }}
              >
                초기화
              </Button>
              <Button
                variant="outlined"
                onClick={handleSyncShipmentStatus}
                disabled={actionLoading} // 로딩 중엔 비활성
                sx={{ textTransform: "none", height: 40 }}
                startIcon={
                  actionLoading ? <CircularProgress size={18} /> : null
                }
              >
                배송중 주문 업데이트
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 주문 목록 테이블 */}
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    주문번호
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    주문일
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    주문자명
                  </TableCell>
                  {/* ✅ 상품명 컬럼 완전 제거 */}
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    수량
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    금액
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    배송 상태
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    관리
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const tableData = filteredOrders.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  );

                  if (tableData.length === 0) {
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={7} // ✅ 8에서 7로 수정 (상품명 컬럼 제거)
                          sx={{ textAlign: "center", py: 4 }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            주문 데이터가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return tableData.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      {/* ✅ 상품명 TableCell 제거 */}
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        {safeToLocaleString(order.amount)}원
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color={
                            (SHIPPING_STATUS_LABELS[
                              order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                            ]?.color as
                              | "primary"
                              | "warning"
                              | "error"
                              | "info"
                              | "secondary"
                              | "success") || "primary"
                          }
                          onClick={() =>
                            handleShowOrderDetail(order.orderNumber)
                          }
                          sx={{
                            textTransform: "none",
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          {SHIPPING_STATUS_LABELS[
                            order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                          ]?.label || order.shippingStatus}
                        </Button>
                        {order.shippingStatus === "delay_requested" &&
                          order.delayReason && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              사유: {order.delayReason}
                            </Typography>
                          )}
                      </TableCell>
                      <TableCell>
                        {/* ✅ 관리 컬럼: "상태 관리" 텍스트 버튼으로 변경 */}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEditStatus(order)}
                          sx={{
                            backgroundColor: "#ef9942",
                            "&:hover": { backgroundColor: "#d6853c" },
                            textTransform: "none",
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                          }}
                        >
                          상태 관리
                        </Button>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / 총 ${count !== -1 ? count : `${to} 이상`}개`
            }
          />
        </Paper>

        {/* ✅ 상태 변경 모달 - 기능 강화 */}
        <Dialog
          open={statusEditDialog}
          onClose={() => {
            setStatusEditDialog(false);
            resetFormData();
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>주문 상태 변경</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  주문번호: {selectedOrder.orderNumber}
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>새로운 상태</InputLabel>
                  <Select
                    value={newStatus}
                    label="새로운 상태"
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {/* ✅ 배송완료 옵션 제거 */}
                    <MenuItem value="payment_completed">주문확인</MenuItem>
                    <MenuItem value="preparing">상품준비중</MenuItem>
                    <MenuItem value="ready_for_delivery">배송준비완료</MenuItem>
                    <MenuItem value="in_transit">배송중</MenuItem>
                  </Select>
                </FormControl>

                {/* ✅ 상품준비중 선택시만 출고지연 체크박스 표시 */}
                {newStatus === "preparing" && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDelayRequested}
                        onChange={(e) => {
                          setIsDelayRequested(e.target.checked);
                          if (!e.target.checked) {
                            setDelayReason("");
                          }
                        }}
                      />
                    }
                    label="출고 지연 요청"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* ✅ 출고지연 체크시 지연사유 입력 필드 표시 */}
                {newStatus === "preparing" && isDelayRequested && (
                  <TextField
                    fullWidth
                    label="지연 사유"
                    multiline
                    rows={3}
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                  />
                )}

                {/* ✅ 배송중 상태시 배송사 + 운송장번호 필수 입력 */}
                {newStatus === "in_transit" && (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>배송사 *</InputLabel>
                      <Select
                        value={shippingCompany}
                        label="배송사 *"
                        onChange={(e) =>
                          setShippingCompany(e.target.value as CourierCompany)
                        }
                        required
                      >
                        {COURIER_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="운송장 번호 *"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                      sx={{ mb: 2 }}
                    />
                  </>
                )}

                {/* ✅ 유효성 검증 경고 메시지 */}
                {selectedOrder &&
                  (() => {
                    const currentStatus =
                      selectedOrder.shippingStatus as keyof typeof STATUS_FLOW;
                    const availableStatuses = STATUS_FLOW[currentStatus] || [];
                    const finalStatus = isDelayRequested
                      ? "delay_requested"
                      : newStatus;
                    const validStatuses =
                      availableStatuses as readonly string[];

                    if (!validStatuses.includes(finalStatus)) {
                      return (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          현재 상태(
                          {SHIPPING_STATUS_LABELS[currentStatus]?.label})에서
                          선택하신 상태로 변경할 수 없습니다.
                        </Alert>
                      );
                    }
                    return null;
                  })()}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setStatusEditDialog(false);
                resetFormData();
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveStatusChange}
              variant="contained"
              disabled={(() => {
                if (!selectedOrder) return true;

                // 유효성 검증
                const currentStatus =
                  selectedOrder.shippingStatus as keyof typeof STATUS_FLOW;
                const availableStatuses = STATUS_FLOW[currentStatus] || [];
                const finalStatus = isDelayRequested
                  ? "delay_requested"
                  : newStatus;
                const validStatuses = availableStatuses as readonly string[];

                if (!validStatuses.includes(finalStatus)) return true;

                // 배송중 상태시 필수 필드 검증
                if (
                  newStatus === "in_transit" &&
                  (!shippingCompany || !trackingNumber)
                )
                  return true;

                // 출고 지연 사유 검증
                if (
                  newStatus === "preparing" &&
                  isDelayRequested &&
                  !delayReason.trim()
                ) {
                  return true; // 버튼 비활성화
                }
              })()}
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 주문 상세 정보 모달 */}
        <Dialog
          open={orderDetailDialog}
          onClose={() => setOrderDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon color="primary" />
              주문 상세 정보
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                상세 정보를 불러오는데 실패했습니다: {detailError}
              </Alert>
            ) : orderDetail ? (
              <Box sx={{ pt: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  주문번호: {orderDetail.orderNumber}
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      주문 정보
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      주문일: {orderDetail.orderDate.split("T")[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      주문 상태:{" "}
                      {ORDER_STATUS_INFO_MAP[orderDetail.orderStatus]?.label ||
                        orderDetail.orderStatus}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      배송지 정보
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      받는 사람: {orderDetail.shippingAddress.recipientName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      연락처: {orderDetail.shippingAddress.maskedPhone}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      주소: {orderDetail.shippingAddress.fullAddress}
                    </Typography>
                    {orderDetail.shippingAddress.deliveryRequest && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        배송 요청사항:{" "}
                        {orderDetail.shippingAddress.deliveryRequest}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      주문 상품
                    </Typography>
                    {orderDetail.orderItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 2,
                          border: 1,
                          borderColor: "grey.200",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          수량: {item.quantity}개 | 단가:{" "}
                          {item.unitPrice.toLocaleString()}원 | 소계:{" "}
                          {item.totalPrice.toLocaleString()}원
                        </Typography>
                      </Box>
                    ))}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      결제 정보
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      상품 금액:{" "}
                      {orderDetail.orderSummary.totalProductPrice.toLocaleString()}
                      원
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      배송비:{" "}
                      {orderDetail.orderSummary.deliveryFee.toLocaleString()}원
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      총 결제 금액:{" "}
                      {orderDetail.orderSummary.totalAmount.toLocaleString()}원
                    </Typography>
                  </Grid>

                  {orderDetail.shipmentInfo && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        배송 정보
                      </Typography>
                      {orderDetail.shipmentInfo.courier && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          택배사: {orderDetail.shipmentInfo.courier}
                        </Typography>
                      )}
                      {orderDetail.shipmentInfo.trackingNumber && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          운송장 번호: {orderDetail.shipmentInfo.trackingNumber}
                        </Typography>
                      )}
                      {orderDetail.shipmentInfo.shippedAt && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          발송일:{" "}
                          {new Date(
                            orderDetail.shipmentInfo.shippedAt
                          ).toLocaleDateString()}
                        </Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : detailLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                주문 정보를 선택해주세요.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDetailDialog(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 알림 스낵바 */}
        <Snackbar
          open={showAlert}
          autoHideDuration={6000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // ← 위치 지정
        >
          <Alert
            onClose={() => setShowAlert(false)}
            severity={alertSeverity}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default OrderShippingManagement;
