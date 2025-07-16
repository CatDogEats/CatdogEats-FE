// src/components/Account/OrdersView.tsx
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useBuyerOrderList } from "@/hooks/useBuyerOrders";
import type { OrdersViewProps } from "./index";
import OrderItem from "./OrderItem";
import CustomStepIcon from "./CustomStepIcon";
import ArrowConnector from "./ArrowConnector";
import Pagination from "../common/Pagination";
import GuideView from "@/components/Account/GuideView.tsx";

const OrdersView: React.FC<OrdersViewProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPeriod,
  setSelectedPeriod,
  mockOrders,
  handleOrderAction,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1) API 연동
  const { prototypeOrders, loading, error, refreshOrders } =
    useBuyerOrderList();

  // 2) 로딩 및 에러 처리
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 3) API 데이터가 있으면 사용, 없으면 mockOrders 사용
  const orders = prototypeOrders.length > 0 ? prototypeOrders : mockOrders;

  // 4) 검색 및 기간 필터링
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchQuery.trim()) {
      filtered = filtered.filter((order: any) =>
        order.products.some((product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedPeriod !== "최근 6개월") {
      filtered = filtered.filter((order: any) =>
        order.date.includes(selectedPeriod)
      );
    }

    return filtered;
  }, [searchQuery, selectedPeriod, orders]);

  // 5) 페이지네이션
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 6) 주문 삭제 핸들러 (삭제 후 목록 새로고침)
  const handleDelete = async (order: any) => {
    try {
      await handleOrderAction("delete", order);
      await refreshOrders();
    } catch (err) {
      console.error("주문 삭제 실패:", err);
    }
  };

  // 배송 단계 정보
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

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 4, color: "text.primary" }}
      >
        주문/배송 조회
      </Typography>

      <Paper sx={{ p: 3, mb: 4, bgcolor: "#fef3e2" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", mb: 3 }}>
          <TextField
            fullWidth
            placeholder="주문한 상품을 검색할 수 있어요!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              endAdornment: <Search color="action" />,
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {["최근 6개월", "2025", "2024", "2023", "2022", "2021", "2020"].map(
            (period) => (
              <Chip
                key={period}
                label={period}
                color={selectedPeriod === period ? "primary" : "default"}
                variant={selectedPeriod === period ? "filled" : "outlined"}
                onClick={() => setSelectedPeriod(period)}
                size="small"
              />
            )
          )}
        </Box>
      </Paper>

      {/* 페이지네이션된 주문 목록 */}
      <Box sx={{ mb: 4 }}>
        {paginatedOrders.map((order: any) => (
          <OrderItem
            key={order.id}
            order={order}
            handleOrderAction={handleDelete}
          />
        ))}
      </Box>

      {/* 페이지네이션 컨트롤 */}
      <Box sx={{ mb: 4 }}>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Box>

      {/* 배송 단계 안내 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          배송상품 주문상태 안내
        </Typography>
        <Stepper
          activeStep={-1}
          alternativeLabel
          connector={<ArrowConnector />}
          sx={{ mb: 3 }}
        >
          {shippingSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                StepIconProps={{ icon: index + 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-line", textAlign: "center" }}
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
