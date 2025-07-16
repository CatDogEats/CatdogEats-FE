"use client";

import type React from "react";
import { Paper, Typography, Box, Divider } from "@mui/material";

interface OrderTotalProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const OrderTotal: React.FC<OrderTotalProps> = ({
  subtotal,
  shipping,
  discount,
  total,
}) => {
  return (
    <Paper
      style={{
        padding: 24,
        backgroundColor: "#fcfaf8",
        border: "1px solid #f3eee7",
        borderRadius: 8,
      }}
    >
      <Typography variant="h6" style={{ marginBottom: 24, fontWeight: 600 }}>
        총 금액
      </Typography>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Typography color="text.secondary" style={{ fontSize: "0.875rem" }}>
          소계
        </Typography>
        <Typography style={{ fontWeight: 500 }}>
          {subtotal.toLocaleString()}원
        </Typography>
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Typography color="text.secondary" style={{ fontSize: "0.875rem" }}>
          배송비
        </Typography>
        <Typography style={{ fontWeight: 500 }}>
          {shipping.toLocaleString()}원
        </Typography>
      </Box>

      {discount > 0 && (
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Typography color="text.secondary" style={{ fontSize: "0.875rem" }}>
            할인
          </Typography>
          <Typography style={{ fontWeight: 500, color: "#d32f2f" }}>
            -{discount.toLocaleString()}원
          </Typography>
        </Box>
      )}

      <Divider
        style={{ marginTop: 16, marginBottom: 16, borderColor: "#e7ddd0" }}
      />

      <Box style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          총액
        </Typography>
        <Typography
          variant="h6"
          style={{ fontWeight: 700, fontSize: "1.25rem" }}
        >
          {total.toLocaleString()}원
        </Typography>
      </Box>
      <Box
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f5f5f5",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="body2"
          style={{
            fontSize: "0.75rem",
            color: "#666666",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          기본 배송비는 3,000원이며, 배송비 제외 총 금액이 50,000원 이상이면
          배송비가 무료입니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default OrderTotal;
