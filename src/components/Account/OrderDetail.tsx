// src/components/Account/OrderDetail.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { useBuyerOrderDetail } from "@/hooks/useBuyerOrders";
import { buyerOrderApi } from "@/service/api/buyerOrderApi";
import { ORDER_STATUS_INFO_MAP } from "@/types/buyerOrder.types";

interface OrderDetailProps {
  selectedOrder: { orderNumber: string } | null;
  setDetailView: (view: string | null) => void;
  handleOrderAction: (action: string, order: any) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  selectedOrder,
  setDetailView,
  handleOrderAction,
}) => {
  // ✅ 모든 훅을 맨 처음에 호출
  const { orderDetail, loading, error } = useBuyerOrderDetail(
    selectedOrder?.orderNumber || ""
  );

  // ✅ 함수 정의 (훅 호출 후)
  const handleDeleteOrder = async () => {
    try {
      await buyerOrderApi.deleteBuyerOrder({
        orderNumber: selectedOrder!.orderNumber,
      });
      setDetailView(null);
      await handleOrderAction("refresh", selectedOrder);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ✅ 단일 return문에서 조건부 렌더링
  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => setDetailView(null)} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      ) : !orderDetail ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">주문 정보를 찾을 수 없습니다.</Alert>
          <Button onClick={() => setDetailView(null)} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      ) : (
        <Box>
          {/* 주문 정보 헤더 */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            주문일: {orderDetail.orderDate.split("T")[0]}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            주문번호: {orderDetail.orderNumber}
          </Typography>

          {/* 주문 상태 */}
          <Chip
            label={ORDER_STATUS_INFO_MAP[orderDetail.orderStatus]?.label}
            color={
              (ORDER_STATUS_INFO_MAP[orderDetail.orderStatus]?.color as any) ||
              "default"
            }
            sx={{ mb: 3 }}
          />

          {/* 주문 상품 정보 */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            주문 상품 정보
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>상품명</TableCell>
                  <TableCell>수량</TableCell>
                  <TableCell>단가</TableCell>
                  <TableCell>총액</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetail.orderItems.map((item: any) => (
                  <TableRow key={item.orderItemId}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            style={{ width: 50, height: 50, marginRight: 8 }}
                          />
                        )}
                        {item.productName}
                      </Box>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice.toLocaleString()} 원</TableCell>
                    <TableCell>{item.totalPrice.toLocaleString()} 원</TableCell>
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
                        {orderDetail.paymentInfo.discountAmount.toLocaleString()}{" "}
                        원
                      </Typography>
                      <Typography variant="body2">
                        배송비:{" "}
                        {orderDetail.paymentInfo.deliveryFee.toLocaleString()}{" "}
                        원
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        총 결제금액:{" "}
                        {orderDetail.paymentInfo.finalAmount.toLocaleString()}{" "}
                        원
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 수령인 정보 */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            수령인 정보
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
                  <TableCell>
                    {orderDetail.recipientInfo.recipientName}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    받는주소
                  </TableCell>
                  <TableCell>
                    {orderDetail.recipientInfo.shippingAddress}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    배송요청사항
                  </TableCell>
                  <TableCell>
                    {orderDetail.recipientInfo.deliveryNote || "없음"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 버튼들 */}
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}
          >
            <Button variant="outlined" onClick={() => setDetailView(null)}>
              주문목록 돌아가기
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteOrder}
            >
              주문내역 삭제
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OrderDetail;
