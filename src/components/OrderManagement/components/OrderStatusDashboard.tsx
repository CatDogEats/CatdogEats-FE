// src/components/OrderManagement/components/OrderStatusDashboard.tsx

import React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Payment as PaymentIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  DirectionsRun as TransitIcon,
  CheckCircle as DeliveredIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { BRAND_COLORS } from "@/components/SellerDashboard/SellerInfo";

interface OrderSummary {
  paymentCompleted: number;
  preparing: number;
  readyForDelivery: number;
  inTransit: number;
  delivered: number;
}

interface UrgentTasks {
  delayRequests: number;
  longTermUndelivered: number;
}

interface OrderStatusDashboardProps {
  orderSummary: OrderSummary;
  urgentTasks: UrgentTasks;
  onCardClick?: (status: string) => void;
}

/**
 * 주문 현황 대시보드 컴포넌트
 * Frontend-prototype의 원래 디자인을 복원한 현황 카드들
 */
const OrderStatusDashboard: React.FC<OrderStatusDashboardProps> = ({
  orderSummary,
  urgentTasks,
  onCardClick,
}) => {
  const statusCards = [
    {
      key: "paymentCompleted",
      title: "결제완료",
      count: orderSummary.paymentCompleted,
      icon: <PaymentIcon sx={{ fontSize: 32 }} />,
      color: BRAND_COLORS.PRIMARY,
      bgColor: `${BRAND_COLORS.PRIMARY}15`,
    },
    {
      key: "preparing",
      title: "상품준비중",
      count: orderSummary.preparing,
      icon: <InventoryIcon sx={{ fontSize: 32 }} />,
      color: "#f57c00",
      bgColor: "#fff3e0",
      urgent: urgentTasks.delayRequests > 0,
      urgentLabel: `지연 ${urgentTasks.delayRequests}건`,
    },
    {
      key: "readyForDelivery",
      title: "배송준비완료",
      count: orderSummary.readyForDelivery,
      icon: <ShippingIcon sx={{ fontSize: 32 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      key: "inTransit",
      title: "배송중",
      count: orderSummary.inTransit,
      icon: <TransitIcon sx={{ fontSize: 32 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
    },
    {
      key: "delivered",
      title: "배송완료",
      count: orderSummary.delivered,
      icon: <DeliveredIcon sx={{ fontSize: 32 }} />,
      color: "#2e7d32",
      bgColor: "#e8f5e8",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: BRAND_COLORS.TEXT_PRIMARY,
        }}
      >
        주문 현황 요약
      </Typography>

      <Grid
        container
        spacing={3}
        columns={{ xs: 12, sm: 12, md: 20 }} // md 이상은 20-column 체계
      >
        {statusCards.map((card) => (
          <Grid
            key={card.key}
            size={{ xs: 12, sm: 6, md: 4 }} // 4 / 20  → 20 %  (5칸)
          >
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                border: `1px solid ${BRAND_COLORS.BORDER}`,
                cursor: onCardClick ? "pointer" : "default",
                transition: "all 0.2s ease",
                backgroundColor: card.bgColor,
                "&:hover": onCardClick
                  ? {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${card.color}25`,
                    }
                  : {},
              }}
              onClick={() => onCardClick?.(card.key)}
            >
              {/* 아이콘 */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>

              {/* 카운트 */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: card.color,
                  mb: 1,
                  fontSize: "2.5rem",
                }}
              >
                {card.count}
              </Typography>

              {/* 제목 */}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  mb: card.urgent ? 1 : 0,
                }}
              >
                {card.title}
              </Typography>

              {/* 긴급 알림 */}
              {card.urgent && (
                <Chip
                  icon={<WarningIcon sx={{ fontSize: 16 }} />}
                  label={card.urgentLabel}
                  color="error"
                  size="small"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrderStatusDashboard;
