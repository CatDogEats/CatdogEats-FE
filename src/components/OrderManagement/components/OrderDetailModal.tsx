// src/components/OrderManagement/components/OrderDetailModal.tsx

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { useSellerOrderDetail } from "@/hooks/useSellerOrders";
import type { OrderStatus } from "@/types/sellerOrder.types";
import { ORDER_STATUS_LABELS } from "@/types/sellerOrder.types";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
}

/**
 * 주문 상세보기 모달
 * 판매자가 주문의 상세 정보와 배송지를 확인할 수 있는 모달
 */
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  onClose,
  orderNumber,
}) => {
  // 주문 상세 데이터 조회
  const {
    data: orderDetail,
    loading,
    error,
    refresh,
  } = useSellerOrderDetail(orderNumber);

  // 모달이 열릴 때마다 데이터 새로고침
  useEffect(() => {
    if (open && orderNumber) {
      refresh();
    }
  }, [open, orderNumber, refresh]);

  // 주문 상태별 Chip 색상
  const getStatusChipProps = (status: OrderStatus) => {
    switch (status) {
      case "PAYMENT_COMPLETED":
        return { color: "info" as const };
      case "PREPARING":
        return { color: "warning" as const };
      case "READY_FOR_SHIPMENT":
        return { color: "primary" as const };
      case "IN_DELIVERY":
        return { color: "secondary" as const };
      case "DELIVERED":
        return { color: "success" as const };
      case "CANCELLED":
        return { color: "error" as const };
      default:
        return { color: "default" as const };
    }
  };

  // 전화번호 마스킹 해제 (판매자용)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "-";
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            주문 상세 정보
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              주문 정보를 불러오는 중...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        )}

        {orderDetail && (
          <Box sx={{ p: 3 }}>
            {/* 주문 기본 정보 */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#f9fafb" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    주문번호
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {orderDetail.orderNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    주문일시
                  </Typography>
                  <Typography variant="body1">
                    {new Date(orderDetail.orderDate).toLocaleString("ko-KR")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    주문상태
                  </Typography>
                  <Chip
                    label={ORDER_STATUS_LABELS[orderDetail.orderStatus]}
                    size="small"
                    {...getStatusChipProps(orderDetail.orderStatus)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    총 주문금액
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#ef9942" }}
                  >
                    {orderDetail.orderSummary.totalAmount.toLocaleString()}원
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* 배송지 정보 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: "#ef9942" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  배송지 정보
                </Typography>
              </Box>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      받는 분
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderDetail.shippingAddress.recipientName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      연락처
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PhoneIcon
                        sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body1">
                        {formatPhoneNumber(
                          orderDetail.shippingAddress.recipientPhone
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      배송주소
                    </Typography>
                    <Typography variant="body1">
                      ({orderDetail.shippingAddress.zipCode}){" "}
                      {orderDetail.shippingAddress.fullAddress}
                    </Typography>
                  </Grid>
                  {orderDetail.shippingAddress.deliveryRequest && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        배송 요청사항
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        "{orderDetail.shippingAddress.deliveryRequest}"
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>

            {/* 주문상품 목록 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                주문상품 ({orderDetail.orderSummary.itemCount}개)
              </Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                      >
                        상품명
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                        align="center"
                      >
                        수량
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                        align="right"
                      >
                        단가
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                        align="right"
                      >
                        소계
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetail.orderItems.map((item) => (
                      <TableRow key={item.orderItemId}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            상품코드: {item.productId}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.quantity}개
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.unitPrice.toLocaleString()}원
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.totalPrice.toLocaleString()}원
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 배송 정보 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShippingIcon sx={{ mr: 1, color: "#ef9942" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  배송 정보
                </Typography>
              </Box>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      택배사
                    </Typography>
                    <Typography variant="body1">
                      {orderDetail.shipmentInfo.courier || "미등록"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      운송장번호
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {orderDetail.shipmentInfo.trackingNumber || "미등록"}
                    </Typography>
                  </Grid>
                  {orderDetail.shipmentInfo.shippedAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        발송일시
                      </Typography>
                      <Typography variant="body1">
                        {new Date(
                          orderDetail.shipmentInfo.shippedAt
                        ).toLocaleString("ko-KR")}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetail.shipmentInfo.deliveredAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        배송완료일시
                      </Typography>
                      <Typography variant="body1">
                        {new Date(
                          orderDetail.shipmentInfo.deliveredAt
                        ).toLocaleString("ko-KR")}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetail.shipmentInfo.shipmentMemo && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        배송 메모
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        "{orderDetail.shipmentInfo.shipmentMemo}"
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>

            {/* 주문 금액 정보 */}
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "#f9fafb" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                결제 정보
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  상품금액
                </Typography>
                <Typography variant="body2">
                  {orderDetail.orderSummary.totalProductPrice.toLocaleString()}
                  원
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  배송비
                </Typography>
                <Typography variant="body2">
                  {orderDetail.orderSummary.deliveryFee.toLocaleString()}원
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  총 결제금액
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#ef9942" }}
                >
                  {orderDetail.orderSummary.totalAmount.toLocaleString()}원
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions sx={{ p: 3, justifyContent: "center" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 4,
            bgcolor: "#ef9942",
            "&:hover": { bgcolor: "#e08830" },
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
