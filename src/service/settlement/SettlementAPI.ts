// src/service/SettlementAPI.ts
import { apiClient } from '@/service/auth/AuthAPI.ts';

// ===== 백엔드 응답 타입 정의 =====

export interface SettlementStatus {
    IN_PROGRESS: 'IN_PROGRESS';
    COMPLETED: 'COMPLETED';
}

export interface SettlementItemResponse {
    orderNumber: string;
    productName: string;
    orderAmount: number;
    commission: number;
    settlementAmount: number;
    orderDate: string; // ISO string
    deliveryDate: string | null; // ISO string
    settlementCreatedAt: string; // ISO string
    status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface PageableResponse<T> {
    totalElements: number;
    totalPages: number;
    size: number;
    content: T[];
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    last: boolean;
    numberOfElements: number;
    pageable: {
        offset: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        pageNumber: number;
        pageSize: number;
        paged: boolean;
        unpaged: boolean;
    };
    empty: boolean;
}

export interface SettlementSummaryResponse {
    totalCount: number;
    totalSettlementAmount: number;
    completedAmount: number;
    inProgressAmount: number;
}

export interface SettlementListResponse {
    settlements: PageableResponse<SettlementItemResponse>;
    summary: SettlementSummaryResponse;
}

export interface MonthlySettlementStatusResponse {
    totalCount: number;
    totalMonthlyAmount: number;
    completedCount: number;
    completedAmount: number;
    inProgressCount: number;
    inProgressAmount: number;
}

// 🔧 수정: MonthlyReceiptResponse의 summary 타입 정정
export interface MonthlyReceiptResponse {
    targetMonth: string;
    vendorName: string;
    businessNumber: string;
    items: PageableResponse<SettlementItemResponse>;
    summary?: {
        totalCount: number;
        totalMonthlyAmount: number; // 🔧 totalAmount → totalMonthlyAmount로 수정
        completedCount: number;
        completedAmount: number;
        inProgressCount: number;
        inProgressAmount: number;
    };
}

export interface SettlementPeriodRequest {
    startDate: string; // YYYY-MM-DD 형식
    endDate: string;   // YYYY-MM-DD 형식
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors?: any[];
}

// ===== API 서비스 함수 =====

export const settlementApi = {
    /**
     * 1. 전체 정산 리스트 조회 (페이징)
     */
    getSettlementList: async (page: number = 0, size: number = 10): Promise<SettlementListResponse> => {
        const response = await apiClient.get<APIResponse<SettlementListResponse>>(
            `/v1/sellers/settlements?page=${page}&size=${size}`
        );
        return response.data.data;
    },

    /**
     * 2. 기간별 정산 리스트 조회 (페이징)
     */
    getSettlementListByPeriod: async (
        periodRequest: SettlementPeriodRequest,
        page: number = 0,
        size: number = 10
    ): Promise<SettlementListResponse> => {
        const response = await apiClient.post<APIResponse<SettlementListResponse>>(
            `/v1/sellers/settlements/period?page=${page}&size=${size}`,
            periodRequest
        );
        return response.data.data;
    },

    /**
     * 3. 이번달 정산현황 조회
     */
    getMonthlySettlementStatus: async (): Promise<MonthlySettlementStatusResponse> => {
        const response = await apiClient.get<APIResponse<MonthlySettlementStatusResponse>>(
            '/v1/sellers/settlements/monthly-status'
        );
        return response.data.data;
    },

    /**
     * 4. 월별 정산내역 영수증 조회 (페이징)
     */
    getMonthlySettlementReceipt: async (
        targetMonth: string, // YYYY-MM 형식
        page: number = 0,
        size: number = 50
    ): Promise<MonthlyReceiptResponse> => {
        const response = await apiClient.get<APIResponse<MonthlyReceiptResponse>>(
            `/v1/sellers/settlements/monthly-receipt/${targetMonth}?page=${page}&size=${size}`
        );
        return response.data.data;
    },

    /**
     * 5. 월별 정산내역 CSV 다운로드
     */
    downloadMonthlySettlementCsv: async (targetMonth: string): Promise<Blob> => {
        const response = await apiClient.get(
            `/v1/sellers/settlements/monthly-receipt/${targetMonth}/download`,
            {
                responseType: 'blob'
            }
        );
        return response.data;
    }
};

// ===== 유틸리티 함수 =====

/**
 * ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 */
export const formatDateToString = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
};

/**
 * YYYY-MM-DD 형식을 사용자 친화적 형식으로 변환
 */
export const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * 백엔드 status를 프론트엔드 status로 변환
 */
export const mapBackendStatusToFrontend = (status: 'IN_PROGRESS' | 'COMPLETED'): '대기중' | '처리중' | '정산완료' => {
    switch (status) {
        case 'IN_PROGRESS':
            return '처리중';
        case 'COMPLETED':
            return '정산완료';
        default:
            return '대기중';
    }
};

/**
 * 프론트엔드 status를 백엔드 status로 변환 (필터용)
 */
export const mapFrontendStatusToBackend = (status: string): 'IN_PROGRESS' | 'COMPLETED' | null => {
    switch (status) {
        case '처리중':
            return 'IN_PROGRESS';
        case '정산완료':
            return 'COMPLETED';
        case '전체':
        default:
            return null;
    }
};