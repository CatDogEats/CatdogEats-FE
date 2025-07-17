// src/components/Account/OrderItem.tsx
"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import type { Order } from "@/types/buyerOrder.types";

interface OrderItemProps {
  order: Order;
  handleOrderAction: (action: string, order: Order) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, handleOrderAction }) => {
  // 상태별 한글 레이블 매핑
  const statusLabel = (() => {
    const st = order.shippingStatus?.toLowerCase();
    if (st === "delivered") return "배송완료";
    if (st === "in_delivery" || st === "in_transit") return "배송중";
    if (st === "preparing") return "상품준비중";
    return "결제완료";
  })();

  // 도착일 요일 한글
  const weekdayKor = ["일", "월", "화", "수", "목", "금", "토"];

  // 주문일자 안전 처리
  const orderDateStr =
    order.orderDate?.split("T")[0] ||
    order.date?.split("T")[0] ||
    "날짜 정보 없음";

  // 도착일 표시 문자열 생성
  const deliveredDate = order.deliveredAt || order.arrivalDate;
  const deliveredStr = deliveredDate
    ? (() => {
        const d = new Date(deliveredDate);
        return `${d.getMonth() + 1}/${d.getDate()}(${weekdayKor[d.getDay()]}) 도착`;
      })()
    : "배송완료";

  return (
    <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
      {/* 주문일자 */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        {orderDateStr} 주문
      </Typography>

      {/* 배송상태 */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 1, color: "primary.main" }}
      >
        {statusLabel}
      </Typography>

      {/* 도착일 (배송완료인 경우) */}
      {statusLabel === "배송완료" && (
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {order.deliveredAt || order.arrivalDate ? deliveredStr : ""}
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
            : order.total
              ? `${order.total.toLocaleString()}원 ${order.quantity || 1}개`
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOrderAction("detail", order)}
        >
          주문 상세보기
        </Button>
      </Box>
    </Paper>
  );
};

export default OrderItem;
