// src/service/support/faq/faqStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    FaqResponseDTO,
    FaqListParams,
    FaqListState,
    FaqCategory,
    FAQ_ERROR_MESSAGES
} from '@/types/faq';
import { faqApi, faqSearchUtils } from './faqApi';

// ================================
// FAQ 목록 상태 관리
// ================================

interface FaqStore extends FaqListState {
    // Actions - FAQ 조회
    fetchFaqs: (params?: FaqListParams) => Promise<void>;
    refreshFaqs: () => Promise<void>;
    clearFaqs: () => void;

    // Actions - 검색/필터
    setCategory: (category: FaqCategory) => void;
    setSearchKeyword: (keyword: string) => void;
    searchFaqs: (keyword: string) => Promise<void>;
    clearSearch: () => void;

    // Actions - 인기 검색어
    fetchPopularKeywords: () => Promise<void>;
    handlePopularKeywordClick: (keyword: string) => Promise<void>;

    // Actions - 페이징
    setPage: (page: number) => void;
    goToNextPage: () => void;
    goToPrevPage: () => void;

    // Getters
    hasNextPage: () => boolean;
    hasPrevPage: () => boolean;
    getFilteredFaqCount: () => number;
}

export const useFaqStore = create<FaqStore>()(
    devtools(
        (set, get) => ({
            // Initial State
            faqs: [],
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            loading: false,
            error: null,
            selectedCategory: FaqCategory.ALL,
            searchKeyword: '',
            popularKeywords: [],

            // ===========================
            // Actions - FAQ 조회
            // ===========================

            fetchFaqs: async (params = {}) => {
                const state = get();
                const requestParams: FaqListParams = {
                    category: state.selectedCategory,
                    keyword: state.searchKeyword,
                    page: state.currentPage,
                    size: 10,
                    ...params
                };

                set({ loading: true, error: null });

                try {
                    const response = await faqApi.getFaqs(requestParams);

                    set({
                        faqs: response.content,
                        totalElements: response.totalElements,
                        totalPages: response.totalPages,
                        currentPage: response.number,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error: error instanceof Error ? error.message : FAQ_ERROR_MESSAGES.FETCH_FAILED,
                        faqs: [],
                        totalElements: 0,
                        totalPages: 0
                    });
                    console.error('FAQ 목록 조회 실패:', error);
                }
            },

            refreshFaqs: async () => {
                const state = get();
                await state.fetchFaqs({
                    category: state.selectedCategory,
                    keyword: state.searchKeyword,
                    page: state.currentPage
                });
            },

            clearFaqs: () => {
                set({
                    faqs: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    loading: false,
                    error: null,
                    selectedCategory: FaqCategory.ALL,
                    searchKeyword: ''
                });
            },

            // ===========================
            // Actions - 검색/필터
            // ===========================

            setCategory: (category: FaqCategory) => {
                set({
                    selectedCategory: category,
                    currentPage: 0  // 카테고리 변경 시 첫 페이지로
                });
                get().fetchFaqs({ category, page: 0 });
            },

            setSearchKeyword: (keyword: string) => {
                set({ searchKeyword: keyword });
            },

            searchFaqs: async (keyword: string) => {
                // 검색어 검증 및 정제
                if (!faqSearchUtils.validateKeyword(keyword)) {
                    set({ error: '검색어는 2글자 이상 입력해주세요.' });
                    return;
                }

                const sanitizedKeyword = faqSearchUtils.sanitizeKeyword(keyword);

                set({
                    searchKeyword: sanitizedKeyword,
                    currentPage: 0  // 검색 시 첫 페이지로
                });

                await get().fetchFaqs({
                    keyword: sanitizedKeyword,
                    page: 0
                });
            },

            clearSearch: () => {
                set({
                    searchKeyword: '',
                    currentPage: 0
                });
                get().fetchFaqs({ keyword: '', page: 0 });
            },

            // ===========================
            // Actions - 인기 검색어
            // ===========================

            fetchPopularKeywords: async () => {
                try {
                    const keywords = await faqApi.getPopularKeywords();
                    set({ popularKeywords: keywords });
                } catch (error) {
                    console.error('인기 검색어 조회 실패:', error);
                    // 인기 검색어는 필수가 아니므로 에러를 사용자에게 표시하지 않음
                    set({ popularKeywords: [] });
                }
            },

            handlePopularKeywordClick: async (keyword: string) => {
                // '#' 제거 등 포맷팅
                const formattedKeyword = faqSearchUtils.formatPopularKeyword(keyword);
                await get().searchFaqs(formattedKeyword);
            },

            // ===========================
            // Actions - 페이징
            // ===========================

            setPage: (page: number) => {
                const totalPages = get().totalPages;

                if (page >= 0 && page < totalPages) {
                    set({ currentPage: page });
                    get().fetchFaqs({ page });
                }
            },

            goToNextPage: () => {
                const state = get();
                if (state.hasNextPage()) {
                    state.setPage(state.currentPage + 1);
                }
            },

            goToPrevPage: () => {
                const state = get();
                if (state.hasPrevPage()) {
                    state.setPage(state.currentPage - 1);
                }
            },

            // ===========================
            // Getters
            // ===========================

            hasNextPage: () => {
                const state = get();
                return state.currentPage < state.totalPages - 1;
            },

            hasPrevPage: () => {
                const state = get();
                return state.currentPage > 0;
            },

            getFilteredFaqCount: () => {
                return get().totalElements;
            }
        }),
        { name: 'faq-store' }
    )
);

// ================================
// 커스텀 훅 (선택적 사용)
// ================================

/**
 * FAQ 관련 상태와 액션을 쉽게 사용하기 위한 커스텀 훅
 */
export const useFaq = () => {
    const store = useFaqStore();

    return {
        // State
        faqs: store.faqs,
        loading: store.loading,
        error: store.error,
        selectedCategory: store.selectedCategory,
        searchKeyword: store.searchKeyword,
        popularKeywords: store.popularKeywords,
        currentPage: store.currentPage,
        totalPages: store.totalPages,
        totalElements: store.totalElements,

        // Actions
        fetchFaqs: store.fetchFaqs,
        setCategory: store.setCategory,
        searchFaqs: store.searchFaqs,
        clearSearch: store.clearSearch,
        fetchPopularKeywords: store.fetchPopularKeywords,
        handlePopularKeywordClick: store.handlePopularKeywordClick,
        setPage: store.setPage,

        // Computed
        hasNextPage: store.hasNextPage(),
        hasPrevPage: store.hasPrevPage(),
        isEmpty: store.faqs.length === 0 && !store.loading
    };
};

// ================================
// 초기화 함수
// ================================

/**
 * FAQ 스토어 초기화 (컴포넌트 마운트 시 호출)
 */
export const initializeFaqStore = async () => {
    const { fetchFaqs, fetchPopularKeywords } = useFaqStore.getState();

    // 병렬로 초기 데이터 로드
    await Promise.all([
        fetchFaqs(),
        fetchPopularKeywords()
    ]);
};