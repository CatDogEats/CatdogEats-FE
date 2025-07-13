// src/components/OrderManagement/components/OrderDetailModal.tsx

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import { useSellerOrderDetail } from "@/hooks/useSellerOrders";
import type { OrderStatus } from "@/types/sellerOrder.types";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
}

// 주문 상태별 Chip 색상 (OrderListTable과 동일)
const getStatusChipProps = (status: OrderStatus) => {
  switch (status) {
    case "PAYMENT_COMPLETED":
      return {
        label: "결제완료",
        sx: {
          backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
          color: BRAND_COLORS.PRIMARY,
          fontWeight: 500,
        },
      };
    case "PREPARING":
      return {
        label: "상품준비중",
        sx: {
          backgroundColor: "#fff3e0",
          color: "#f57c00",
          fontWeight: 500,
        },
      };
    case "READY_FOR_SHIPMENT":
      return {
        label: "배송준비완료",
        sx: {
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          fontWeight: 500,
        },
      };
    case "IN_DELIVERY":
      return {
        label: "배송중",
        sx: {
          backgroundColor: "#f3e5f5",
          color: "#9c27b0",
          fontWeight: 500,
        },
      };
    case "DELIVERED":
      return {
        label: "배송완료",
        sx: {
          backgroundColor: "#e8f5e8",
          color: "#2e7d32",
          fontWeight: 500,
        },
      };
    case "CANCELLED":
      return {
        label: "주문취소",
        sx: {
          backgroundColor: "#ffebee",
          color: "#d32f2f",
          fontWeight: 500,
        },
      };
    default:
      return {
        label: status,
        sx: {
          backgroundColor: "#f5f5f5",
          color: "#757575",
          fontWeight: 500,
        },
      };
  }
};

/**
 * 주문 상세보기 모달
 * Frontend-prototype 브랜드 스타일 적용
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

  // 전화번호 포맷팅 (판매자용 - 마스킹 해제)
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
        sx: {
          borderRadius: 2,
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: BRAND_COLORS.TEXT_PRIMARY,
            }}
          >
            주문 상세 정보
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: BRAND_COLORS.TEXT_SECONDARY,
              "&:hover": {
                backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: BRAND_COLORS.BORDER }} />
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: BRAND_COLORS.PRIMARY }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error.message}
          </Alert>
        ) : orderDetail ? (
          <Grid container spacing={3}>
            {/* 주문 기본 정보 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${BRAND_COLORS.BORDER}`,
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                }}
              >
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
                  <PersonIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  주문 정보
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      주문번호
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderDetail.orderNumber}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      주문일시
                    </Typography>
                    <Typography variant="body1">
                      {new Date(orderDetail.orderDate).toLocaleString("ko-KR")}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      주문상태
                    </Typography>
                    <Chip
                      size="small"
                      label={getStatusChipProps(orderDetail.orderStatus).label}
                      sx={{
                        borderRadius: 2,
                        ...getStatusChipProps(orderDetail.orderStatus).sx,
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* 배송지 정보 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${BRAND_COLORS.BORDER}`,
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                }}
              >
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
                  <LocationIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  배송지 정보
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      수취인
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderDetail.recipientInfo.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      연락처
                    </Typography>
                    <Typography variant="body1">
                      {formatPhoneNumber(orderDetail.recipientInfo.phone)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{ mb: 0.5 }}
                    >
                      주소
                    </Typography>
                    <Typography variant="body1">
                      {orderDetail.recipientInfo.address}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* 배송 정보 */}
            {orderDetail.shipmentInfo && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${BRAND_COLORS.BORDER}`,
                    backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  }}
                >
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
                    <ShippingIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                    배송 정보
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                        sx={{ mb: 0.5 }}
                      >
                        택배사
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {orderDetail.shipmentInfo.courier || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                        sx={{ mb: 0.5 }}
                      >
                        운송장번호
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {orderDetail.shipmentInfo.trackingNumber || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                        sx={{ mb: 0.5 }}
                      >
                        발송일시
                      </Typography>
                      <Typography variant="body1">
                        {orderDetail.shipmentInfo.shippedAt
                          ? new Date(
                              orderDetail.shipmentInfo.shippedAt
                            ).toLocaleString("ko-KR")
                          : "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* 주문 상품 목록 */}
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${BRAND_COLORS.BORDER}`,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 2, backgroundColor: BRAND_COLORS.SECONDARY }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: BRAND_COLORS.TEXT_PRIMARY,
                    }}
                  >
                    주문 상품
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead
                      sx={{ backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>상품정보</TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, textAlign: "center" }}
                        >
                          수량
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                          단가
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                          합계
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetail.orderItems.map((item) => (
                        <TableRow key={item.orderItemId}>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 4,
                                  objectFit: "cover",
                                  border: `1px solid ${BRAND_COLORS.BORDER}`,
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {item.productName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color={BRAND_COLORS.TEXT_SECONDARY}
                                >
                                  상품코드: {item.productId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="body2">
                              {item.quantity}개
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            <Typography variant="body2">
                              {item.unitPrice.toLocaleString()}원
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.totalPrice.toLocaleString()}원
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 주문 요약 */}
                <Box
                  sx={{ p: 2, backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        총 상품 개수: {orderDetail.orderSummary.itemCount}개
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: BRAND_COLORS.PRIMARY }}
                      >
                        총 결제금액:{" "}
                        {orderDetail.orderSummary.totalAmount.toLocaleString()}
                        원
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <SecondaryButton onClick={onClose} sx={{ minWidth: 100 }}>
          닫기
        </SecondaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
