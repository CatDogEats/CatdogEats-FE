// src/components/SellerDashboard/Dashboard/StatCards/types.ts

// 통계 카드 타입
export interface StatItem {
    title: string;
    value: string;
    color: string;
}

// 수요 예측 아이템 타입 (기존 DemandForecastItem 대체)
export interface DemandForecastItem {
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    predictedQuantity: number; // 7일 판매량 예측
    status: "재주문 필요" | "충분";
}

// 상품 차트 데이터 타입
export interface ProductData {
    name: string;
    value: number;
    color: string;
}

// 주간 매출 차트 데이터 타입
export interface SalesData {
    date: string;
    amount: number;
    displayDate: string;
}

// 헬퍼 함수들
export const getStatusColor = (status: string): string => {
    switch (status) {
        case "재주문 필요":
            return "#F2994A";
        case "충분":
            return "#6FCF97";
        default:
            return "#A59A8E";
    }
};