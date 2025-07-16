// src/service/SalesAnalyticsAPI.ts
import { apiClient } from '@/service/auth/AuthAPI.ts';

// ===== 백엔드 응답 타입 정의 =====

export interface MonthlyDataResponse {
    month: number;
    totalAmount: number;
    orderCount: number;
    totalQuantity: number;
}

export interface PeriodSalesAnalyticsResponse {
    year: number;
    yearTotalAmount: number;
    yearTotalOrderCount: number;
    yearTotalQuantity: number;
    monthlyData: MonthlyDataResponse[];
}

export interface ProductSalesItemResponse {
    productId: string;
    productName: string;
    totalAmount: number;
    quantity: number;
    percentage: number;
}

export interface ProductSalesPageResponse {
    content: ProductSalesItemResponse[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface ProductSalesAnalyticsResponse {
    type: 'yearly' | 'monthly';
    year: number;
    month?: number;
    totalAmount: number;
    products: ProductSalesPageResponse;
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors?: any[];
}

// ===== 요청 파라미터 타입 =====

export type SalesAnalyticsType = 'YEARLY' | 'MONTHLY';

export interface ProductSalesParams {
    type: SalesAnalyticsType;
    year: number;
    month?: number;
    page?: number;
    size?: number;
}

// ===== API 서비스 함수 =====

export const salesAnalyticsApi = {
    /**
     * 1. 기간별 매출 분석 조회 (년도별 월별 집계)
     */
    getPeriodSalesAnalytics: async (year: number): Promise<PeriodSalesAnalyticsResponse> => {
        const response = await apiClient.get<APIResponse<PeriodSalesAnalyticsResponse>>(
            `/v1/sellers/analytics/sales/period?year=${year}`
        );
        return response.data.data;
    },

    /**
     * 2. 상품별 매출 분석 조회 (연도별/월별 + 페이징)
     */
    getProductSalesAnalytics: async (params: ProductSalesParams): Promise<ProductSalesAnalyticsResponse> => {
        const queryParams = new URLSearchParams();

        queryParams.append('type', params.type);
        queryParams.append('year', params.year.toString());

        if (params.month !== undefined && params.type === 'MONTHLY') {
            queryParams.append('month', params.month.toString());
        }

        queryParams.append('page', (params.page || 0).toString());
        queryParams.append('size', (params.size || 10).toString());

        const response = await apiClient.get<APIResponse<ProductSalesAnalyticsResponse>>(
            `/v1/sellers/analytics/sales/products?${queryParams.toString()}`
        );
        return response.data.data;
    }
};

// ===== 데이터 변환 유틸리티 함수 =====

/**
 * 🔧 수정: 백엔드 월별 데이터를 차트용 데이터로 변환 (필요한 모든 필드 포함)
 */
export const transformMonthlyDataForChart = (monthlyData: MonthlyDataResponse[]) => {
    return monthlyData.map(item => ({
        month: `${item.month}월`,
        amount: Math.floor(item.totalAmount / 1000), // 천원 단위로 변환 (차트 표시용)
        originalAmount: item.totalAmount, // 원본 금액 (툴팁용)
        orderCount: item.orderCount, // 주문수
        totalQuantity: item.totalQuantity // 판매수량
    }));
};

/**
 * 🔧 수정: 백엔드 상품별 데이터를 차트용 데이터로 변환 (productId 추가)
 */
export const transformProductDataForChart = (products: ProductSalesItemResponse[]) => {
    // 색상 배열
    const colors = [
        '#e8984b', '#48bb78', '#3182ce', '#ed8936',
        '#9f7aea', '#38b2ac', '#f56565', '#805ad5',
        '#4fd1c7', '#f093fb', '#63b3ed', '#68d391'
    ];

    return products.map((product, index) => ({
        productName: product.productName,
        amount: product.totalAmount,
        percentage: product.percentage,
        color: colors[index % colors.length],
        salesCount: product.quantity,
        productId: product.productId // 🔧 추가: 상품 ID
    }));
};

/**
 * 🔧 수정: 년도별 월별 매출 데이터를 생성하는 함수 (필요한 모든 필드 포함)
 */
export const createYearlyDataFromAPI = (
    apiData: PeriodSalesAnalyticsResponse[]
): { year: number; monthlyData: { month: string; amount: number; originalAmount: number; orderCount: number; totalQuantity: number; }[] }[] => {
    return apiData.map(yearData => ({
        year: yearData.year,
        monthlyData: transformMonthlyDataForChart(yearData.monthlyData)
    }));
};

/**
 * 🔧 새로 추가: 상품별 매출 분석 요청 파라미터 생성 함수
 */
export const createProductSalesParams = (
    year: number,
    month: number | undefined,
    viewMode: 'monthly' | 'yearly',
    page: number = 0,
    size: number = 30 // 🔧 수정: 기본값을 30으로 증가
): ProductSalesParams => {
    return {
        type: viewMode === 'monthly' ? 'MONTHLY' : 'YEARLY',
        year,
        month: viewMode === 'monthly' ? month : undefined,
        page,
        size
    };
};

/**
 * 금액 포맷팅 유틸리티
 */
export const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
        return `${Math.floor(amount / 100000000)}억원`;
    } else if (amount >= 10000) {
        return `${Math.floor(amount / 10000)}만원`;
    } else if (amount >= 1000) {
        return `${Math.floor(amount / 1000)}천원`;
    } else {
        return `${amount}원`;
    }
};

/**
 * 수량 포맷팅 유틸리티
 */
export const formatQuantity = (quantity: number): string => {
    if (quantity >= 10000) {
        return `${Math.floor(quantity / 10000)}만개`;
    } else if (quantity >= 1000) {
        return `${Math.floor(quantity / 1000)}천개`;
    } else {
        return `${quantity}개`;
    }
};