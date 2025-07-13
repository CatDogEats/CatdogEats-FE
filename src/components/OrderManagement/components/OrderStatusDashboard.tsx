// src/components/OrderManagement/components/OrderStatusDashboard.tsx

import React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { Grid } from "@mui/material";
import {
  Payment as PaymentIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  DirectionsRun as TransitIcon,
  CheckCircle as DeliveredIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { BRAND_COLORS } from "@/components/SellerDashboard/SellerInfo";
import type { OrderSummaryStats, UrgentTasks } from "@/types/sellerOrder.types";

interface OrderStatusDashboardProps {
  orderSummary: OrderSummaryStats;
  urgentTasks: UrgentTasks;
  onCardClick?: (status: string) => void;
}

interface StatusCardData {
  key: keyof OrderSummaryStats;
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  urgent?: boolean;
  urgentLabel?: string;
  description: string;
}

/**
 * 주문 현황 대시보드 컴포넌트
 * Frontend-prototype의 원래 디자인을 완전히 복원한 현황 카드들
 */
const OrderStatusDashboard: React.FC<OrderStatusDashboardProps> = ({
  orderSummary,
  urgentTasks,
  onCardClick,
}) => {
  // 상태별 카드 데이터 정의
  const statusCards: StatusCardData[] = [
    {
      key: "paymentCompleted",
      title: "결제완료",
      count: orderSummary.paymentCompleted,
      icon: <PaymentIcon sx={{ fontSize: 32 }} />,
      color: BRAND_COLORS.PRIMARY,
      bgColor: `${BRAND_COLORS.PRIMARY}15`,
      description: "결제가 완료되어 상품 준비를 시작할 수 있는 주문",
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
      description: "현재 상품을 준비하고 있는 주문",
    },
    {
      key: "readyForShipment",
      title: "배송준비완료",
      count: orderSummary.readyForShipment,
      icon: <ShippingIcon sx={{ fontSize: 32 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      description: "배송 준비가 완료되어 출고 대기 중인 주문",
    },
    {
      key: "inTransit",
      title: "배송중",
      count: orderSummary.inTransit,
      icon: <TransitIcon sx={{ fontSize: 32 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      urgent: urgentTasks.longTermUndelivered > 0,
      urgentLabel: `장기미배송 ${urgentTasks.longTermUndelivered}건`,
      description: "현재 배송 중인 주문",
    },
    {
      key: "delivered",
      title: "배송완료",
      count: orderSummary.delivered,
      icon: <DeliveredIcon sx={{ fontSize: 32 }} />,
      color: "#2e7d32",
      bgColor: "#e8f5e8",
      description: "배송이 성공적으로 완료된 주문",
    },
  ];

  // 전체 주문 수 계산
  const totalOrders = Object.values(orderSummary).reduce(
    (sum, count) => sum + count,
    0
  );

  // 전체 긴급 작업 수 계산
  const totalUrgentTasks =
    urgentTasks.delayRequests + urgentTasks.longTermUndelivered;

  return (
    <Box sx={{ mb: 4 }}>
      {/* 헤더 섹션 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: BRAND_COLORS.TEXT_PRIMARY,
          }}
        >
          주문 현황 요약
        </Typography>

        {/* 총 주문 수 및 긴급 작업 표시 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: BRAND_COLORS.TEXT_SECONDARY,
              fontWeight: 500,
            }}
          >
            총 {totalOrders}건의 주문
          </Typography>

          {totalUrgentTasks > 0 && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 16 }} />}
              label={`긴급 처리 ${totalUrgentTasks}건`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* 상태 카드 그리드 */}
      <Grid container spacing={3}>
        {statusCards.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                border: `1px solid ${BRAND_COLORS.BORDER}`,
                cursor: onCardClick ? "pointer" : "default",
                transition: "all 0.2s ease-in-out",
                backgroundColor: card.bgColor,
                position: "relative",
                "&:hover": onCardClick
                  ? {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 25px ${card.color}20`,
                      borderColor: card.color,
                    }
                  : {},
              }}
              onClick={() => onCardClick?.(card.key)}
            >
              {/* 긴급 표시 배지 */}
              {card.urgent && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                >
                  <Chip
                    icon={<WarningIcon sx={{ fontSize: 12 }} />}
                    label={card.urgentLabel}
                    color="error"
                    size="small"
                    variant="filled"
                    sx={{
                      fontSize: "0.65rem",
                      height: 20,
                    }}
                  />
                </Box>
              )}

              {/* 아이콘 */}
              <Box
                sx={{
                  color: card.color,
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>

              {/* 제목 */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  mb: 1,
                }}
              >
                {card.title}
              </Typography>

              {/* 카운트 */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: card.color,
                  mb: 1,
                }}
              >
                {card.count.toLocaleString()}
              </Typography>

              {/* 설명 */}
              <Typography
                variant="caption"
                sx={{
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                  display: "block",
                }}
              >
                {card.description}
              </Typography>

              {/* 진행률 바 (선택사항) */}
              {totalOrders > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 4,
                      backgroundColor: `${card.color}20`,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(card.count / totalOrders) * 100}%`,
                        height: "100%",
                        backgroundColor: card.color,
                        transition: "width 0.3s ease-in-out",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      fontSize: "0.7rem",
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    {totalOrders > 0
                      ? Math.round((card.count / totalOrders) * 100)
                      : 0}
                    %
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 추가 정보 섹션 */}
      {totalUrgentTasks > 0 && (
        <Box sx={{ mt: 3 }}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "#fff3e0",
              border: "1px solid #ffb74d",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon sx={{ color: "#f57c00", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{
                  color: "#ef6c00",
                  fontWeight: 600,
                }}
              >
                주의가 필요한 주문이 있습니다
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#bf360c",
                mt: 1,
                ml: 3,
              }}
            >
              • 출고 지연 요청: {urgentTasks.delayRequests}건
              {urgentTasks.longTermUndelivered > 0 && (
                <>
                  <br />• 장기 미배송: {urgentTasks.longTermUndelivered}건
                </>
              )}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrderStatusDashboard;
