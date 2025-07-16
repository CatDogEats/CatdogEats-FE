// src/components/SellerDashboard/Dashboard/SellerDashboardComponents.tsx
// 실제 파일 위치에 맞게 수정된 export

export { StatCards } from "./StatCards/StatCards";
export { SalesChart } from "./SalesChart/SalesChart";
export { ProductChart } from "./ProductChart/ProductChart";
export { DemandForecastPanel } from "@/components/SellerDashboard/Dashboard/DemandForecastPanel/DemandForecastPanel"; // 올바른 경로
export { OrderRecommendationPanel } from "@/components/SellerDashboard/Dashboard/OrderRecommendationPanel/OrderRecommendationPanel"; // 올바른 경로

// 더미 데이터는 제거 (더 이상 사용하지 않음)
// export { demandForecastData, getStatusColor } from "./SellerDashboardData";

// 필요한 타입들만 export (각 컴포넌트에서 정의된 타입들)
export type { StatItem } from "./StatCards/types";
export type { ChartSalesData } from "./SalesChart/types";
export type { ProductData, ProductChartData } from "./ProductChart/types";
export type { DemandForecastItem } from "./types";

// 헬퍼 함수들
export { getStatusColor, getConfidenceColor } from "./types";