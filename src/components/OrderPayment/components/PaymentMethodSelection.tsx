// src/components/OrderPayment/components/PaymentMethodSelection.tsx
"use client";

import type React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import type { PaymentMethodSelectionProps } from "../types/orderPayment.types";

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  availableCoupons,
  selectedCoupon,
  onCouponSelect,
  isCouponApplicable,
  discountAmount,
}) => {
  return (
    <Card
      style={{ marginBottom: 32, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <CardContent style={{ padding: 32 }}>
        <Typography
          variant="h5"
          component="h2"
          style={{ marginBottom: 32, fontWeight: 600, color: "#1b150e" }}
        >
          쿠폰
        </Typography>

        <Box style={{ marginBottom: 32 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="coupon-label" shrink sx={{ color: "#97784e" }}>
              쿠폰을 선택하세요
            </InputLabel>
            <Select
              labelId="coupon-label"
              label="쿠폰을 선택하세요"
              value={selectedCoupon}
              onChange={(e) => onCouponSelect(e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <em style={{ color: "#97784e" }}>쿠폰을 선택하세요</em>
                  );
                }
                const coupon = availableCoupons.find((c) => c.id === selected);
                return coupon ? coupon.name : "";
              }}
              sx={{
                backgroundColor: "#fcfaf8",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e7ddd0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e89830",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e89830",
                },
              }}
            >
              <MenuItem value="">
                <em>쿠폰 없음</em>
              </MenuItem>
              {availableCoupons.map((coupon) => {
                const isApplicable = isCouponApplicable(coupon);
                return (
                  <MenuItem
                    key={coupon.id}
                    value={coupon.id}
                    disabled={!isApplicable}
                    style={{
                      opacity: isApplicable ? 1 : 0.5,
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          {coupon.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {coupon.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          coupon.type === "percentage"
                            ? `${coupon.value}% 할인`
                            : `$${coupon.value} 할인`
                        }
                        size="small"
                        variant="outlined"
                        color={isApplicable ? "primary" : "default"}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        {selectedCoupon && discountAmount > 0 && (
          <Alert
            severity="success"
            style={{
              backgroundColor: "#e8f5e8",
              border: "1px solid #4caf50",
              borderRadius: 8,
            }}
          >
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              쿠폰 할인: ${discountAmount.toFixed(2)} 절약!
            </Typography>
          </Alert>
        )}

        {selectedCoupon && discountAmount === 0 && (
          <Alert
            severity="warning"
            style={{
              backgroundColor: "#fff3e0",
              border: "1px solid #ff9800",
              borderRadius: 8,
            }}
          >
            <Typography variant="body2">
              선택한 쿠폰의 최소 주문 금액을 충족하지 않습니다.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelection;
