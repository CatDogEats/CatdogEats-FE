// src/service/support/faq/faqApi.ts

import { apiClient } from '@/service/auth/AuthAPI';
import {
    FaqResponseDTO,
    FaqListParams,
    PageResponse,
    APIResponse,
    FaqCategory,
    FAQ_ERROR_MESSAGES
} from '@/types/faq';

// ================================
// API 기본 경로
// ================================
const FAQ_BASE_URL = '/v1/faqs';

// ================================
// FAQ API 함수들
// ================================

export const faqApi = {

    // ===========================
    // 1. FAQ 목록 조회 및 검색
    // ===========================
    async getFaqs(params: FaqListParams = {}): Promise<PageResponse<FaqResponseDTO>> {
        const {
            category = FaqCategory.ALL,
            keyword,
            page = 0,
            size = 10
        } = params;

        try {
            // 쿼리 파라미터 구성
            const queryParams = new URLSearchParams({
                category: category,
                page: page.toString(),
                size: size.toString()
            });

            // keyword가 있을 때만 추가
            if (keyword && keyword.trim()) {
                queryParams.append('keyword', keyword.trim());
            }

            const response = await apiClient.get<APIResponse<PageResponse<FaqResponseDTO>>>(
                `${FAQ_BASE_URL}?${queryParams.toString()}`
            );

            return response.data.data;
        } catch (error) {
            console.error('FAQ 목록 조회 실패:', error);
            throw new Error(faqErrorHandler.getErrorMessage(error));
        }
    },

    // ===========================
    // 2. 인기 검색어 목록 조회
    // ===========================
    async getPopularKeywords(): Promise<string[]> {
        try {
            const response = await apiClient.get<APIResponse<string[]>>(
                `${FAQ_BASE_URL}/popular-keywords`
            );

            return response.data.data;
        } catch (error) {
            console.error('인기 검색어 조회 실패:', error);
            // 인기 검색어는 필수가 아니므로 빈 배열 반환
            return [];
        }
    }
};

// ================================
// 에러 처리 유틸리티
// ================================

export const faqErrorHandler = {

    // ===========================
    // API 에러 메시지 변환
    // ===========================
    getErrorMessage(error: any): string {
        // 백엔드에서 온 에러 메시지 확인
        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        // HTTP 상태 코드별 메시지
        switch (error.response?.status) {
            case 400:
                return FAQ_ERROR_MESSAGES.INVALID_CATEGORY;
            case 401:
                return '로그인이 필요합니다.';
            case 404:
                return 'FAQ를 찾을 수 없습니다.';
            case 500:
                return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            default:
                return FAQ_ERROR_MESSAGES.NETWORK_ERROR;
        }
    }
};

// ================================
// 검색 관련 유틸리티
// ================================

export const faqSearchUtils = {

    // ===========================
    // 검색어 유효성 검사
    // ===========================
    validateKeyword(keyword: string): boolean {
        if (!keyword) return false;

        const trimmed = keyword.trim();
        // 최소 2글자 이상
        return trimmed.length >= 2;
    },

    // ===========================
    // 검색어 정제
    // ===========================
    sanitizeKeyword(keyword: string): string {
        return keyword
            .trim()
            .replace(/\s+/g, ' ')  // 연속된 공백을 하나로
            .slice(0, 50);         // 최대 50자 제한
    },

    // ===========================
    // 인기 검색어 클릭 시 포맷팅
    // ===========================
    formatPopularKeyword(keyword: string): string {
        // '#' 제거
        return keyword.replace(/^#/, '');
    }
};

// ================================
// 카테고리 관련 유틸리티
// ================================

export const faqCategoryUtils = {

    // ===========================
    // 카테고리 유효성 검사
    // ===========================
    isValidCategory(category: string): boolean {
        return Object.values(FaqCategory).includes(category as FaqCategory);
    },

    // ===========================
    // 카테고리별 아이콘 반환 (MUI 아이콘 이름)
    // ===========================
    getCategoryIcon(category: FaqCategory): string {
        const iconMap: Record<FaqCategory, string> = {
            [FaqCategory.ALL]: 'ViewList',
            [FaqCategory.PRODUCT]: 'ShoppingBag',
            [FaqCategory.ORDER]: 'ShoppingCart',
            [FaqCategory.DELIVERY]: 'LocalShipping',
            [FaqCategory.RETURN]: 'SwapHoriz',
            [FaqCategory.ACCOUNT]: 'Person',
            [FaqCategory.ETC]: 'MoreHoriz'
        };

        return iconMap[category] || 'Help';
    }
};

// ================================
// 페이징 관련 유틸리티
// ================================

export const faqPagingUtils = {

    // ===========================
    // 페이지 번호 유효성 검사
    // ===========================
    isValidPage(page: number, totalPages: number): boolean {
        return page >= 0 && page < totalPages;
    },

    // ===========================
    // 페이지 범위 계산 (페이지네이션 UI용)
    // ===========================
    getPageRange(currentPage: number, totalPages: number, displayPages: number = 5): number[] {
        const pages: number[] = [];
        const halfDisplay = Math.floor(displayPages / 2);

        let start = Math.max(0, currentPage - halfDisplay);
        let end = Math.min(totalPages - 1, start + displayPages - 1);

        // 시작점 재조정
        if (end - start < displayPages - 1) {
            start = Math.max(0, end - displayPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }
};

// ================================
// 기본 내보내기
// ================================
export default faqApi;