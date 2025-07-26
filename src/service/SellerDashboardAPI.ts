// src/services/SellerDashboardAPI.ts
import {apiClient, retryIfUnauthorized} from '@/service/auth/AuthAPI';

// ===== 백엔드 응답 타입 정의 =====

export interface TodayStatsResponse {
    todayOrderCount: number;
    todayTotalSales: number;
}

export interface WeeklySalesResponse {
    salesDate: string; // "2025-07-14" 형식
    dailySales: number;
}

export interface ProductRankingResponse {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalSales: number;
}

export interface DemandForecastResponse {
    id: string;
    sellerId: string;
    productId: string;
    productName: string;
    currentStock: number;
    predictedQuantity: number; // 7일 판매량 예측
    shortageQuantity: number;
    algorithmType: string;
    confidenceScore: number; // API에는 있지만 UI에서는 사용하지 않음
    forecastDate: string;
}

export interface SellerDashboardResponse {
    todayStats: TodayStatsResponse;
    weeklySales: WeeklySalesResponse[];
    productRanking: ProductRankingResponse[];
    demandForecasts: DemandForecastResponse[];
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ===== 프론트엔드에서 사용할 변환된 타입 =====

export interface StatCardData {
    title: string;
    value: string;
    color: string;
}

export interface ChartSalesData {
    date: string;
    amount: number;
    displayDate: string; // "월", "화" 등
}

export interface ProductChartData {
    productId: string;
    productName: string;
    totalSales: number;
    totalQuantity: number;
    percentage: number;
    color: string;
}

export interface DemandForecastItem {
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    predictedQuantity: number; // 7일 판매량 예측
    status: "재주문 필요" | "충분";
}

// ===== API 서비스 함수 =====

export const sellerDashboardApi = {
    /**
     * 판매자 대시보드 데이터 조회
     */
    getDashboardData: async (): Promise<SellerDashboardResponse> => {
        try {
            const response = await apiClient.get<APIResponse<SellerDashboardResponse>>(
                '/v1/sellers/dashboard'
            );
            return response.data.data;
        } catch (error: any) {
            return await retryIfUnauthorized(error, () => sellerDashboardApi.getDashboardData());
        }
    }
};

// ===== 데이터 변환 유틸리티 함수 =====

/**
 * 통계 카드 데이터 변환
 */
export const transformToStatCards = (todayStats: TodayStatsResponse): StatCardData[] => {
    return [
        {
            title: "오늘 주문 수",
            value: `${todayStats.todayOrderCount.toLocaleString()}건`,
            color: "#ef9942"
        },
        {
            title: "오늘 매출",
            value: `₩${todayStats.todayTotalSales.toLocaleString()}`,
            color: "#6FCF97"
        }
    ];
};

/**
 * 주간 매출 차트 데이터 변환 (올바른 요일 매칭)
 */
export const transformToSalesChart = (weeklySales: WeeklySalesResponse[]): ChartSalesData[] => {
    // 일주일 요일 순서 (일요일부터 시작)
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

    // 7일간의 데이터를 요일별로 정리
    const salesByDay: { [key: string]: number } = {};

    // 백엔드 데이터를 날짜별로 매핑
    weeklySales.forEach(item => {
        const date = new Date(item.salesDate);
        const dayOfWeek = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
        const dayName = weekDays[dayOfWeek];
        salesByDay[dayName] = item.dailySales;
    });

    // 일주일 전체 데이터 생성 (없는 요일은 0으로)
    return weekDays.map(dayName => ({
        date: "", // 실제 날짜는 필요시 계산
        amount: salesByDay[dayName] || 0,
        displayDate: dayName
    }));
};

/**
 * 상품 차트 데이터 변환 (전체 상품 사용)
 */
export const transformToProductChart = (productRanking: ProductRankingResponse[]): ProductChartData[] => {
    const colors = [
        "#ef9942", "#6FCF97", "#3182ce", "#ed8936", "#9f7aea",
        "#38b2ac", "#f56565", "#805ad5", "#4fd1c7", "#f093fb",
        "#63b3ed", "#68d391", "#fbb6ce", "#a78bfa", "#34d399"
    ];

    const totalSales = productRanking.reduce((sum, product) => sum + product.totalSales, 0);

    return productRanking.map((product, index) => ({
        productId: product.productId,
        productName: product.productName,
        totalSales: product.totalSales,
        totalQuantity: product.totalQuantity,
        percentage: totalSales > 0 ? Math.round((product.totalSales / totalSales) * 100) : 0,
        color: colors[index % colors.length]
    }));
};

/**
 * 수요 예측 데이터 변환 (수정됨)
 * - confidenceScore 제거
 * - 재주문 필요 조건: currentStock < predictedQuantity (7일 예측량)
 */
export const transformToDemandForecast = (demandForecasts: DemandForecastResponse[]): DemandForecastItem[] => {
    return demandForecasts.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        currentStock: item.currentStock,
        predictedQuantity: item.predictedQuantity, // 7일 판매량 예측 그대로 사용
        status: item.currentStock < item.predictedQuantity ? "재주문 필요" : "충분"
    }));
};

/**
 * 주문 추천 상품 필터링 (재주문 필요한 상품만)
 */
export const getReorderRecommendations = (demandForecasts: DemandForecastItem[]) => {
    return demandForecasts.filter(item => item.status === "재주문 필요");
};