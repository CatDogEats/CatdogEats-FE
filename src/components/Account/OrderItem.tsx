// src/components/Account/OrderItem.tsx
"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import type { Order } from "./index";

interface OrderItemProps {
  order: Order;
  handleOrderAction: (action: string, order: Order) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, handleOrderAction }) => {
  // 상태별 한글 레이블 매핑
  const statusLabel = (() => {
    switch (order.shippingStatus) {
      case "DELIVERED":
        return "배송완료";
      case "IN_DELIVERY":
        return "배송중";
      case "PREPARING":
        return "상품준비중";
      default:
        return "결제완료";
    }
  })();

  // 도착일 요일 한글
  const weekdayKor = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
      {/* 주문일자 */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        {order.orderDate.split("T")[0]} 주문
      </Typography>

      {/* 배송상태 */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 1, color: "primary.main" }}
      >
        {statusLabel}
      </Typography>

      {/* 도착일 (배송완료인 경우) */}
      {order.shippingStatus === "DELIVERED" && order.deliveredAt && (
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {`${new Date(order.deliveredAt).getMonth() + 1}/${new Date(
            order.deliveredAt
          ).getDate()}(${weekdayKor[new Date(order.deliveredAt).getDay()]}) 도착`}
        </Typography>
      )}

      {/* 상품 정보 영역 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
        {/* 이미지 플레이스홀더 */}
        <Box
          sx={{
            width: 60,
            height: 60,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#ddd",
              borderRadius: 0.5,
            }}
          />
        </Box>

        {/* 상품명 */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", lineHeight: 1.4 }}
          >
            {order.orderItemsInfo || order.productName || "상품명 정보 없음"}
          </Typography>
        </Box>
      </Box>

      {/* 결제 금액 */}
      <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
        {order.totalAmount
          ? `${order.totalAmount.toLocaleString()}원 ${order.quantity || 1}개`
          : order.amount
            ? `${order.amount.toLocaleString()}원 ${order.quantity || 1}개`
            : "금액 정보 없음"}
      </Typography>

      {/* 액션 버튼 */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOrderAction("shipping", order)}
          sx={{ borderColor: "#ff9800", color: "#ff9800", px: 2 }}
        >
          배송조회
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOrderAction("return", order)}
          sx={{ borderColor: "#ff9800", color: "#ff9800", px: 2 }}
        >
          교환, 반품 신청
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOrderAction("review", order)}
          sx={{ borderColor: "#ff9800", color: "#ff9800", px: 2 }}
        >
          리뷰 작성하기
        </Button>
      </Box>
    </Paper>
  );
};

export default OrderItem;
