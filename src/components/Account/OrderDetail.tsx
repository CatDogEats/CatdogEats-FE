// src/components/Account/OrderDetail.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ChevronRight, MoreVert } from "@mui/icons-material";
import type { Order } from "./index";
import { useBuyerOrderDetail } from "@/hooks/useBuyerOrders";
import { buyerOrderApi } from "@/service/api/buyerOrderApi";

interface OrderDetailProps {
  selectedOrder: Order | null;
  setDetailView: (view: string | null) => void;
  handleOrderAction: (action: string, order: Order) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  selectedOrder,
  setDetailView,
  handleOrderAction,
}) => {
  // API 연동
  const { orderDetail, loading, error } = useBuyerOrderDetail(
    selectedOrder?.orderNumber
  );

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => setDetailView(null)}>돌아가기</Button>
      </Box>
    );
  }

  // 데이터 없음
  if (!orderDetail) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">주문 정보를 찾을 수 없습니다.</Alert>
        <Button onClick={() => setDetailView(null)}>돌아가기</Button>
      </Box>
    );
  }

  // 주문 삭제 핸들러
  const handleDeleteOrder = async () => {
    try {
      await buyerOrderApi.deleteBuyerOrder({
        orderNumber: selectedOrder!.orderNumber,
      });
      setDetailView(null);
      await handleOrderAction("refresh", selectedOrder!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        주문상세
      </Typography>

      <Typography variant="h6" sx={{ mb: 1 }}>
        {orderDetail.orderDate}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        주문번호: {orderDetail.orderNumber}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ mb: 4, border: "1px solid rgba(224, 224, 224, 1)" }}
      >
        <Table sx={{ minWidth: 650, borderCollapse: "separate" }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  verticalAlign: "top",
                  width: "70%",
                  borderBottom: "none",
                  pr: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#111111" }}
                    >
                      {orderDetail.status}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          orderDetail.statusColor === "success"
                            ? "#008C00"
                            : "text.secondary",
                      }}
                    >
                      {orderDetail.deliveryDate} 도착
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>

                {orderDetail.orderItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "80px",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.price > 0
                            ? `${item.price.toLocaleString()}원`
                            : "0원"}{" "}
                          {item.quantity}개
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "100%",
                        }}
                      >
                        <Button variant="outlined" size="small">
                          장바구니 담기
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </TableCell>

              <TableCell
                sx={{
                  verticalAlign: "middle",
                  width: "30%",
                  borderLeft: "1px solid rgba(224, 224, 224, 1)",
                  paddingLeft: 3,
                  borderBottom: "none",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleOrderAction("shipping", orderDetail as any)
                    }
                  >
                    배송조회
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleOrderAction("return", orderDetail as any)
                    }
                  >
                    교환, 반품 신청
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleOrderAction("review", orderDetail as any)
                    }
                  >
                    리뷰 작성하기
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        받는사람 정보
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
              <TableCell>홍길동</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                연락처
              </TableCell>
              <TableCell>010-1234-5678</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                받는주소
              </TableCell>
              <TableCell>(06627) 서울특별시 서초구 반포대로 45 4층</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                배송요청사항
              </TableCell>
              <TableCell>세대 : 기타 (택배함)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

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
                    {orderDetail.paymentInfo.finalAmount.toLocaleString()} 원
                  </Typography>
                  <Typography variant="body2">
                    할인금액:{" "}
                    {orderDetail.paymentInfo.finalAmount.toLocaleString()} 원
                  </Typography>
                  <Typography variant="body2">배송비: 0 원</Typography>
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
    </Box>
  );
};

export default OrderDetail;
