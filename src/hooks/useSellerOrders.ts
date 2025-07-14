// src/hooks/useSellerOrders.ts

// ===== 기존 Hook들 Re-export =====
export { useSellerOrderManagement } from "./useSellerOrderManagement";

// ===== 새로 추가된 Hook들 =====
export { useOrderModals } from "./useOrderModals";
export { useOrderFilter } from "./useOrderFilter";

// ===== 추가 개별 Hook들 =====
import { useState, useEffect, useCallback } from "react";
import { sellerOrderApi } from "@/service/api/sellerOrderApi";
import type {
  SellerOrderDetailResponse,
  ApiError,
} from "@/types/sellerOrder.types";

// ===== 주문 상세 조회 Hook =====
export interface UseSellerOrderDetailHookReturn {
  orderDetail: SellerOrderDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSellerOrderDetail = (
  orderNumber: string
): UseSellerOrderDetailHookReturn => {
  // ===== 상태 관리 =====
  const [orderDetail, setOrderDetail] =
    useState<SellerOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ===== 주문 상세 조회 =====
  const fetchOrderDetail = useCallback(async () => {
    if (!orderNumber) return;

    try {
      setLoading(true);
      setError(null);

      const response = await sellerOrderApi.getSellerOrderDetail(orderNumber);
      setOrderDetail(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "주문 상세 정보 조회에 실패했습니다");
      console.error("주문 상세 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  // ===== 수동 새로고침 =====
  const refetch = useCallback(async () => {
    await fetchOrderDetail();
  }, [fetchOrderDetail]);

  // ===== 주문번호 변경 시 자동 조회 =====
  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetail();
    }
  }, [fetchOrderDetail]);

  return {
    orderDetail,
    loading,
    error,
    refetch,
  };
};

// ===== 타입 Re-export =====
export type {
  // Hook 반환 타입들
  UseSellerOrderDetailHookReturn,

  // 기존 타입들 (필요한 경우)
  OrderStatus,
  CourierCompany,
  SellerOrderItem,
  SellerOrderDetailResponse,
  SellerOrderListResponse,
  OrderStatusUpdateRequest,
  TrackingNumberRegisterRequest,
  OrderDeleteRequest,
  SearchCondition,
  ApiError,
} from "@/types/sellerOrder.types";
