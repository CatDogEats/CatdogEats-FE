// src/components/SellerDashboard/Dashboard/SellerDashboardData.tsx

// 타입 정의
export interface DemandForecastItem {
  product: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrder: number;
  confidence: number;
  trend: "급증" | "증가" | "안정" | "감소";
  status: "긴급 재주문" | "재주문 필요" | "충분";
}


// 헬퍼 함수들
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "긴급 재주문":
      return "#EB5757";
    case "재주문 필요":
      return "#F2994A";
    case "충분":
      return "#6FCF97";
    default:
      return "#A59A8E";
  }
};