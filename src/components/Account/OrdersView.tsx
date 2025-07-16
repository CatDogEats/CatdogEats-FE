// src/components/Account/OrdersView.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useBuyerOrderManagement } from "@/hooks/useBuyerOrders";

interface OrdersViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (p: string) => void;
  mockOrders: any[];
  handleOrderAction: (action: string, order: any) => Promise<void>;
}

const OrdersView: React.FC<OrdersViewProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPeriod,
  setSelectedPeriod,
  mockOrders,
  handleOrderAction,
}) => {
  // ✅ 모든 훅을 맨 처음에 호출 (조건문 없이)
  const { prototypeOrders, ordersLoading, ordersError, refreshOrders } =
    useBuyerOrderManagement();

  // ✅ 모든 함수와 변수들을 정의 (훅 호출 후)
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      payment_completed: "info",
      preparing: "warning",
      ready_for_delivery: "primary",
      in_transit: "secondary",
      delivered: "success",
      order_cancelled: "error",
    };
    return colorMap[status] || "default";
  };

  const normalizeOrders = (apiOrders: any[], mockOrders: any[]) => {
    if (apiOrders.length > 0) {
      return apiOrders.map((order) => ({
        ...order,
        status: order.shippingStatus || "payment_completed",
        statusColor: getStatusColor(
          order.shippingStatus || "payment_completed"
        ),
        deliveryDate: order.orderDate,
      }));
    } else {
      return mockOrders;
    }
  };

  const orders = normalizeOrders(prototypeOrders, mockOrders);

  const handleDelete = async (order: any) => {
    try {
      await handleOrderAction("delete", order);
      await refreshOrders();
    } catch (error) {
      console.error("주문 삭제 실패:", error);
    }
  };

  const filteredOrders = (orders as any[]).filter((order: any) => {
    // 검색 필터
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const productNames = order.products
        ? order.products.map((p: any) => p.name).join(" ")
        : order.productName || "";
      if (!productNames.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // 기간 필터
    if (selectedPeriod !== "전체") {
      const orderDate = new Date(order.date || order.orderDate);
      const now = new Date();

      if (selectedPeriod === "최근 6개월") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        if (orderDate < sixMonthsAgo) return false;
      } else if (selectedPeriod === "2025년") {
        if (orderDate.getFullYear() !== 2025) return false;
      } else if (selectedPeriod === "2024년") {
        if (orderDate.getFullYear() !== 2024) return false;
      }
    }

    return true;
  });

  return (
    <Box>
      {ordersLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : ordersError ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{ordersError}</Alert>
        </Box>
      ) : (
        <Box>
          {/* 검색 UI */}
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="주문번호, 상품명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </Box>

          {/* 기간 선택 UI */}
          <Box sx={{ mb: 3 }}>
            {["최근 6개월", "2025년", "2024년", "전체"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "contained" : "outlined"}
                onClick={() => setSelectedPeriod(period)}
                sx={{ mr: 1 }}
              >
                {period}
              </Button>
            ))}
          </Box>

          {/* 주문 목록 테이블 */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>상품정보</TableCell>
                  <TableCell>주문일</TableCell>
                  <TableCell>주문상태</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order.id || order.orderNumber}>
                    <TableCell>
                      {order.products
                        ? order.products.map((product: any) => (
                            <Typography key={product.name}>
                              {product.name}
                            </Typography>
                          ))
                        : order.productName}
                    </TableCell>
                    <TableCell>{order.orderDate || order.date}</TableCell>
                    <TableCell>
                      <Chip label={order.status} color={order.statusColor} />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDelete(order)}
                        color="error"
                        size="small"
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default OrdersView;
