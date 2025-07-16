// src/components/BuyerOrderTracking/components/OrdersViewEnhanced.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import {
  useBuyerOrderManagement,
  useErrorMessage,
} from "../../../hooks/useBuyerOrders";
import OrderItem from "@/components/Account/OrderItem";
import CustomStepIcon from "@/components/Account/CustomStepIcon";
import ArrowConnector from "@/components/Account/ArrowConnector";
import Pagination from "@/components/common/Pagination";
import GuideView from "@/components/Account/GuideView";
import type { Order } from "@/types/buyerOrder.types";
interface OrdersViewEnhancedProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  handleOrderAction: (action: string, order: any) => void;
}

const OrdersViewEnhanced: React.FC<OrdersViewEnhancedProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPeriod,
  setSelectedPeriod,
  handleOrderAction,
}) => {
  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success" => {
    const colorMap: Record<
      string,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "warning"
      | "info"
      | "success"
    > = {
      payment_completed: "info",
      preparing: "warning",
      ready_for_delivery: "primary",
      in_transit: "secondary",
      delivered: "success",
      order_cancelled: "error",
    };
    return colorMap[status] || "default";
  };

  // API 연동 훅
  const {
    prototypeOrders,
    ordersLoading,
    ordersError,
    actionLoading,
    actionError,
    deleteOrder,
  } = useBuyerOrderManagement();

  // 에러 메시지 관리
  const { errorMessage, showError, showErrorMessage, hideErrorMessage } =
    useErrorMessage();

  // 기존 프로토타입과 동일한 상태
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

  // 검색 및 기간 필터링 (기존 로직 유지)
  const filteredOrders = useMemo(() => {
    let filtered = prototypeOrders;

    if (searchQuery.trim()) {
      filtered = filtered.filter((order: Order) =>
        order.products.some(
          (product: { name: string; quantity: number; price: number }) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedPeriod !== "최근 6개월") {
      filtered = filtered.filter((order: Order) =>
        order.date.includes(selectedPeriod)
      );
    }

    return filtered;
  }, [prototypeOrders, searchQuery, selectedPeriod]);

  // 페이지네이션을 위한 주문 슬라이싱 (기존 로직 유지)
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 주문 액션 핸들러 (삭제 에러 처리 추가)
  const handleOrderActionEnhanced = async (action: string, order: Order) => {
    if (action === "delete") {
      try {
        await deleteOrder({ orderNumber: order.orderNumber });
        // 성공 시 페이지 새로고침은 훅에서 자동 처리됨
      } catch (error: any) {
        showErrorMessage(error.message);
      }
    } else {
      // 다른 액션들은 기존 핸들러로 전달
      handleOrderAction(action, order);
    }
  };

  // 에러 상태 처리
  React.useEffect(() => {
    if (ordersError) {
      showErrorMessage(ordersError);
    }
  }, [ordersError, showErrorMessage]);

  React.useEffect(() => {
    if (actionError) {
      showErrorMessage(actionError);
    }
  }, [actionError, showErrorMessage]);

  // 로딩 상태
  if (ordersLoading && prototypeOrders.length === 0) {
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

  return (
    <Box>
      <Typography
        variant="h4"
        style={{ fontWeight: "bold", marginBottom: 32, color: "text.primary" }}
      >
        주문/배송 조회
      </Typography>

      <Paper
        style={{ padding: 24, marginBottom: 32, backgroundColor: "#fef3e2" }}
      >
        <Box
          style={{
            display: "flex",
            gap: 16,
            alignItems: "end",
            marginBottom: 24,
          }}
        >
          <TextField
            fullWidth
            placeholder="주문한 상품을 검색할 수 있어요!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search style={{ marginRight: 8, color: "#9ca3af" }} />
              ),
            }}
            style={{ backgroundColor: "white" }}
          />
          <Box style={{ display: "flex", gap: 8 }}>
            {["최근 6개월", "2025년", "2024년"].map((period) => (
              <Chip
                key={period}
                label={period}
                clickable
                color={selectedPeriod === period ? "primary" : "default"}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  backgroundColor:
                    selectedPeriod === period ? "#ef9942" : "white",
                  color: selectedPeriod === period ? "white" : "black",
                }}
              />
            ))}
          </Box>
        </Box>

        <Stepper
          activeStep={-1}
          alternativeLabel
          connector={<ArrowConnector />}
          style={{ marginBottom: 24 }}
        >
          {shippingSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography
                  variant="body2"
                  style={{ fontWeight: 600, marginBottom: 4 }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    color: "#6b7280",
                    whiteSpace: "pre-line",
                    lineHeight: 1.3,
                  }}
                >
                  {descriptions[index]}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* 주문 목록 */}
      {paginatedOrders.length > 0 ? (
        <>
          {paginatedOrders.map((order: Order) => {
            const status = order.orderStatus.toLowerCase(); // ex. "delivered"
            return (
              <OrderItem
                key={order.id}
                order={{
                  ...order,
                  status, // 상태 문자열
                  statusColor: getStatusColor(status), // 컬러 키워드
                  deliveryDate: order.orderDate, // (필요에 따라 formatDate(order.orderDate) 로 교체)
                }}
                onAction={handleOrderActionEnhanced}
                isActionLoading={actionLoading}
              />
            );
          })}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </>
      ) : ordersLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <GuideView />
      )}

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

export default OrdersViewEnhanced;
