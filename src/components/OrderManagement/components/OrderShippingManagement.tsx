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
  IconButton,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Edit,
  Info as InfoIcon,
} from "@mui/icons-material";
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
import {
  useSellerOrderManagement,
  useSellerOrderDetail,
} from "@/hooks/useSellerOrders";
import type {
  SellerOrderItem,
  OrderStatus as APIOrderStatus,
  CourierCompany,
} from "@/types/sellerOrder.types";

import {
  COURIER_INFO_MAP,
  ORDER_STATUS_INFO_MAP,
} from "@/types/sellerOrder.types";

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
  productName: `${sellerItem.orderSummary.itemCount}개 상품`,
  quantity: sellerItem.orderSummary.itemCount,
  amount: sellerItem.orderSummary.totalAmount,
  shippingStatus: mapAPIStatusToPrototype(sellerItem.orderStatus),
  customerPhone: sellerItem.recipientPhone,
  shippingAddress: sellerItem.shippingAddress,
  trackingNumber: sellerItem.trackingNumber,
  shippingCompany: getCourierName(sellerItem.courierCompany),
  delayReason: sellerItem.delayReason,
  isDirect: false, // 기본값
});

// 안전한 렌더링을 위한 헬퍼 함수
const safeToLocaleString = (amount: number | undefined): string => {
  return (amount || 0).toLocaleString();
};

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
    syncShipmentStatus,
    refreshOrders,
  } = useSellerOrderManagement(page, "createdAt,desc");

  // ===== 상세 정보 모달 관련 상태 =====
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");

  // 상세 정보 조회 Hook
  const {
    orderDetail,
    loading: detailLoading,
    error: detailError,
  } = useSellerOrderDetail(selectedOrderNumber);

  // 🚨 디버깅: Hook 상태 확인 (간단한 로그로 변경)
  React.useEffect(() => {
    if (ordersLoading) {
      console.log("📥 주문 데이터 로딩 중...");
    } else if (apiOrders) {
      console.log(
        `✅ 주문 데이터 로딩 완료: ${apiOrders.orders?.length || 0}개 주문`
      );
    } else if (ordersError) {
      console.log("❌ 주문 데이터 로딩 실패");
    }
  }, [ordersLoading, ordersError, apiOrders]);

  // API 데이터를 프로토타입 Order 형태로 변환
  const orders = useMemo(() => {
    console.log("🔄 주문 데이터 변환 시작");

    if (!apiOrders?.orders) {
      console.log("📭 변환할 주문 데이터 없음");
      return [];
    }

    const transformedOrders = apiOrders.orders.map(transformToOrder);
    console.log(`🔄 주문 데이터 변환 완료: ${transformedOrders.length}개`);

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
    // ✅ 추가: orders가 없거나 비어있을 때 기본값 반환
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

  // 필터링된 주문 계산 (프로토타입과 동일)
  const filteredOrders = useMemo(() => {
    console.log("🔍 주문 필터링 시작");

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

    console.log(`🔍 필터링 완료: ${filtered.length}개 주문`);
    return filtered;
  }, [orders, appliedFilter]);

  // ===== 이벤트 핸들러들 =====

  // 상태 편집 핸들러 (프로토타입과 동일)
  const handleEditStatus = (order: Order) => {
    console.log("✏️ 상태 변경 모달 열기:", order.orderNumber);
    setSelectedOrder(order);
    setNewStatus(order.shippingStatus);
    setStatusEditDialog(true);
  };

  // 상세 정보 모달 열기 핸들러 (신규 추가)
  const handleShowOrderDetail = (orderNumber: string) => {
    console.log("📋 상세 정보 모달 열기:", orderNumber);
    setSelectedOrderNumber(orderNumber);
    setOrderDetailDialog(true);
  };

  // 필터 적용 핸들러 (프로토타입과 동일)
  const handleApplyFilters = () => {
    console.log("🔍 필터 적용");
    setAppliedFilter({ ...filter });
    setPage(0);
  };

  // 필터 초기화 핸들러 (프로토타입과 동일)
  const handleResetFilters = () => {
    console.log("🔄 필터 초기화");
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
  };

  // 상태 변경 저장 핸들러 (API 연동)
  const handleSaveStatusChange = async () => {
    if (!selectedOrder) return;

    try {
      console.log(
        "💾 주문 상태 변경 요청:",
        selectedOrder.orderNumber,
        "->",
        newStatus
      );

      await updateOrderStatus({
        orderNumber: selectedOrder.orderNumber,
        newStatus: mapPrototypeStatusToAPI(newStatus),
        reason: delayReason || undefined,
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
      console.log("❌ 주문 상태 변경 실패");
      setAlertMessage("주문 상태 변경에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  // 배송 상태 동기화 핸들러 (API 연동)
  const handleSyncShipmentStatus = async () => {
    try {
      console.log("🔄 배송 상태 동기화 시작");
      const result = await syncShipmentStatus();
      if (result) {
        setAlertMessage(
          `배송 상태 동기화 완료: ${result.updatedOrders}개 주문 업데이트`
        );
        setAlertSeverity("success");
        setShowAlert(true);
      }
    } catch (error) {
      console.log("❌ 배송 상태 동기화 실패");
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
        <Backdrop
          open={ordersLoading || actionLoading || detailLoading}
          sx={{ zIndex: 1300 }}
        >
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

        {/* 필터 섹션 (프로토타입과 동일) */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            검색 및 필터
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>기간</InputLabel>
                  <Select
                    value={filter.dateRange}
                    label="기간"
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        dateRange: e.target.value as any,
                      }))
                    }
                  >
                    <MenuItem value="today">오늘</MenuItem>
                    <MenuItem value="7days">7일</MenuItem>
                    <MenuItem value="30days">30일</MenuItem>
                    <MenuItem value="custom">직접선택</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>배송 상태</InputLabel>
                  <Select
                    value={filter.shippingStatus[0] || "all"}
                    label="배송 상태"
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        shippingStatus: [e.target.value],
                      }))
                    }
                  >
                    <MenuItem value="all">전체</MenuItem>
                    <MenuItem value="payment_completed">주문확인</MenuItem>
                    <MenuItem value="preparing">상품준비중</MenuItem>
                    <MenuItem value="ready_for_delivery">
                      배송준비 완료
                    </MenuItem>
                    <MenuItem value="in_transit">배송중</MenuItem>
                    <MenuItem value="delivered">배송완료</MenuItem>
                    <MenuItem value="delay_requested">출고지연중</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>검색 조건</InputLabel>
                  <Select
                    value={filter.searchCondition}
                    label="검색 조건"
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
              </Grid>
            </Grid>

            {filter.dateRange === "custom" && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="시작일"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="종료일"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
              <TextField
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

                  console.log(
                    `📊 테이블 렌더링: ${tableData.length}개 행 표시`
                  );

                  if (tableData.length === 0) {
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
                      <TableCell>
                        {safeToLocaleString(order.amount)}원
                      </TableCell>
                      <TableCell>
                        {/* ✅ 수정: Chip을 Button으로 변경 */}
                        <Button
                          variant="outlined"
                          size="small"
                          color={
                            (SHIPPING_STATUS_LABELS[
                              order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                            ]?.color as any) || "primary"
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
                        {/* ✅ 수정: 취소 버튼 제거, 상태 변경만 남김 */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditStatus(order)}
                            disabled={actionLoading}
                            sx={{ color: "primary.main" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
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

        {/*신규 추가: 주문 상세 정보 모달 */}
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
                          배송 시작일:{" "}
                          {orderDetail.shipmentInfo.shippedAt.split("T")[0]}
                        </Typography>
                      )}
                      {orderDetail.shipmentInfo.deliveredAt && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          배송 완료일:{" "}
                          {orderDetail.shipmentInfo.deliveredAt.split("T")[0]}
                        </Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDetailDialog(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

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
