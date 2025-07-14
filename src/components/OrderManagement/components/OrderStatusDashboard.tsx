// src/components/OrderManagement/components/OrderStatusDashboard.tsx

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid2 as Grid,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  DirectionsRun as TransitIcon,
  CheckCircle as DeliveredIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
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
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * 주문 현황 대시보드 컴포넌트
 * Frontend-prototype의 완전한 카드 디자인 복원
 * - 브랜드 컬러 통일
 * - 완전한 인터랙션
 * - 통계 표시
 * - 긴급 상황 알림
 */
const OrderStatusDashboard: React.FC<OrderStatusDashboardProps> = ({
  orderSummary,
  urgentTasks,
  onCardClick,
}) => {
  // 상태별 카드 데이터 정의 (프로토타입과 동일)
  const statusCards: StatusCardData[] = [
    {
      key: "paymentCompleted",
      title: "결제완료",
      count: orderSummary.paymentCompleted,
      icon: <PaymentIcon sx={{ fontSize: 32 }} />,
      color: BRAND_COLORS.PRIMARY,
      bgColor: `${BRAND_COLORS.PRIMARY}15`,
      description: "결제가 완료되어 상품 준비를 시작할 수 있는 주문",
      trend: {
        value: 12,
        isPositive: true,
      },
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
      trend: {
        value: 5,
        isPositive: false,
      },
    },
    {
      key: "readyForShipment",
      title: "배송준비완료",
      count: orderSummary.readyForShipment,
      icon: <ShippingIcon sx={{ fontSize: 32 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      description: "배송 준비가 완료되어 출고 대기 중인 주문",
      trend: {
        value: 8,
        isPositive: true,
      },
    },
    {
      key: "inTransit",
      title: "배송중",
      count: orderSummary.inTransit,
      icon: <TransitIcon sx={{ fontSize: 32 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      description: "현재 배송 중인 주문",
      trend: {
        value: 15,
        isPositive: true,
      },
    },
    {
      key: "delivered",
      title: "배송완료",
      count: orderSummary.delivered,
      icon: <DeliveredIcon sx={{ fontSize: 32 }} />,
      color: "#4caf50",
      bgColor: "#e8f5e8",
      description: "배송이 완료된 주문",
      trend: {
        value: 20,
        isPositive: true,
      },
    },
  ];

  // 카드 클릭 핸들러
  const handleCardClick = (statusKey: string) => {
    if (onCardClick) {
      onCardClick(statusKey);
    }
  };

  // 개별 상태 카드 컴포넌트
  const StatusCard: React.FC<{ data: StatusCardData }> = ({ data }) => (
    <Card
      sx={{
        cursor: onCardClick ? "pointer" : "default",
        transition: "all 0.3s ease-in-out",
        border: `1px solid ${BRAND_COLORS.BORDER}`,
        borderRadius: 2,
        height: "100%",
        position: "relative",
        overflow: "visible",
        "&:hover": onCardClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 25px rgba(0,0,0,0.12)`,
              borderColor: data.color,
            }
          : {},
      }}
      onClick={() => handleCardClick(data.key)}
    >
      {/* 긴급 표시 배지 */}
      {data.urgent && data.urgentLabel && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: 12,
            zIndex: 1,
          }}
        >
          <Chip
            icon={<WarningIcon sx={{ fontSize: 14 }} />}
            label={data.urgentLabel}
            color="error"
            size="small"
            variant="filled"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
              boxShadow: 2,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.7 },
                "100%": { opacity: 1 },
              },
            }}
          />
        </Box>
      )}

      <CardContent sx={{ p: 3, height: "100%" }}>
        {/* 상단: 아이콘과 숫자 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              backgroundColor: data.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: data.color,
              border: `2px solid ${data.color}20`,
            }}
          >
            {data.icon}
          </Box>

          {/* 트렌드 표시 */}
          {data.trend && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                padding: "4px 8px",
                borderRadius: 1,
                backgroundColor: data.trend.isPositive ? "#e8f5e8" : "#ffebee",
                color: data.trend.isPositive ? "#4caf50" : "#f44336",
              }}
            >
              <TrendingUpIcon
                sx={{
                  fontSize: 14,
                  transform: data.trend.isPositive ? "none" : "rotate(180deg)",
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {data.trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* 중간: 숫자와 제목 */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: BRAND_COLORS.TEXT_PRIMARY,
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {data.count.toLocaleString()}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: BRAND_COLORS.TEXT_PRIMARY,
              lineHeight: 1.2,
            }}
          >
            {data.title}
          </Typography>
        </Box>

        {/* 하단: 설명 */}
        <Typography
          variant="body2"
          sx={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            lineHeight: 1.4,
            fontSize: "0.875rem",
          }}
        >
          {data.description}
        </Typography>

        {/* 진행률 바 (선택적) */}
        {data.key === "preparing" && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                처리 진행률
              </Typography>
              <Typography variant="caption" color="text.secondary">
                75%
              </Typography>
            </Box>
            <Box
              sx={{
                width: "100%",
                height: 6,
                backgroundColor: BRAND_COLORS.PROGRESS_BG,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "75%",
                  height: "100%",
                  backgroundColor: data.color,
                  borderRadius: 3,
                  transition: "width 1s ease-in-out",
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // 긴급 작업 현황 카드
  const UrgentTaskCard: React.FC = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY}15 0%, ${BRAND_COLORS.PRIMARY}05 100%)`,
        border: `2px solid ${BRAND_COLORS.PRIMARY}30`,
        borderRadius: 2,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: BRAND_COLORS.PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <ScheduleIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: BRAND_COLORS.TEXT_PRIMARY }}
            >
              긴급 작업 현황
            </Typography>
            <Typography variant="body2" color="text.secondary">
              즉시 처리가 필요한 작업들
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "white",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#f57c00", mb: 0.5 }}
              >
                {urgentTasks.delayRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                출고 지연 요청
              </Typography>
            </Box>
          </Grid>
          <Grid xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "white",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#d32f2f", mb: 0.5 }}
              >
                {urgentTasks.longTermUndelivered}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                장기 미배송
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* 긴급 작업이 있을 경우 표시 */}
      {(urgentTasks.delayRequests > 0 ||
        urgentTasks.longTermUndelivered > 0) && <UrgentTaskCard />}

      {/* 상태별 카드들 */}
      <Grid container spacing={3}>
        {statusCards.map((cardData) => (
          <Grid xs={12} sm={6} md={2.4} key={cardData.key}>
            <StatusCard data={cardData} />
          </Grid>
        ))}
      </Grid>

      {/* 추가 통계 정보 */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${BRAND_COLORS.BORDER}`,
              backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: BRAND_COLORS.TEXT_PRIMARY }}
            >
              오늘의 처리 현황
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                처리 완료율
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: BRAND_COLORS.PRIMARY }}
              >
                {Math.round(
                  (orderSummary.delivered /
                    (orderSummary.paymentCompleted +
                      orderSummary.preparing +
                      orderSummary.readyForShipment +
                      orderSummary.inTransit +
                      orderSummary.delivered) || 0) * 100
                )}
                %
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${BRAND_COLORS.BORDER}`,
              backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: BRAND_COLORS.TEXT_PRIMARY }}
            >
              전체 주문 수
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                총 주문 건수
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: BRAND_COLORS.PRIMARY }}
              >
                {(
                  orderSummary.paymentCompleted +
                  orderSummary.preparing +
                  orderSummary.readyForShipment +
                  orderSummary.inTransit +
                  orderSummary.delivered
                ).toLocaleString()}
                건
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderStatusDashboard;
