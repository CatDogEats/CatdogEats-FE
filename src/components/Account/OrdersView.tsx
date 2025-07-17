// src/components/Account/OrdersView.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Pagination,
} from "@mui/material";
import { useBuyerOrderManagement } from "@/hooks/useBuyerOrders";
import OrderItem from "./OrderItem";
import CustomStepIcon from "./CustomStepIcon";
import ArrowConnector from "./ArrowConnector";

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
  const { prototypeOrders, ordersLoading, ordersError } =
    useBuyerOrderManagement();

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

  const normalizeOrders = (apiOrders: any[], mockOrders: any[]) =>
    apiOrders.length > 0
      ? apiOrders.map((order) => ({
          ...order,
          status: order.shippingStatus || "payment_completed",
          statusColor: getStatusColor(
            order.shippingStatus || "payment_completed"
          ),
          deliveryDate: order.orderDate,
        }))
      : mockOrders;

  const orders = normalizeOrders(prototypeOrders, mockOrders);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const shippingSteps = [
    "결제 완료",
    "상품 준비중",
    "배송 준비 완료",
    "배송중",
    "배송 완료",
  ];

  const descriptions = [
    "주문 결제가\n완료되었습니다.",
    "판매자가 발송할\n상품을 준비중입니다.",
    "상품 준비가 완료되어\n택배를 배송 예정입니다.",
    "상품이 고객님께\n배송중입니다.",
    "상품이 주문자에게\n전달 완료되었습니다.",
  ];

  const filteredOrders = (orders as any[]).filter((order: any) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const productNames = order.products
        ? order.products.map((p: any) => p.name).join(" ")
        : order.productName || "";
      if (!productNames.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
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

          {/* 주문 목록 카드들 */}
          {filteredOrders.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                주문 내역이 없습니다.
              </Typography>
            </Paper>
          ) : (
            <>
              {filteredOrders
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((order: any) => (
                  <OrderItem
                    key={order.id || order.orderNumber}
                    order={order}
                    handleOrderAction={handleOrderAction}
                  />
                ))}

              {/* 페이지네이션 */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={Math.ceil(filteredOrders.length / itemsPerPage)}
                  page={currentPage}
                  onChange={(_event, value) => setCurrentPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}

          {/* 배송 상태 안내 Stepper */}
          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              배송 상태 안내
            </Typography>
            <Stepper
              activeStep={-1}
              alternativeLabel
              connector={<ArrowConnector />}
            >
              {shippingSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          whiteSpace: "pre-line",
                          mt: 0.5,
                          display: "block",
                        }}
                      >
                        {descriptions[index]}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrdersView;
