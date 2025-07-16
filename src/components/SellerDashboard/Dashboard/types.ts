// src/components/SellerDashboard/Dashboard/types.ts

// 수요 예측 아이템 타입
export interface DemandForecastItem {
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    predictedQuantity: number;
    status: "재주문 필요" | "충분";
    confidenceScore: number;
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

export const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return "#6FCF97";
    if (confidence >= 80) return "#F2994A";
    return "#EB5757";
};