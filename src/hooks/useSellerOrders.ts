// src/hooks/useSellerOrders.ts

import { useState, useEffect, useCallback } from "react";
import {
  sellerOrderApi,
  handleApiError,
  type ApiError,
} from "@/service/api/sellerOrderApi";
import type {
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse,
  TrackingNumberRegisterRequest,
  TrackingNumberRegisterResponse,
  OrderDeleteRequest,
  OrderDeleteResponse,
  ShipmentSyncResponse,
} from "@/types/sellerOrder.types";

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

  // orderNumber 변경 시 자동 조회
  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  return {
    data,
    loading,
    error,
    refresh: fetchOrderDetail,
  };
};

/**
 * 판매자 주문 액션 관련 훅 (상태변경, 운송장등록, 삭제, 동기화)
 */
export const useSellerOrderActions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // 주문 상태 변경
  const updateOrderStatus = useCallback(
    async (
      request: OrderStatusUpdateRequest
    ): Promise<OrderStatusUpdateResponse | null> => {
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
    async (
      request: TrackingNumberRegisterRequest
    ): Promise<TrackingNumberRegisterResponse | null> => {
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
  const deleteOrders = useCallback(
    async (
      request: OrderDeleteRequest
    ): Promise<OrderDeleteResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await sellerOrderApi.deleteOrders(request);

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
    },
    []
  );

  // 주문 상태 동기화
  const syncShipmentStatus =
    useCallback(async (): Promise<ShipmentSyncResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await sellerOrderApi.syncShipmentStatus();

        if (response.success) {
          return response.data;
        } else {
          setError({
            message: response.message || "주문 상태 동기화에 실패했습니다",
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
    deleteOrders,
    syncShipmentStatus,
  };
};

/**
 * 훅들을 조합한 편의 훅 (선택적 사용)
 */
export const useSellerOrderManagement = (
  page: number = 0,
  sort: string = "createdAt,desc"
) => {
  // 목록 조회
  const {
    data: orders,
    loading: ordersLoading,
    error: ordersError,
    refresh: refreshOrders,
  } = useSellerOrders(page, sort);

  // 액션들
  const {
    loading: actionLoading,
    error: actionError,
    updateOrderStatus,
    registerTrackingNumber,
    deleteOrders,
    syncShipmentStatus,
  } = useSellerOrderActions();

  // 에러 초기화
  const clearError = useCallback(() => {
    // orderError와 actionError를 모두 초기화하려면 각 훅에서 clearError를 제공해야 함
    // 현재는 단순히 페이지 새로고침으로 처리
  }, []);

  // 액션 후 목록 새로고침
  const executeActionAndRefresh = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      const result = await action();
      if (result) {
        // 성공한 경우에만 목록 새로고침
        refreshOrders();
      }
      return result;
    },
    [refreshOrders]
  );

  return {
    // 목록 관련
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,

    // 액션 관련
    actionLoading,
    actionError,

    // 액션 함수들 (실행 후 자동 새로고침)
    updateOrderStatus: (request: OrderStatusUpdateRequest) =>
      executeActionAndRefresh(() => updateOrderStatus(request)),
    registerTrackingNumber: (request: TrackingNumberRegisterRequest) =>
      executeActionAndRefresh(() => registerTrackingNumber(request)),
    deleteOrders: (request: OrderDeleteRequest) =>
      executeActionAndRefresh(() => deleteOrders(request)),
    syncShipmentStatus: () =>
      executeActionAndRefresh(() => syncShipmentStatus()),

    // 유틸리티
    clearError,
    loading: ordersLoading || actionLoading,
    error: ordersError || actionError,
  };
};
