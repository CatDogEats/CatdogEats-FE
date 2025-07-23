// src/components/Account/OrdersView.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useBuyerOrderManagement } from "@/hooks/useBuyerOrders";
import OrderItem from "./OrderItem";
import CustomStepIcon from "./CustomStepIcon";
import ArrowConnector from "./ArrowConnector";
import Pagination from "../common/Pagination";
import GuideView from "@/components/Account/GuideView";

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
  const { prototypeOrders, ordersLoading, ordersError } = useBuyerOrderManagement();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const shippingSteps = ["결제 완료", "상품 준비중", "배송 준비 완료", "배송중", "배송 완료"];

  const descriptions = [
    "주문 결제가\n완료되었습니다.",
    "판매자가 발송할\n상품을 준비중입니다.",
    "상품 준비가 완료되어\n택배를 배송 예정입니다.",
    "상품이 고객님께\n배송중입니다.",
    "상품이 주문자에게\n전달 완료되었습니다.",
  ];

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
            statusColor: getStatusColor(order.shippingStatus || "payment_completed"),
            deliveryDate: order.orderDate,
            // API 데이터를 새로운 UI 형식에 맞게 변환
            date: order.orderDate?.split("T")[0] || order.date,
            products: order.orderItems?.map((item: any) => ({
              id: item.orderItemId,
              name: item.productName,
              price: item.unitPrice,
              quantity: item.quantity,
              image: item.productImage,
            })) || [],
            total: order.paymentInfo?.finalAmount || order.totalAmount || 0,
          }))
          : mockOrders;

  const orders = normalizeOrders(prototypeOrders, mockOrders);

  // 검색 및 기간 필터링
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter((order) =>
          order.products?.some((product: any) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderItemsInfo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 기간 필터
    if (selectedPeriod !== "최근 6개월") {
      if (selectedPeriod === "전체") {
        // 모든 주문 표시
      } else {
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.date || order.orderDate);
          const now = new Date();

          if (selectedPeriod === "2025") {
            return orderDate.getFullYear() === 2025;
          } else if (selectedPeriod === "2024") {
            return orderDate.getFullYear() === 2024;
          } else if (selectedPeriod === "2023") {
            return orderDate.getFullYear() === 2023;
          } else if (selectedPeriod === "2022") {
            return orderDate.getFullYear() === 2022;
          } else if (selectedPeriod === "2021") {
            return orderDate.getFullYear() === 2021;
          } else if (selectedPeriod === "2020") {
            return orderDate.getFullYear() === 2020;
          }
          return true;
        });
      }
    }

    return filtered;
  }, [orders, searchQuery, selectedPeriod]);

  // 페이지네이션을 위한 주문 슬라이싱
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (ordersLoading) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
    );
  }

  if (ordersError) {
    return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{ordersError}</Alert>
        </Box>
    );
  }

  return (
      <Box>
        <Typography variant="h4" style={{ fontWeight: "bold", marginBottom: 32, color: "text.primary" }}>
          주문/배송 조회
        </Typography>

        <Paper style={{ padding: 24, marginBottom: 32, backgroundColor: "#fef3e2" }}>
          <Box style={{ display: "flex", gap: 16, alignItems: "end", marginBottom: 24 }}>
            <TextField
                fullWidth
                placeholder="주문한 상품을 검색할 수 있어요!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: <Search color="action" />
                  }
                }}
            />
          </Box>
          <Box style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["최근 6개월", "2025", "2024", "2023", "2022", "2021", "2020"].map((period) => (
                <Chip
                    key={period}
                    label={period}
                    color={selectedPeriod === period ? "primary" : "default"}
                    variant={selectedPeriod === period ? "filled" : "outlined"}
                    onClick={() => setSelectedPeriod(period)}
                    size="small"
                />
            ))}
          </Box>
        </Paper>

        {/* 페이지네이션된 주문 목록 */}
        <Box style={{ marginBottom: 32 }}>
          {paginatedOrders.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  주문 내역이 없습니다.
                </Typography>
              </Paper>
          ) : (
              paginatedOrders.map((order) => (
                  <OrderItem key={order.id || order.orderNumber} order={order} handleOrderAction={handleOrderAction} />
              ))
          )}
        </Box>

        {/* 페이지네이션 */}
        {filteredOrders.length > itemsPerPage && (
            <Box style={{ marginBottom: 32 }}>
              <Pagination
                  currentPage={currentPage}
                  totalItems={filteredOrders.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
              />
            </Box>
        )}

        <Paper style={{ padding: 24, marginBottom: 32 }}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              배송상품 주문상태 안내
            </Typography>
          </Box>

          <Stepper activeStep={-1} alternativeLabel connector={<ArrowConnector />} style={{ marginBottom: 32 }}>
            {shippingSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                      slots={{
                        stepIcon: CustomStepIcon,
                      }}
                      slotProps={{
                        stepIcon: {
                          icon: index + 1,
                        },
                      }}
                  >
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        style={{ textAlign: "center", whiteSpace: "pre-line" }}
                    >
                      {descriptions[index]}
                    </Typography>
                  </StepLabel>
                </Step>
            ))}
          </Stepper>
        </Paper>

        <GuideView />
      </Box>
  );
};

export default OrdersView;