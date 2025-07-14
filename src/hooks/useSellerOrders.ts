// src/hooks/useSellerOrders.ts

// ===== 메인 Hook Re-export =====
export { useSellerOrderManagement } from "./useSellerOrderManagement";

// ===== 주문 상세 조회 Hook =====
import { useState, useEffect, useCallback } from "react";
import { sellerOrderApi } from "@/service/api/sellerOrderApi";
import type {
  SellerOrderDetailResponse,
  ApiError,
} from "@/types/sellerOrder.types";

export interface UseSellerOrderDetailReturn {
  orderDetail: SellerOrderDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSellerOrderDetail = (
  orderNumber: string
): UseSellerOrderDetailReturn => {
  const [orderDetail, setOrderDetail] =
    useState<SellerOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const refetch = useCallback(async () => {
    await fetchOrderDetail();
  }, [fetchOrderDetail]);

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
  OrderStatus,
  CourierCompany,
  SellerOrderItem,
  SellerOrderDetailResponse,
  SellerOrderListResponse,
  OrderStatusUpdateRequest,
  TrackingNumberRegisterRequest,
  OrderDeleteRequest,
  ApiError,
} from "@/types/sellerOrder.types";
