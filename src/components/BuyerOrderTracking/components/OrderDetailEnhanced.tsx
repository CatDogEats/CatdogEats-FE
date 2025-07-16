// src/components/BuyerOrderTracking/components/OrderDetailEnhanced.tsx

"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useBuyerOrderDetail, useErrorMessage } from "@/hooks/useBuyerOrders";
import { buyerOrderApi } from "@/service/api/buyerOrderApi";
import { ORDER_STATUS_INFO_MAP } from "@/types/buyerOrder.types";
import type {
  Order,
  OrderStatus,
  OrderStatusInfo,
  BuyerOrderDetailItem,
} from "@/types/buyerOrder.types";
interface OrderDetailEnhancedProps {
  selectedOrder: any; // 기존 프로토타입 Order 객체
  setDetailView: (view: string | null) => void;
  handleOrderAction: (action: string, order: any) => void;
}

const OrderDetailEnhanced: React.FC<OrderDetailEnhancedProps> = ({
  selectedOrder,
  setDetailView,
  handleOrderAction,
}) => {
  // API 연동 훅
  const { orderDetail, loading, error, refetch } = useBuyerOrderDetail(
    selectedOrder?.orderNumber
  );

  // 에러 메시지 관리
  const { errorMessage, showError, showErrorMessage, hideErrorMessage } =
    useErrorMessage();

  // 주문 삭제 핸들러
  const handleDeleteOrder = async () => {
    try {
      await buyerOrderApi.deleteBuyerOrder({
        orderNumber: selectedOrder.orderNumber,
      });

      // 성공 시 목록으로 돌아가기
      setDetailView(null);

      // 부모 컴포넌트에서 목록 새로고침 처리
      handleOrderAction("refresh", selectedOrder);
    } catch (error: any) {
      showErrorMessage(error.message);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box>
        <Button
          variant="outlined"
          startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
          onClick={() => setDetailView(null)}
          sx={{ mb: 3 }}
        >
          주문목록 돌아가기
        </Button>

        <Alert severity="error" sx={{ mb: 3 }}>
          주문 정보를 불러오는데 실패했습니다: {error}
        </Alert>

        <Button variant="outlined" onClick={refetch}>
          다시 시도
        </Button>
      </Box>
    );
  }

  // 데이터가 없는 경우 (selectedOrder 사용)
  if (!orderDetail) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
          주문상세
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          주문 상세 정보를 불러오는 중입니다...
        </Alert>

        {/* 기존 selectedOrder 데이터로 기본 정보 표시 */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          주문 정보
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 600, bgcolor: "#f5f5f5", width: 120 }}
                >
                  주문번호
                </TableCell>
                <TableCell>{selectedOrder.orderNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                  주문일시
                </TableCell>
                <TableCell>{selectedOrder.orderDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                  주문상태
                </TableCell>
                <TableCell>{selectedOrder.shippingStatus}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
            onClick={() => setDetailView(null)}
          >
            주문목록 돌아가기
          </Button>
        </Box>
      </Box>
    );
  }

  // 주문 상태 정보
  const statusInfo: OrderStatusInfo =
    ORDER_STATUS_INFO_MAP[orderDetail.orderStatus as OrderStatus];

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        주문상세
      </Typography>

      {/* 주문 정보 */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        주문 정보
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, bgcolor: "#f5f5f5", width: 120 }}
              >
                주문번호
              </TableCell>
              <TableCell>{orderDetail.orderNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                주문일시
              </TableCell>
              <TableCell>{formatDate(orderDetail.orderDate)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                주문상태
              </TableCell>
              <TableCell>
                <Box
                  component="span"
                  sx={{
                    color: `${statusInfo?.color}.main`,
                    fontWeight: 600,
                  }}
                >
                  {statusInfo?.label || orderDetail.orderStatus}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 배송지 정보 */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        배송지 정보
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, bgcolor: "#f5f5f5", width: 120 }}
              >
                받는사람
              </TableCell>
              <TableCell>{orderDetail.recipientInfo.recipientName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                연락처
              </TableCell>
              <TableCell>{orderDetail.recipientInfo.recipientPhone}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                주소
              </TableCell>
              <TableCell>{orderDetail.recipientInfo.shippingAddress}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                배송메모
              </TableCell>
              <TableCell>
                {orderDetail.recipientInfo.deliveryNote || "배송 요청사항 없음"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 주문 상품 정보 */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        주문 상품 정보
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>상품명</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
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
                <TableCell>{item.productName}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {item.quantity}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {item.unitPrice.toLocaleString()} 원
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {item.totalPrice.toLocaleString()} 원
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 결제 정보 */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        결제 정보
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, bgcolor: "#f5f5f5", width: 120 }}
              >
                결제수단
              </TableCell>
              <TableCell sx={{ textAlign: "right" }}>
                <Box>
                  <Typography variant="body2">
                    총 상품가격:{" "}
                    {orderDetail.paymentInfo.totalProductPrice.toLocaleString()}{" "}
                    원
                  </Typography>
                  <Typography variant="body2">
                    할인금액:{" "}
                    {orderDetail.paymentInfo.discountAmount.toLocaleString()} 원
                  </Typography>
                  <Typography variant="body2">
                    배송비:{" "}
                    {orderDetail.paymentInfo.deliveryFee.toLocaleString()} 원
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    총 결제금액:{" "}
                    {orderDetail.paymentInfo.finalAmount.toLocaleString()} 원
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 결제영수증 정보 */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        결제영수증 정보
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          해당 주문건에 대해 거래명세서 확인이 가능합니다.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" size="small">
            거래명세서
          </Button>
        </Box>
      </Paper>

      {/* 액션 버튼들 */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
          onClick={() => setDetailView(null)}
        >
          주문목록 돌아가기
        </Button>
        <Button variant="outlined" color="error" onClick={handleDeleteOrder}>
          주문내역 삭제
        </Button>
      </Box>

      {/* 에러 메시지 스낵바 */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={hideErrorMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={hideErrorMessage}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetailEnhanced;
