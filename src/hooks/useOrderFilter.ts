// src/hooks/useOrderFilter.ts

import { useState, useCallback } from "react";
import type { OrderStatus, SearchCondition } from "@/types/sellerOrder.types";

interface OrderFilterState {
  searchKeyword: string;
  searchType: SearchCondition;
  statusFilter: OrderStatus | "ALL";
  dateFrom: string;
  dateTo: string;
  dateRange: "today" | "7days" | "30days" | "90days" | "custom";
}

interface UseOrderFilterReturn {
  filters: OrderFilterState;
  setFilter: <K extends keyof OrderFilterState>(
    key: K,
    value: OrderFilterState[K]
  ) => void;
  updateFilters: (filters: Partial<OrderFilterState>) => void;
  resetFilters: () => void;
  getSearchParams: () => {
    searchType?: string;
    searchKeyword?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

/**
 * 주문 필터링 상태 관리 Hook
 * - 검색 조건 관리
 * - 상태 필터 관리
 * - 기간 필터 관리
 * - 통합된 필터 상태 관리
 */
export const useOrderFilter = (): UseOrderFilterReturn => {
  // ===== 기본 필터 상태 =====
  const defaultFilters: OrderFilterState = {
    searchKeyword: "",
    searchType: "orderNumber",
    statusFilter: "ALL",
    dateFrom: "",
    dateTo: "",
    dateRange: "30days",
  };

  // ===== 필터 상태 =====
  const [filters, setFilters] = useState<OrderFilterState>(defaultFilters);

  // ===== 단일 필터 값 변경 =====
  const setFilter = useCallback(
    <K extends keyof OrderFilterState>(key: K, value: OrderFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // ===== 여러 필터 값 동시 변경 =====
  const updateFilters = useCallback((newFilters: Partial<OrderFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // ===== 필터 초기화 =====
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // ===== API 호출용 검색 파라미터 생성 =====
  const getSearchParams = useCallback(() => {
    const params: {
      searchType?: string;
      searchKeyword?: string;
      statusFilter?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {};

    // 검색어가 있을 때만 추가
    if (filters.searchKeyword.trim()) {
      params.searchType = filters.searchType;
      params.searchKeyword = filters.searchKeyword.trim();
    }

    // 상태 필터가 전체가 아닐 때만 추가
    if (filters.statusFilter !== "ALL") {
      params.statusFilter = filters.statusFilter;
    }

    // 기간 필터 처리
    if (filters.dateRange !== "custom") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      params.dateFrom = startDate.toISOString().split("T")[0];
      params.dateTo = now.toISOString().split("T")[0];
    } else {
      // 사용자 정의 기간
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
    }

    return params;
  }, [filters]);

  return {
    filters,
    setFilter,
    updateFilters,
    resetFilters,
    getSearchParams,
  };
};
