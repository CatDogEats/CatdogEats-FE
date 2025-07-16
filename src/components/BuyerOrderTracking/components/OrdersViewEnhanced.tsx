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
} from "@/hooks/useBuyerOrders";
import OrderItem from "@/components/Account/OrderItem";
import CustomStepIcon from "@/components/Account/CustomStepIcon";
import ArrowConnector from "@/components/Account/ArrowConnector";
import Pagination from "@/components/common/Pagination";
import GuideView from "@/components/Account/GuideView";

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
  // API 연동 훅
  const {
    prototypeOrders,
    ordersLoading,
    ordersError,
    actionLoading,
    actionError,
    pagination,
    setPagination,
    refreshOrders,
    deleteOrder,
    searchOrders,
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

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter((order) =>
        order.products.some((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // 기간 필터
    if (selectedPeriod !== "최근 6개월") {
      filtered = filtered.filter((order) =>
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
  const handleOrderActionEnhanced = async (action: string, order: any) => {
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
          {paginatedOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onAction={handleOrderActionEnhanced}
              isActionLoading={actionLoading}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
            onPageChange={handlePageChange}
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
