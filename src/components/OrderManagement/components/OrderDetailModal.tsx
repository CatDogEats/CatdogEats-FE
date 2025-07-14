// src/components/OrderManagement/components/OrderDetailModal.tsx

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Grid2 as Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  SecondaryButton,
  PrimaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import { useSellerOrderDetail } from "@/hooks/useSellerOrders";
import type { OrderStatus } from "@/types/sellerOrder.types";
import {
  COURIER_INFO_MAP,
  ORDER_STATUS_INFO_MAP,
} from "@/types/sellerOrder.types";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
}

/**
 * 주문 상세 정보 모달 - 프로토타입 완전 복원
 * - 브랜드 스타일 적용
 * - 완전한 정보 표시
 * - 반응형 디자인
 * - 백엔드 응답 구조 완벽 대응
 */
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  onClose,
  orderNumber,
}) => {
  // 주문 상세 정보 조회
  const { orderDetail, loading, error } = useSellerOrderDetail(orderNumber);

  // 날짜 포맷 헬퍼
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 금액 포맷 헬퍼
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  // 전화번호 포맷 헬퍼
  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  // 주문 상태 표시 컴포넌트
  const OrderStatusDisplay: React.FC<{
    status: OrderStatus;
    isDelayed?: boolean;
  }> = ({ status, isDelayed }) => {
    const statusInfo = ORDER_STATUS_INFO_MAP[status];

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          variant="filled"
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            height: 32,
            borderRadius: 2,
            boxShadow: 1,
          }}
        />
        {isDelayed && (
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
            label="출고 지연"
            color="error"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
              borderRadius: 1.5,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.7 },
                "100%": { opacity: 1 },
              },
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          p: 0,
          background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.PRIMARY_HOVER} 100%)`,
          color: "white",
          position: "relative",
        }}
      >
        <Box sx={{ p: 3, pr: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
                주문번호: {orderNumber}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
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

      {/* 모달 콘텐츠 */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
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
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        ) : orderDetail ? (
          <Box sx={{ p: 3 }}>
            {/* 주문 기본 정보 */}
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: BRAND_COLORS.PRIMARY,
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
                  >
                    주문 기본 정보
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        주문번호
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: BRAND_COLORS.PRIMARY,
                        }}
                      >
                        {orderDetail.orderNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        주문일시
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarIcon
                          sx={{
                            fontSize: 16,
                            color: BRAND_COLORS.TEXT_SECONDARY,
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(
                            orderDetail.orderDate ||
                              orderDetail.createdAt ||
                              Date.now().toString()
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        주문상태
                      </Typography>
                      <OrderStatusDisplay
                        status={orderDetail.orderStatus}
                        isDelayed={orderDetail.isDelayed}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        총 주문금액
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: BRAND_COLORS.TEXT_PRIMARY,
                        }}
                      >
                        {formatCurrency(
                          orderDetail.totalAmount || orderDetail.amount || 0
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 출고 지연 정보 */}
                {orderDetail.isDelayed && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        출고 지연 상태
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        지연 사유: {orderDetail.delayReason || "미입력"}
                      </Typography>
                      <Typography variant="body2">
                        예상 출고일:{" "}
                        {orderDetail.expectedShipDate
                          ? new Date(
                              orderDetail.expectedShipDate
                            ).toLocaleDateString("ko-KR")
                          : "미정"}
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 구매자 정보 */}
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: BRAND_COLORS.PRIMARY,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
                  >
                    구매자 정보
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          backgroundColor: BRAND_COLORS.PRIMARY,
                          fontWeight: 600,
                          fontSize: "1.25rem",
                        }}
                      >
                        {orderDetail.buyerName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {orderDetail.buyerName}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PhoneIcon
                            sx={{
                              fontSize: 16,
                              color: BRAND_COLORS.TEXT_SECONDARY,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatPhoneNumber(
                              orderDetail.buyerPhone ||
                                orderDetail.customerPhone ||
                                "연락처 없음"
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    {orderDetail.recipientInfo && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          배송지 정보
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <LocationIcon
                            sx={{
                              fontSize: 16,
                              color: BRAND_COLORS.PRIMARY,
                              mt: 0.2,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            >
                              {orderDetail.recipientInfo.recipientName}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.4 }}
                            >
                              {orderDetail.recipientInfo.shippingAddress ||
                                orderDetail.recipientInfo.address ||
                                "주소 정보 없음"}
                            </Typography>
                            {orderDetail.recipientInfo.deliveryRequest && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mt: 0.5 }}
                              >
                                요청사항:{" "}
                                {orderDetail.recipientInfo.deliveryRequest}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 상품 정보 */}
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: BRAND_COLORS.PRIMARY,
                    }}
                  >
                    <ShoppingBagIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
                  >
                    주문 상품 ({orderDetail.orderItems.length}개)
                  </Typography>
                </Box>

                <TableContainer
                  component={Paper}
                  sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>상품명</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          수량
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          단가
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          소계
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetail.orderItems.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1,
                                  backgroundColor:
                                    BRAND_COLORS.BACKGROUND_LIGHT,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: `1px solid ${BRAND_COLORS.BORDER}`,
                                }}
                              >
                                <InventoryIcon
                                  sx={{
                                    fontSize: 20,
                                    color: BRAND_COLORS.TEXT_SECONDARY,
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                  {item.productName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  상품 ID: {item.productId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${item.quantity}개`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                borderColor: BRAND_COLORS.PRIMARY,
                                color: BRAND_COLORS.PRIMARY,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(item.unitPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 주문 금액 요약 */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        상품 총액
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography
                        variant="body2"
                        align="right"
                        sx={{ fontWeight: 500 }}
                      >
                        {formatCurrency(
                          orderDetail.totalAmount || orderDetail.amount || 0
                        )}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        배송비
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography
                        variant="body2"
                        align="right"
                        sx={{ fontWeight: 500 }}
                      >
                        무료
                      </Typography>
                    </Grid>
                    <Grid xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        총 결제금액
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography
                        variant="h6"
                        align="right"
                        sx={{ fontWeight: 700, color: BRAND_COLORS.PRIMARY }}
                      >
                        {formatCurrency(
                          orderDetail.totalAmount || orderDetail.amount || 0
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* 배송 정보 */}
            {orderDetail.shipmentInfo && (
              <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: BRAND_COLORS.PRIMARY,
                      }}
                    >
                      <ShippingIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
                    >
                      배송 정보
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {orderDetail.shipmentInfo.courierCompany && (
                      <Grid xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          택배사
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {
                            COURIER_INFO_MAP[
                              orderDetail.shipmentInfo.courierCompany
                            ]?.name
                          }
                        </Typography>
                      </Grid>
                    )}

                    {orderDetail.shipmentInfo.trackingNumber && (
                      <Grid xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          운송장번호
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: BRAND_COLORS.PRIMARY,
                          }}
                        >
                          {orderDetail.shipmentInfo.trackingNumber}
                        </Typography>
                      </Grid>
                    )}

                    {orderDetail.shipmentInfo.shippedAt && (
                      <Grid xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          발송일시
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(orderDetail.shipmentInfo.shippedAt)}
                        </Typography>
                      </Grid>
                    )}

                    {orderDetail.shipmentInfo.deliveredAt && (
                      <Grid xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          배송완료일시
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(orderDetail.shipmentInfo.deliveredAt)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : null}
      </DialogContent>

      {/* 모달 푸터 */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          gap: 2,
        }}
      >
        <SecondaryButton
          onClick={onClose}
          sx={{
            minWidth: 120,
            py: 1.5,
          }}
        >
          닫기
        </SecondaryButton>

        {orderDetail && orderDetail.shipmentInfo?.trackingNumber && (
          <PrimaryButton
            onClick={() => {
              const trackingUrl = `https://tracker.delivery/#/${orderDetail.shipmentInfo?.courierCompany}/${orderDetail.shipmentInfo?.trackingNumber}`;
              window.open(trackingUrl, "_blank");
            }}
            startIcon={<ShippingIcon />}
            sx={{
              minWidth: 120,
              py: 1.5,
            }}
          >
            배송 추적
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
