// src/hooks/useSellerOrders.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { sellerOrderApi } from "@/service/api/sellerOrderApi";
import type {
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse,
  TrackingNumberRegisterRequest,
  TrackingNumberRegisterResponse,
  OrderDeleteRequest,
  ShipmentSyncResponse,
  OrderSummaryStats,
  UrgentTasks,
  PaginationInfo,
  SortOption,
  OrderStatus,
  ApiError,
} from "@/types/sellerOrder.types";

// ===== 주문 목록 관리 Hook =====

export interface UseSellerOrderManagementReturn {
  // 데이터
  orders: SellerOrderListResponse | null;
  orderStats: { orderSummary: OrderSummaryStats; urgentTasks: UrgentTasks };

  // 로딩 상태
  ordersLoading: boolean;
  actionLoading: boolean;

  // 에러 상태
  ordersError: string | null;
  actionError: string | null;

  // 페이지네이션
  pagination: PaginationInfo;
  setPagination: (pagination: Partial<PaginationInfo>) => void;

  // 액션
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (
    request: OrderStatusUpdateRequest
  ) => Promise<OrderStatusUpdateResponse>;
  registerTrackingNumber: (
    request: TrackingNumberRegisterRequest
  ) => Promise<TrackingNumberRegisterResponse>;
  deleteOrder: (request: OrderDeleteRequest) => Promise<void>;
  syncShipmentStatus: () => Promise<ShipmentSyncResponse>;

  // 검색
  searchOrders: (searchParams: {
    searchType?: string;
    searchKeyword?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
}

export const useSellerOrderManagement = (
  initialPage: number = 0,
  initialSort: SortOption = "createdAt,desc"
): UseSellerOrderManagementReturn => {
  // ===== 상태 관리 =====
  const [orders, setOrders] = useState<SellerOrderListResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [pagination, setPaginationState] = useState<PaginationInfo>({
    page: initialPage,
    size: 20,
    sort: initialSort,
  });

  // ===== 페이지네이션 업데이트 =====
  const setPagination = useCallback(
    (newPagination: Partial<PaginationInfo>) => {
      setPaginationState((prev) => ({ ...prev, ...newPagination }));
    },
    []
  );

  // ===== 주문 통계 계산 =====
  const orderStats = useMemo(() => {
    if (!orders) {
      return {
        orderSummary: {
          paymentCompleted: 0,
          preparing: 0,
          readyForShipment: 0,
          inTransit: 0,
          delivered: 0,
        },
        urgentTasks: {
          delayRequests: 0,
          longTermUndelivered: 0,
        },
      };
    }

    return sellerOrderApi.calculateOrderStatistics(orders);
  }, [orders]);

  // ===== 주문 목록 조회 =====
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      const response = await sellerOrderApi.getSellerOrders(pagination);
      setOrders(response);
    } catch (error) {
      const apiError = error as ApiError;
      setOrdersError(apiError.message);
      console.error("주문 목록 조회 실패:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [pagination]);

  // ===== 주문 검색 =====
  const searchOrders = useCallback(
    async (searchParams: {
      searchType?: string;
      searchKeyword?: string;
      statusFilter?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const response = await sellerOrderApi.searchSellerOrders(
          pagination,
          searchParams
        );
        setOrders(response);
      } catch (error) {
        const apiError = error as ApiError;
        setOrdersError(apiError.message);
        console.error("주문 검색 실패:", error);
      } finally {
        setOrdersLoading(false);
      }
    },
    [pagination]
  );

  // ===== 주문 목록 새로고침 =====
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // ===== 주문 상태 변경 =====
  const updateOrderStatus = useCallback(
    async (
      request: OrderStatusUpdateRequest
    ): Promise<OrderStatusUpdateResponse> => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.updateOrderStatus(request);

        // 성공 시 목록 새로고침
        await refreshOrders();

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setActionError(apiError.message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 운송장 번호 등록 =====
  const registerTrackingNumber = useCallback(
    async (
      request: TrackingNumberRegisterRequest
    ): Promise<TrackingNumberRegisterResponse> => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.registerTrackingNumber(request);

        // 성공 시 목록 새로고침
        await refreshOrders();

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setActionError(apiError.message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 주문 삭제 =====
  const deleteOrder = useCallback(
    async (request: OrderDeleteRequest): Promise<void> => {
      try {
        setActionLoading(true);
        setActionError(null);

        await sellerOrderApi.deleteOrder(request);

        // 성공 시 목록 새로고침
        await refreshOrders();
      } catch (error) {
        const apiError = error as ApiError;
        setActionError(apiError.message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 배송 상태 동기화 =====
  const syncShipmentStatus =
    useCallback(async (): Promise<ShipmentSyncResponse> => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.syncShipmentStatus();

        // 성공 시 목록 새로고침
        await refreshOrders();

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setActionError(apiError.message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    }, [refreshOrders]);

  // ===== 초기 데이터 로드 =====
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    // 데이터
    orders,
    orderStats,

    // 로딩 상태
    ordersLoading,
    actionLoading,

    // 에러 상태
    ordersError,
    actionError,

    // 페이지네이션
    pagination,
    setPagination,

    // 액션
    refreshOrders,
    updateOrderStatus,
    registerTrackingNumber,
    deleteOrder,
    syncShipmentStatus,
    searchOrders,
  };
};

// ===== 주문 상세 조회 Hook =====

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
  const [loading, setLoading] = useState(false);
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
      setError(apiError.message);
      console.error("주문 상세 조회 실패:", err);
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

// ===== 모달 상태 관리 Hook =====

export interface UseOrderModalsReturn {
  modals: {
    detail: {
      open: boolean;
      orderNumber: string | null;
    };
    statusUpdate: {
      open: boolean;
      orderNumber: string | null;
      currentStatus: OrderStatus | null;
    };
  };
  openDetailModal: (orderNumber: string) => void;
  openStatusUpdateModal: (
    orderNumber: string,
    currentStatus: OrderStatus
  ) => void;
  closeDetailModal: () => void;
  closeStatusUpdateModal: () => void;
}

export const useOrderModals = (): UseOrderModalsReturn => {
  const [modals, setModals] = useState({
    detail: {
      open: false,
      orderNumber: null as string | null,
    },
    statusUpdate: {
      open: false,
      orderNumber: null as string | null,
      currentStatus: null as OrderStatus | null,
    },
  });

  const openDetailModal = useCallback((orderNumber: string) => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: true,
        orderNumber,
      },
    }));
  }, []);

  const openStatusUpdateModal = useCallback(
    (orderNumber: string, currentStatus: OrderStatus) => {
      setModals((prev) => ({
        ...prev,
        statusUpdate: {
          open: true,
          orderNumber,
          currentStatus,
        },
      }));
    },
    []
  );

  const closeDetailModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: false,
        orderNumber: null,
      },
    }));
  }, []);

  const closeStatusUpdateModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      statusUpdate: {
        open: false,
        orderNumber: null,
        currentStatus: null,
      },
    }));
  }, []);

  return {
    modals,
    openDetailModal,
    openStatusUpdateModal,
    closeDetailModal,
    closeStatusUpdateModal,
  };
};

// ===== 주문 필터링 Hook =====

export interface UseOrderFilterReturn {
  filters: {
    searchKeyword: string;
    searchType: string;
    statusFilter: OrderStatus | "ALL";
    dateRange: string;
    startDate: string;
    endDate: string;
  };
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

export const useOrderFilter = (
  onFiltersApply?: (filters: any) => void
): UseOrderFilterReturn => {
  const [filters, setFilters] = useState({
    searchKeyword: "",
    searchType: "orderNumber",
    statusFilter: "ALL" as OrderStatus | "ALL",
    dateRange: "30days",
    startDate: "",
    endDate: "",
  });

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchKeyword: "",
      searchType: "orderNumber",
      statusFilter: "ALL",
      dateRange: "30days",
      startDate: "",
      endDate: "",
    });
  }, []);

  const applyFilters = useCallback(() => {
    if (onFiltersApply) {
      onFiltersApply(filters);
    }
  }, [filters, onFiltersApply]);

  return {
    filters,
    setFilter,
    resetFilters,
    applyFilters,
  };
};
