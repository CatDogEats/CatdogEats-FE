// src/hooks/useBuyerOrders.ts

import { useState, useEffect, useCallback } from "react";
import {
  buyerOrderApi,
  canDeleteOrder,
  getOrderDeleteErrorMessage,
} from "@/service/api/buyerOrderApi";
import type {
  BuyerOrderListResponse,
  BuyerOrderDetailResponse,
  BuyerShipmentDetailResponse,
  BuyerOrderDeleteRequest,
  BuyerOrderDeleteResponse,
  PaginationInfo,
  Order,
  ApiError,
} from "@/types/buyerOrder.types";
import { convertAPIDataToPrototype } from "@/types/buyerOrder.types";

// ===== 훅 반환 타입들 =====

/**
 * useBuyerOrderManagement 훅 반환 타입
 */
export interface UseBuyerOrderManagementReturn {
  // 데이터
  orders: BuyerOrderListResponse | null;
  prototypeOrders: Order[]; // 기존 UI 호환성을 위한 변환된 데이터

  // 로딩 상태
  ordersLoading: boolean;
  actionLoading: boolean;

  // 에러 상태
  ordersError: string | null;
  actionError: string | null;

  // 페이지네이션
  pagination: PaginationInfo;
  setPagination: (pagination: Partial<PaginationInfo>) => void;

  // 액션 함수들
  refreshOrders: () => Promise<void>;
  deleteOrder: (
    request: BuyerOrderDeleteRequest
  ) => Promise<BuyerOrderDeleteResponse>;
  searchOrders: (searchParams: {
    searchKeyword?: string;
    statusFilter?: string;
  }) => Promise<void>;
}

/**
 * useBuyerOrderDetail 훅 반환 타입
 */
export interface UseBuyerOrderDetailReturn {
  orderDetail: BuyerOrderDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useBuyerShipmentDetail 훅 반환 타입
 */
export interface UseBuyerShipmentDetailReturn {
  shipmentDetail: BuyerShipmentDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ===== 메인 훅들 =====

/**
 * 구매자 주문 목록 관리 훅
 * OrdersView에서 사용
 */
export const useBuyerOrderManagement = (): UseBuyerOrderManagementReturn => {
  // 상태 관리
  const [orders, setOrders] = useState<BuyerOrderListResponse | null>(null);
  const [prototypeOrders, setPrototypeOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [pagination, setPaginationState] = useState<PaginationInfo>({
    page: 0,
    size: 20,
  });

  // 주문 목록 조회
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await buyerOrderApi.getBuyerOrders(
        pagination.page,
        pagination.size
      );

      if (response.success && response.data && response.data.orders) {
        // ✅ 해결 1: response.data에서 'orders' 배열만 정확히 추출하여 상태에 저장합니다.
        setOrders(response.data);

        // ✅ 해결 2: 변환 함수에도 'orders' 배열을 직접 전달합니다.
        // 'length' 오류는 아마 여기서 발생했을 겁니다.
        const convertedOrders = convertAPIDataToPrototype(response.data);
        setPrototypeOrders(convertedOrders);
      } else {
        // 데이터가 없는 경우도 정상 처리로 간주하고 빈 배열을 설정합니다.
        setOrders(null);
        setPrototypeOrders([]);
        // 또는 에러 처리를 할 수도 있습니다.
        // throw new Error(response.error || "주문 목록 데이터가 없습니다");
      }
    } catch (error) {
      const apiError = error as ApiError;
      setOrdersError(apiError.message);
      setOrders(null);
      setPrototypeOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [pagination.page, pagination.size]);

  // 페이지네이션 설정
  const setPagination = useCallback(
    (newPagination: Partial<PaginationInfo>) => {
      setPaginationState((prev) => ({ ...prev, ...newPagination }));
    },
    []
  );

  // 주문 목록 새로고침
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // 주문 삭제
  const deleteOrder = useCallback(
    async (
      request: BuyerOrderDeleteRequest
    ): Promise<BuyerOrderDeleteResponse> => {
      setActionLoading(true);
      setActionError(null);

      try {
        // 삭제 가능 여부 확인 (현재 상태 조회 필요)
        const currentOrder = prototypeOrders.find(
          (order) => order.orderNumber === request.orderNumber
        );
        if (currentOrder && !canDeleteOrder(currentOrder.shippingStatus)) {
          const errorMessage = getOrderDeleteErrorMessage(
            currentOrder.shippingStatus
          );
          throw new Error(errorMessage);
        }

        const response = await buyerOrderApi.deleteBuyerOrder(request);

        if (response.success && response.data) {
          // 성공 시 목록 새로고침
          await refreshOrders();
          return response.data;
        } else {
          throw new Error(response.error || "주문 삭제에 실패했습니다");
        }
      } catch (error) {
        const apiError = error as ApiError;
        setActionError(apiError.message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [prototypeOrders, refreshOrders]
  );

  // 주문 검색
  const searchOrders = useCallback(
    async (searchParams: { searchKeyword?: string; statusFilter?: string }) => {
      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const response = await buyerOrderApi.searchBuyerOrders({
          ...searchParams,
          page: pagination.page,
          size: pagination.size,
        });

        if (response.success && response.data) {
          setOrders(response.data);
          const convertedOrders = convertAPIDataToPrototype(response.data);
          setPrototypeOrders(convertedOrders);
        } else {
          throw new Error(response.error || "주문 검색에 실패했습니다");
        }
      } catch (error) {
        const apiError = error as ApiError;
        setOrdersError(apiError.message);
        setOrders(null);
        setPrototypeOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    },
    [pagination]
  );

  // 초기 데이터 로딩
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    prototypeOrders,
    ordersLoading,
    actionLoading,
    ordersError,
    actionError,
    pagination,
    setPagination,
    refreshOrders,
    deleteOrder,
    searchOrders,
  };
};

/**
 * 구매자 주문 상세 조회 훅
 * OrderDetail에서 사용
 */
export const useBuyerOrderDetail = (
  orderNumber: string
): UseBuyerOrderDetailReturn => {
  const [orderDetail, setOrderDetail] =
    useState<BuyerOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await buyerOrderApi.getBuyerOrderDetail(orderNumber);
      setOrderDetail(response);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      setOrderDetail(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const refetch = useCallback(async () => {
    await fetchOrderDetail();
  }, [fetchOrderDetail]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  return {
    orderDetail,
    loading,
    error,
    refetch,
  };
};

/**
 * 구매자 배송 상세 조회 훅 (물류 서버 연동)
 * ShippingDetailView에서 사용
 */
export const useBuyerShipmentDetail = (
  orderNumber: string
): UseBuyerShipmentDetailReturn => {
  const [shipmentDetail, setShipmentDetail] =
    useState<BuyerShipmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShipmentDetail = useCallback(async () => {
    if (!orderNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await buyerOrderApi.getBuyerShipmentDetail(orderNumber);
      setShipmentDetail(response);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      setShipmentDetail(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const refetch = useCallback(async () => {
    await fetchShipmentDetail();
  }, [fetchShipmentDetail]);

  useEffect(() => {
    fetchShipmentDetail();
  }, [fetchShipmentDetail]);

  return {
    shipmentDetail,
    loading,
    error,
    refetch,
  };
};

// ===== 유틸리티 훅들 =====

/**
 * 주문 상태별 액션 가능 여부 확인 훅
 */
export const useOrderActionAvailability = (orderStatus: string) => {
  const canDelete = canDeleteOrder(orderStatus);
  const deleteErrorMessage = canDelete
    ? null
    : getOrderDeleteErrorMessage(orderStatus);

  return {
    canDelete,
    deleteErrorMessage,
  };
};

/**
 * 에러 메시지 표시 상태 관리 훅
 */
export const useErrorMessage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const showErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setShowError(true);
  }, []);

  const hideErrorMessage = useCallback(() => {
    setShowError(false);
    // 애니메이션을 위해 약간의 지연 후 메시지 제거
    setTimeout(() => setErrorMessage(null), 300);
  }, []);

  return {
    errorMessage,
    showError,
    showErrorMessage,
    hideErrorMessage,
  };
};
