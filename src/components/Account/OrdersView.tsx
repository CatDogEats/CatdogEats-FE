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
import { useBuyerOrders } from "@/hooks/useBuyerOrders";
import { convertAPIDataToPrototype } from "@/types/buyerOrder.types";
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

  // 1) API 연동 추가
  const { prototypeOrders, loading, error, refreshOrders } = useBuyerOrders();
  // (만약 API 데이터 변환이 필요하다면 convertAPIDataToPrototype을 여기서 사용)

  // 2) API 데이터가 있으면 사용, 없으면 mockOrders 사용 (fallback)
  const orders = prototypeOrders.length > 0 ? prototypeOrders : mockOrders;

  // 3) 로딩 및 에러 처리
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

  // 4) 검색 및 기간 필터링 (orders로 변경)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchQuery.trim()) {
      filtered = filtered.filter((order) =>
        order.products.some((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedPeriod !== "최근 6개월") {
      filtered = filtered.filter((order) =>
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
  const handleDelete = async (order) => {
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
            variant="outlined"
            slotProps={{
              input: {
                endAdornment: <Search color="action" />,
              },
            }}
          />
        </Box>
        <Box style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
      <Box style={{ marginBottom: 32 }}>
        {paginatedOrders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            handleOrderAction={handleDelete}
          />
        ))}
      </Box>

      {/* 페이지네이션 */}
      <Box style={{ marginBottom: 32 }}>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Box>

      <Paper style={{ padding: 24, marginBottom: 32 }}>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            배송상품 주문상태 안내
          </Typography>
        </Box>
        <Stepper
          activeStep={-1}
          alternativeLabel
          connector={<ArrowConnector />}
          style={{ marginBottom: 32 }}
        >
          {shippingSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                slots={{ stepIcon: CustomStepIcon }}
                slotProps={{ stepIcon: { icon: index + 1 } }}
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
