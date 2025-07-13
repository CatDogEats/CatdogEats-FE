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
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
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
          sx={{ fontWeight: 600 }}
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
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 0,
          borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
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
                backgroundColor: `${BRAND_COLORS.TEXT_SECONDARY}10`,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 모달 콘텐츠 */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <CircularProgress
              size={40}
              sx={{ color: BRAND_COLORS.PRIMARY, mr: 2 }}
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
              <Grid size={{ xs: 12, md: 8 }}>
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
                      <Grid size={{ xs: 6 }}>
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
                      <Grid size={{ xs: 6 }}>
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
                      <Grid size={{ xs: 6 }}>
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
                      <Grid size={{ xs: 6 }}>
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
                    {orderDetail.isDelayed && orderDetail.delayReason && (
                      <Box sx={{ mt: 2 }}>
                        <Alert
                          severity="warning"
                          icon={<ScheduleIcon />}
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            출고 지연 처리된 주문입니다
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            지연 사유: {orderDetail.delayReason}
                          </Typography>
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

                {/* 주문 상품 목록 */}
                <Card sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}>
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
                        주문 상품
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>상품정보</TableCell>
                            <TableCell align="center">수량</TableCell>
                            <TableCell align="right">단가</TableCell>
                            <TableCell align="right">금액</TableCell>
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
              </Grid>

              {/* 오른쪽 사이드 정보 */}
              <Grid size={{ xs: 12, md: 4 }}>
                {/* 배송지 정보 */}
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
                      <LocationIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        배송지 정보
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          수령인
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {orderDetail.recipientInfo.recipientName}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          연락처
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatPhoneNumber(
                            orderDetail.recipientInfo.recipientPhone
                          )}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="body2"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          주소
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {orderDetail.recipientInfo.shippingAddress}
                        </Typography>
                        {orderDetail.recipientInfo.addressDetail && (
                          <Typography
                            variant="body2"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            {orderDetail.recipientInfo.addressDetail}
                          </Typography>
                        )}
                      </Grid>
                      {orderDetail.recipientInfo.deliveryRequest && (
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="body2"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            배송 요청사항
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              p: 1,
                              backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                              borderRadius: 1,
                              fontStyle: "italic",
                            }}
                          >
                            {orderDetail.recipientInfo.deliveryRequest}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* 배송 정보 */}
                {orderDetail.shipmentInfo && (
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

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="body2"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            택배사
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {orderDetail.shipmentInfo.courierCompany &&
                            COURIER_INFO_MAP[
                              orderDetail.shipmentInfo.courierCompany
                            ]
                              ? COURIER_INFO_MAP[
                                  orderDetail.shipmentInfo.courierCompany
                                ].name
                              : "알 수 없음"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="body2"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            배송 상태
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {orderDetail.shipmentInfo.isShipped
                              ? "배송 시작됨"
                              : "배송 준비중"}
                          </Typography>
                        </Grid>
                        {orderDetail.shipmentInfo.deliveredAt && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="body2"
                              color={BRAND_COLORS.TEXT_SECONDARY}
                            >
                              배송완료일
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatDate(orderDetail.shipmentInfo.deliveredAt)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 결제 정보 */}
                <Card sx={{ border: `1px solid ${BRAND_COLORS.BORDER}` }}>
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
                        결제 정보
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
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
                      <Grid size={{ xs: 12, sm: 6 }}>
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
                        <Grid size={{ xs: 12, sm: 6 }}>
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

                      <Grid size={{ xs: 12 }}>
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
                            sx={{
                              fontWeight: 700,
                              color: BRAND_COLORS.PRIMARY,
                            }}
                          >
                            {formatCurrency(
                              orderDetail.orderSummary.finalPaymentAmount
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
