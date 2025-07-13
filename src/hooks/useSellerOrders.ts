// src/hooks/useSellerOrders.ts

import { useState, useEffect, useCallback } from "react";
import { sellerOrderApi } from "@/service/api/sellerOrderApi";
import type {
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  OrderStatusUpdateRequest,
  TrackingNumberRegisterRequest,
  OrderDeleteRequest,
  ApiError,
} from "@/types/sellerOrder.types";

/**
 * API 에러 처리 헬퍼 함수 (로컬 정의)
 */
const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || error.message,
      status: error.response.status,
      code: error.response.data?.code,
    };
  }

  return {
    message: error.message || "알 수 없는 오류가 발생했습니다",
    status: 500,
  };
};

/**
 * 판매자 주문 목록 조회 훅
 * 기존 프로젝트 패턴(useState + useEffect)을 준수
 */
export const useSellerOrders = (
  page: number = 0,
  sort: string = "createdAt,desc"
) => {
  const [data, setData] = useState<SellerOrderListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // 데이터 fetch 함수
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellerOrderApi.getSellerOrders(page, sort);

      if (response.success) {
        setData(response.data);
      } else {
        setError({
          message: response.message || "주문 목록 조회에 실패했습니다",
          status: 400,
        });
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, sort]);

  // 페이지나 정렬 조건 변경 시 자동 재조회
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 수동 새로고침 함수
  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

/**
 * 판매자 주문 상세 조회 훅
 */
export const useSellerOrderDetail = (orderNumber: string) => {
  const [data, setData] = useState<SellerOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // 데이터 fetch 함수
  const fetchOrderDetail = useCallback(async () => {
    if (!orderNumber) return;

    try {
      setLoading(true);
      setError(null);

      const response = await sellerOrderApi.getSellerOrderDetail(orderNumber);

      if (response.success) {
        setData(response.data);
      } else {
        setError({
          message: response.message || "주문 상세 조회에 실패했습니다",
          status: 400,
        });
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  // orderNumber 변경 시 자동 재조회
  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 수동 새로고침 함수
  const refresh = useCallback(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

/**
 * 판매자 주문 액션 훅 (상태 변경, 운송장 등록 등)
 */
export const useSellerOrderActions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // 주문 상태 변경
  const updateOrderStatus = useCallback(
    async (request: OrderStatusUpdateRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await sellerOrderApi.updateOrderStatus(request);

        if (response.success) {
          return response.data;
        } else {
          setError({
            message: response.message || "주문 상태 변경에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        setError(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 운송장 번호 등록
  const registerTrackingNumber = useCallback(
    async (request: TrackingNumberRegisterRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await sellerOrderApi.registerTrackingNumber(request);

        if (response.success) {
          return response.data;
        } else {
          setError({
            message: response.message || "운송장 번호 등록에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        setError(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 주문 삭제
  const deleteOrder = useCallback(async (request: OrderDeleteRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellerOrderApi.deleteOrder(request);

      if (response.success) {
        return response.data;
      } else {
        setError({
          message: response.message || "주문 삭제에 실패했습니다",
          status: 400,
        });
        return null;
      }
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 배송 상태 동기화
  const syncShipmentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellerOrderApi.syncShipmentStatus();

      if (response.success) {
        return response.data;
      } else {
        setError({
          message: response.message || "배송 상태 동기화에 실패했습니다",
          status: 400,
        });
        return null;
      }
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateOrderStatus,
    registerTrackingNumber,
    deleteOrder,
    syncShipmentStatus,
  };
};

// 기존 useSellerOrderManagement는 호환성을 위해 유지하면서 새로운 훅을 사용하도록 수정
export { useSellerOrderManagement } from "./useSellerOrderManagement";
