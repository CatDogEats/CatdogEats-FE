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
  Grid,
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
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  SecondaryButton,
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
 * 주문 상세 정보 모달
 * 백엔드 응답 구조에 맞춘 정보 표시
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          variant="filled"
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        />
        {isDelayed && (
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            label="출고 지연"
            color="error"
            size="small"
            variant="outlined"
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
          pb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: BRAND_COLORS.TEXT_PRIMARY,
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            주문 상세 정보
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: BRAND_COLORS.TEXT_SECONDARY,
            }}
          >
            주문번호: {orderNumber}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress
              size={40}
              sx={{ color: BRAND_COLORS.PRIMARY, mb: 2 }}
            />
            <Typography color={BRAND_COLORS.TEXT_SECONDARY}>
              주문 정보를 불러오는 중...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              <Typography variant="body2">
                주문 정보를 불러오는 중 오류가 발생했습니다: {error}
              </Typography>
            </Alert>
          </Box>
        ) : orderDetail ? (
          <Box sx={{ p: 3 }}>
            {/* 주문 기본 정보 */}
            <Grid container spacing={3}>
              <Grid xs={12} md={8}>
                <Card
                  sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <PaymentIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        주문 정보
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          주문번호
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, fontFamily: "monospace" }}
                        >
                          {orderDetail.orderNumber}
                        </Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          주문일시
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatDate(orderDetail.orderDate)}
                        </Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          주문 상태
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <OrderStatusDisplay
                            status={orderDetail.orderStatus}
                            isDelayed={orderDetail.isDelayed}
                          />
                        </Box>
                      </Grid>
                      <Grid xs={6}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          구매자
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: BRAND_COLORS.PRIMARY,
                              fontSize: "0.75rem",
                            }}
                          >
                            {orderDetail.buyerName.charAt(0)}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {orderDetail.buyerName}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 출고 지연 정보 */}
                    {orderDetail.isDelayed && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="warning">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            출고 지연 요청
                          </Typography>
                          {orderDetail.delayReason && (
                            <Typography variant="body2">
                              사유: {orderDetail.delayReason}
                            </Typography>
                          )}
                          {orderDetail.expectedShipDate && (
                            <Typography variant="body2">
                              예상 출고일:{" "}
                              {formatDate(orderDetail.expectedShipDate)}
                            </Typography>
                          )}
                        </Alert>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid xs={12} md={4}>
                {/* 배송 정보 */}
                <Card
                  sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <ShippingIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        배송 정보
                      </Typography>
                    </Box>

                    {orderDetail.shipmentInfo ? (
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="body2"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            택배사
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {orderDetail.shipmentInfo.courierCompany
                              ? COURIER_INFO_MAP[
                                  orderDetail.shipmentInfo.courierCompany
                                ]?.name
                              : "미등록"}
                          </Typography>
                        </Box>

                        {orderDetail.shipmentInfo.trackingNumber && (
                          <Box>
                            <Typography
                              variant="body2"
                              color={BRAND_COLORS.TEXT_SECONDARY}
                            >
                              운송장번호
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, fontFamily: "monospace" }}
                            >
                              {orderDetail.shipmentInfo.trackingNumber}
                            </Typography>
                          </Box>
                        )}

                        {orderDetail.shipmentInfo.shippedAt && (
                          <Box>
                            <Typography
                              variant="body2"
                              color={BRAND_COLORS.TEXT_SECONDARY}
                            >
                              발송일시
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatDate(orderDetail.shipmentInfo.shippedAt)}
                            </Typography>
                          </Box>
                        )}

                        {orderDetail.shipmentInfo.deliveredAt && (
                          <Box>
                            <Typography
                              variant="body2"
                              color={BRAND_COLORS.TEXT_SECONDARY}
                            >
                              배송완료일시
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatDate(orderDetail.shipmentInfo.deliveredAt)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        배송 정보가 등록되지 않았습니다.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 수령인 정보 */}
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <LocationIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    수령인 정보
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <PersonIcon
                        sx={{
                          fontSize: 18,
                          color: BRAND_COLORS.TEXT_SECONDARY,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        수령인
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, ml: 3 }}>
                      {orderDetail.recipientInfo.recipientName}
                    </Typography>
                  </Grid>

                  <Grid xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <PhoneIcon
                        sx={{
                          fontSize: 18,
                          color: BRAND_COLORS.TEXT_SECONDARY,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        연락처
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, ml: 3 }}>
                      {formatPhoneNumber(
                        orderDetail.recipientInfo.recipientPhone
                      )}
                    </Typography>
                  </Grid>

                  <Grid xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <LocationIcon
                        sx={{
                          fontSize: 18,
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          mt: 0.2,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        배송지
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, ml: 3, lineHeight: 1.6 }}
                    >
                      {orderDetail.recipientInfo.shippingAddress}
                      {orderDetail.recipientInfo.addressDetail && (
                        <>
                          <br />
                          {orderDetail.recipientInfo.addressDetail}
                        </>
                      )}
                      {orderDetail.recipientInfo.postalCode && (
                        <Typography
                          variant="caption"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          <br />
                          우편번호: {orderDetail.recipientInfo.postalCode}
                        </Typography>
                      )}
                    </Typography>
                  </Grid>

                  {orderDetail.recipientInfo.deliveryRequest && (
                    <Grid xs={12}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        배송 요청사항
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          p: 1,
                          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                          borderRadius: 1,
                          mt: 0.5,
                        }}
                      >
                        {orderDetail.recipientInfo.deliveryRequest}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* 주문 상품 목록 */}
            <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  주문 상품 ({orderDetail.orderItems.length}개)
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT }}
                      >
                        <TableCell>상품 정보</TableCell>
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
                                alt={item.productName}
                                sx={{ width: 50, height: 50 }}
                                variant="rounded"
                              />
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600 }}
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
                          <TableCell align="center">
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {item.quantity}개
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1">
                              {formatCurrency(item.unitPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body1"
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
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  결제 정보
                </Typography>

                <Box
                  sx={{
                    backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        상품 금액
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(
                          orderDetail.orderSummary.totalProductAmount
                        )}
                      </Typography>
                    </Grid>

                    <Grid xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        배송비
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(
                          orderDetail.orderSummary.totalShippingFee
                        )}
                      </Typography>
                    </Grid>

                    {orderDetail.orderSummary.totalDiscountAmount > 0 && (
                      <Grid xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          할인 금액
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "error.main" }}
                        >
                          -
                          {formatCurrency(
                            orderDetail.orderSummary.totalDiscountAmount
                          )}
                        </Typography>
                      </Grid>
                    )}

                    <Grid xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          최종 결제 금액
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
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : null}
      </DialogContent>

      {/* 모달 푸터 */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
        }}
      >
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
