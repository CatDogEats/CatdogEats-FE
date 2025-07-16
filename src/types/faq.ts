// src/types/faq.ts

// ================================
// Enum 타입들 (백엔드와 일치)
// ================================

export enum FaqCategory {
    ALL = 'ALL',           // 전체 (필터링용)
    PRODUCT = 'PRODUCT',   // 제품
    ORDER = 'ORDER',       // 주문/결제
    DELIVERY = 'DELIVERY', // 배송
    RETURN = 'RETURN',     // 환불/교환
    ACCOUNT = 'ACCOUNT',   // 계정
    ETC = 'ETC'           // 기타
}

// ================================
// 응답 DTO (백엔드 Response)
// ================================

/**
 * FAQ 목록 조회 응답 DTO
 */
export interface FaqResponseDTO {
    id: string;
    question: string;
    answer: string;
    faqCategory: FaqCategory;
    categoryDisplayName: string;  // "제품", "주문/결제" 등 한글 표시명
    keywords: string[];
}

// ================================
// 요청 파라미터
// ================================

/**
 * FAQ 목록 조회 요청 파라미터
 */
export interface FaqListParams {
    category?: FaqCategory;
    keyword?: string;
    page?: number;
    size?: number;
}

// ================================
// 페이징 관련
// ================================

/**
 * 페이징 응답 (Spring Page 구조)
 */
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;  // 현재 페이지 번호 (0부터 시작)
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ================================
// API 응답 래퍼 (백엔드 APIResponse와 일치)
// ================================

/**
 * 전역 API 응답 포맷
 */
export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors: any[] | null;
}

// ================================
// 상태 관리용 인터페이스
// ================================

/**
 * FAQ 목록 상태
 */
export interface FaqListState {
    faqs: FaqResponseDTO[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // 검색/필터 상태
    selectedCategory: FaqCategory;
    searchKeyword: string;
    popularKeywords: string[];
}

// ================================
// 유틸리티 타입
// ================================

/**
 * 카테고리 표시 정보
 */
export interface CategoryDisplay {
    value: FaqCategory;
    label: string;
    color?: string;
}

/**
 * 카테고리 표시 정보 매핑
 */
export const CATEGORY_DISPLAY_MAP: Record<FaqCategory, CategoryDisplay> = {
    [FaqCategory.ALL]: { value: FaqCategory.ALL, label: '전체' },
    [FaqCategory.PRODUCT]: { value: FaqCategory.PRODUCT, label: '제품' },
    [FaqCategory.ORDER]: { value: FaqCategory.ORDER, label: '주문/결제' },
    [FaqCategory.DELIVERY]: { value: FaqCategory.DELIVERY, label: '배송' },
    [FaqCategory.RETURN]: { value: FaqCategory.RETURN, label: '환불/교환' },
    [FaqCategory.ACCOUNT]: { value: FaqCategory.ACCOUNT, label: '계정' },
    [FaqCategory.ETC]: { value: FaqCategory.ETC, label: '기타' }
};

// ================================
// 에러 처리
// ================================

/**
 * FAQ 관련 에러 메시지
 */
export const FAQ_ERROR_MESSAGES = {
    FETCH_FAILED: 'FAQ 목록을 불러오는데 실패했습니다.',
    SEARCH_FAILED: '검색 중 오류가 발생했습니다.',
    INVALID_CATEGORY: '잘못된 카테고리입니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
};