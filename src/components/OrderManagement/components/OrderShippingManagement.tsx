// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useMemo } from "react";
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
  Chip,
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
import { Warning as WarningIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";

// 프로토타입 타입들
import {
  Order,
  OrderFilter,
  OrderSummary,
  SearchCondition,
} from "../types/order.types";

// API 연동 imports
import { useSellerOrderManagement } from "@/hooks/useSellerOrders";
import type {
  SellerOrderItem,
  OrderStatus as APIOrderStatus,
  CourierCompany,
} from "@/types/sellerOrder.types";

import { COURIER_INFO_MAP } from "@/types/sellerOrder.types";

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

// 택배사 코드를 이름으로 변환
const getCourierName = (courierCompany?: CourierCompany): string => {
  if (!courierCompany) return "";
  return COURIER_INFO_MAP[courierCompany]?.name || "";
};

// API 데이터를 프로토타입 Order 타입으로 변환
const transformToOrder = (sellerItem: SellerOrderItem): Order => ({
  id: sellerItem.orderNumber,
  orderNumber: sellerItem.orderNumber,
  orderDate: sellerItem.orderDate.split("T")[0], // ISO 날짜를 YYYY-MM-DD로 변환
  customerName: sellerItem.buyerName,
  productName: `${sellerItem.orderItemCount}개 상품`,
  quantity: sellerItem.orderItemCount,
  amount: sellerItem.totalAmount,
  shippingStatus: mapAPIStatusToPrototype(sellerItem.orderStatus),
  customerPhone: sellerItem.recipientPhone,
  shippingAddress: sellerItem.shippingAddress,
  trackingNumber: sellerItem.trackingNumber,
  shippingCompany: getCourierName(sellerItem.courierCompany),
  delayReason: sellerItem.delayReason,
  isDirect: false, // 기본값
});

// ===== 상태 라벨 매핑 (프로토타입과 동일) =====
const SHIPPING_STATUS_LABELS = {
  payment_completed: { label: "주문확인", color: "primary" },
  preparing: { label: "상품준비중", color: "warning" },
  ready_for_delivery: { label: "배송준비 완료", color: "info" },
  in_transit: { label: "배송중", color: "secondary" },
  delivered: { label: "배송완료", color: "success" },
  delay_requested: { label: "출고지연중", color: "error" },
  order_cancelled: { label: "주문 취소", color: "error" },
};

const OrderShippingManagement: React.FC = () => {
  // ===== 기본 상태들 (프로토타입 순서대로) =====
  const [filter, setFilter] = useState<OrderFilter>({
    dateRange: "30days",
    startDate: "",
    endDate: "",
    shippingStatus: ["all"],
    searchCondition: "customer_name",
    searchKeyword: "",
    directShippingOnly: false,
  });

  const [appliedFilter, setAppliedFilter] = useState<OrderFilter>({
    dateRange: "30days",
    startDate: "",
    endDate: "",
    shippingStatus: ["all"],
    searchCondition: "customer_name",
    searchKeyword: "",
    directShippingOnly: false,
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ===== API 연동 Hook =====
  const {
    orders: apiOrders,
    ordersLoading,
    ordersError,
    actionLoading,
    updateOrderStatus,
    deleteOrder,
    syncShipmentStatus,
    refreshOrders,
  } = useSellerOrderManagement(page, "createdAt,desc");

  // 🚨 디버깅: Hook 상태 확인
  React.useEffect(() => {
    console.log("=== Hook 상태 디버깅 ===");
    console.log("- page:", page);
    console.log("- ordersLoading:", ordersLoading);
    console.log("- ordersError:", ordersError);
    console.log("- apiOrders:", apiOrders);
  }, [page, ordersLoading, ordersError, apiOrders]);

  // API 데이터를 프로토타입 Order 형태로 변환
  const orders = useMemo(() => {
    // 🚨 디버깅: API 응답 원본 데이터 확인
    console.log("=== API 상세 디버깅 ===");
    console.log("1. apiOrders 전체 구조:", JSON.stringify(apiOrders, null, 2));

    if (apiOrders) {
      console.log("2. apiOrders.orders:", apiOrders.orders);
      console.log("3. apiOrders.totalElements:", apiOrders.totalElements);
      console.log("4. apiOrders.totalPages:", apiOrders.totalPages);
      console.log("5. apiOrders.currentPage:", apiOrders.currentPage);
      console.log("6. apiOrders.hasNext:", apiOrders.hasNext);
      console.log("7. apiOrders.hasPrevious:", apiOrders.hasPrevious);
    }

    if (!apiOrders?.orders) {
      console.log("8. 데이터 없음 - 빈 배열 반환");
      return [];
    }

    console.log("9. orders 배열 길이:", apiOrders.orders.length);

    if (apiOrders.orders.length > 0) {
      console.log(
        "10. 첫 번째 주문 원본:",
        JSON.stringify(apiOrders.orders[0], null, 2)
      );
    }

    const transformedOrders = apiOrders.orders.map(transformToOrder);
    console.log("11. 변환된 주문 데이터 길이:", transformedOrders.length);

    return transformedOrders;
  }, [apiOrders]);

  // ===== 다이얼로그 및 알림 상태들 =====
  const [statusEditDialog, setStatusEditDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("payment_completed");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [isDelayRequested, setIsDelayRequested] = useState(false);
  const [delayReason, setDelayReason] = useState("");

  const [cancelConfirmDialog, setCancelConfirmDialog] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // ===== 상수들 =====
  const shippingCompanies = [
    "CJ대한통운",
    "우체국택배",
    "롯데택배",
    "한진택배",
    "로젠택배",
  ];

  // ===== 계산된 값들 =====

  // 주문 현황 계산 (프로토타입과 동일)
  const orderSummary: OrderSummary = useMemo(() => {
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
    return orders.filter((order) => order.shippingStatus === "delay_requested")
      .length;
  }, [orders]);

  // 필터링된 주문 계산 (프로토타입과 동일)
  const filteredOrders = useMemo(() => {
    console.log("=== 필터링 디버깅 ===");
    console.log("8. 원본 orders 길이:", orders.length);
    console.log("9. appliedFilter:", appliedFilter);

    const filtered = orders.filter((order) => {
      // 배송 상태 필터
      if (!appliedFilter.shippingStatus.includes("all")) {
        if (!appliedFilter.shippingStatus.includes(order.shippingStatus)) {
          console.log(
            "10. 상태 필터로 제외된 주문:",
            order.orderNumber,
            order.shippingStatus
          );
          return false;
        }
      }

      // 검색 키워드 필터
      if (appliedFilter.searchKeyword) {
        const keyword = appliedFilter.searchKeyword.toLowerCase();
        switch (appliedFilter.searchCondition) {
          case "customer_name":
            if (!order.customerName.toLowerCase().includes(keyword)) {
              console.log("11. 검색어 필터로 제외된 주문:", order.orderNumber);
              return false;
            }
            break;
          case "order_number":
            if (!order.orderNumber.toLowerCase().includes(keyword)) {
              return false;
            }
            break;
          case "product_name":
            if (!order.productName.toLowerCase().includes(keyword)) {
              return false;
            }
            break;
        }
      }

      return true;
    });

    console.log("12. 필터링 후 orders 길이:", filtered.length);
    console.log("13. 필터링된 첫 번째 주문:", filtered[0]);

    return filtered;
  }, [orders, appliedFilter]);

  // ===== 이벤트 핸들러들 =====

  // 배송상태 체크박스 다중 선택 핸들러 (프로토타입과 동일)
  const handleShippingStatusChange = (value: string) => {
    setFilter((prev) => {
      let newShippingStatus = [...prev.shippingStatus];

      if (value === "all") {
        newShippingStatus = ["all"];
      } else {
        if (newShippingStatus.includes("all")) {
          newShippingStatus = newShippingStatus.filter((s) => s !== "all");
        }

        if (newShippingStatus.includes(value)) {
          newShippingStatus = newShippingStatus.filter((s) => s !== value);
        } else {
          newShippingStatus.push(value);
        }

        if (newShippingStatus.length === 0) {
          newShippingStatus = ["all"];
        }
      }

      return {
        ...prev,
        shippingStatus: newShippingStatus,
      };
    });
  };

  // 필터 적용 핸들러 (프로토타입과 동일)
  const handleApplyFilters = () => {
    setAppliedFilter({ ...filter });
    setPage(0);
  };

  // 필터 초기화 핸들러 (프로토타입과 동일)
  const handleResetFilters = () => {
    const resetFilter = {
      dateRange: "30days" as const,
      startDate: "",
      endDate: "",
      shippingStatus: ["all"],
      searchCondition: "customer_name" as SearchCondition,
      searchKeyword: "",
      directShippingOnly: false,
    };
    setFilter(resetFilter);
    setAppliedFilter(resetFilter);
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  // ===== API 연동 핸들러들 =====

  // 상태 편집 핸들러 (API 연동)
  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.shippingStatus);
    setTrackingNumber(order.trackingNumber || "");
    setShippingCompany(order.shippingCompany || "");
    setIsDelayRequested(order.shippingStatus === "delay_requested");
    setDelayReason(order.delayReason || "");
    setStatusEditDialog(true);
  };

  // 상태 변경 저장 핸들러 (API 연동)
  const handleSaveStatusChange = async () => {
    if (!selectedOrder) return;

    try {
      const apiStatus = mapPrototypeStatusToAPI(newStatus);

      await updateOrderStatus({
        orderNumber: selectedOrder.orderNumber,
        newStatus: apiStatus,
        reason: isDelayRequested ? delayReason : undefined,
        isDelayed: isDelayRequested,
        courierCompany: shippingCompany
          ? (shippingCompany as CourierCompany)
          : undefined,
        trackingNumber: trackingNumber || undefined,
      });

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

  // 주문 취소 핸들러 (API 연동)
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      await deleteOrder(selectedOrder.orderNumber);

      setAlertMessage("주문이 성공적으로 취소되었습니다.");
      setAlertSeverity("success");
      setShowAlert(true);
      setCancelConfirmDialog(false);
      setSelectedOrder(null);
    } catch (error) {
      setAlertMessage("주문 취소에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  // 배송 상태 동기화 핸들러 (API 연동)
  const handleSyncShipmentStatus = async () => {
    try {
      const result = await syncShipmentStatus();
      if (result) {
        setAlertMessage(
          `배송 상태 동기화 완료: ${result.updatedOrders}개 주문 업데이트`
        );
        setAlertSeverity("success");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("배송 상태 동기화에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  // 페이지 변경 핸들러 (프로토타입과 동일)
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 페이지 크기 변경 핸들러 (프로토타입과 동일)
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        {/* 로딩 백드롭 */}
        <Backdrop open={ordersLoading || actionLoading} sx={{ zIndex: 1300 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* API 에러 표시 */}
        {ordersError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            주문 데이터를 불러오는데 실패했습니다: {ordersError.message}
            <Button
              variant="outlined"
              onClick={refreshOrders}
              sx={{ ml: 2 }}
              size="small"
            >
              다시 시도
            </Button>
          </Alert>
        )}

        {/* 헤더 */}
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          주문/배송 관리
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          주문현황을 확인하고 배송상태를 관리하세요
        </Typography>

        {/* 출고 지연 요청 경고 */}
        {delayRequestedCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<WarningIcon />}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              출고 지연 요청: <strong>{delayRequestedCount}건</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              지연 요청된 주문들을 확인하고 처리해주세요.
            </Typography>
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

        {/* 주문 검색 섹션 - 프로토타입 방식 */}
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
                onClick={() =>
                  setFilter((prev) => ({ ...prev, dateRange: "today" }))
                }
                size="small"
              >
                오늘
              </Button>
              <Button
                variant={
                  filter.dateRange === "7days" ? "contained" : "outlined"
                }
                onClick={() =>
                  setFilter((prev) => ({ ...prev, dateRange: "7days" }))
                }
                size="small"
              >
                7일
              </Button>
              <Button
                variant={
                  filter.dateRange === "30days" ? "contained" : "outlined"
                }
                onClick={() =>
                  setFilter((prev) => ({ ...prev, dateRange: "30days" }))
                }
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
                      searchCondition: e.target.value as SearchCondition,
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
                onClick={handleApplyFilters}
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
                variant="contained"
                color="primary"
                onClick={handleSyncShipmentStatus}
                disabled={actionLoading}
                sx={{
                  textTransform: "none",
                  height: "40px",
                }}
              >
                배송 상태 업데이트
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 주문 목록 테이블 (프로토타입과 동일) */}
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
                  <TableCell
                    sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                  >
                    상품명
                  </TableCell>
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
                  console.log("=== 테이블 렌더링 디버깅 ===");
                  console.log("14. 현재 페이지:", page);
                  console.log("15. 페이지당 행 수:", rowsPerPage);
                  console.log("16. 테이블에 표시될 데이터:", tableData);
                  console.log("17. 테이블 데이터 길이:", tableData.length);

                  if (tableData.length === 0) {
                    console.log("18. ⚠️ 테이블에 표시할 데이터가 없습니다!");
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={8}
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
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.amount.toLocaleString()}원</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            SHIPPING_STATUS_LABELS[
                              order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                            ]?.label || order.shippingStatus
                          }
                          color={
                            (SHIPPING_STATUS_LABELS[
                              order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                            ]?.color as any) || "default"
                          }
                          size="small"
                        />
                        {order.shippingStatus === "delay_requested" &&
                          order.delayReason && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              사유: {order.delayReason}
                            </Typography>
                          )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditStatus(order)}
                            disabled={actionLoading}
                            sx={{ textTransform: "none" }}
                          >
                            상태 변경
                          </Button>
                          {order.shippingStatus !== "order_cancelled" && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setSelectedOrder(order);
                                setCancelConfirmDialog(true);
                              }}
                              disabled={actionLoading}
                              sx={{ textTransform: "none" }}
                            >
                              취소
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 (프로토타입과 동일) */}
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

        {/* 상태 변경 다이얼로그 (프로토타입과 동일) */}
        <Dialog
          open={statusEditDialog}
          onClose={() => setStatusEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>주문 상태 변경</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  주문번호: <strong>{selectedOrder.orderNumber}</strong>
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>새 상태</InputLabel>
                      <Select
                        value={newStatus}
                        label="새 상태"
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <MenuItem value="payment_completed">주문확인</MenuItem>
                        <MenuItem value="preparing">상품준비중</MenuItem>
                        <MenuItem value="ready_for_delivery">
                          배송준비 완료
                        </MenuItem>
                        <MenuItem value="in_transit">배송중</MenuItem>
                        <MenuItem value="delivered">배송완료</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {newStatus === "in_transit" && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel>배송사</InputLabel>
                          <Select
                            value={shippingCompany}
                            label="배송사"
                            onChange={(e) => setShippingCompany(e.target.value)}
                          >
                            {shippingCompanies.map((company) => (
                              <MenuItem key={company} value={company}>
                                {company}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="운송장 번호"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isDelayRequested}
                          onChange={(e) =>
                            setIsDelayRequested(e.target.checked)
                          }
                        />
                      }
                      label="출고 지연 요청"
                    />
                  </Grid>

                  {isDelayRequested && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="지연 사유"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="출고 지연 사유를 입력하세요"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusEditDialog(false)}>취소</Button>
            <Button
              variant="contained"
              onClick={handleSaveStatusChange}
              disabled={actionLoading}
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 주문 취소 확인 다이얼로그 (프로토타입과 동일) */}
        <Dialog
          open={cancelConfirmDialog}
          onClose={() => setCancelConfirmDialog(false)}
        >
          <DialogTitle>주문 취소 확인</DialogTitle>
          <DialogContent>
            <Typography>
              주문번호 <strong>{selectedOrder?.orderNumber}</strong>을(를) 정말
              취소하시겠습니까?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              이 작업은 되돌릴 수 없습니다.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelConfirmDialog(false)}>
              아니오
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelOrder}
              disabled={actionLoading}
            >
              네, 취소합니다
            </Button>
          </DialogActions>
        </Dialog>

        {/* 알림 스낵바 (프로토타입과 동일) */}
        <Snackbar
          open={showAlert}
          autoHideDuration={6000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
