// src/hooks/useSellerOrderManagement.ts

import { useState, useEffect, useCallback } from "react";
import { sellerOrderApi } from "@/service/api/sellerOrderApi";
import type {
  SellerOrderListResponse,
  ShipmentSyncResponse,
  ApiError,
  OrderStatusUpdateRequest,
  TrackingNumberRegisterRequest,
} from "@/types/sellerOrder.types";

/**
 * 판매자 주문 관리를 위한 통합 훅
 * 주문 목록 조회, 상태 변경, 운송장 등록, 동기화 등 모든 기능을 포함
 */
export const useSellerOrderManagement = (
  page: number = 0,
  sort: string = "createdAt,desc"
) => {
  // ===== 주문 목록 상태 =====
  const [orders, setOrders] = useState<SellerOrderListResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<ApiError | null>(null);

  // ===== 액션 상태 (상태 변경, 운송장 등록 등) =====
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  // ===== 주문 목록 조회 =====
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      const response = await sellerOrderApi.getSellerOrders(page, sort);

      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrdersError({
          message: response.message || "주문 목록 조회에 실패했습니다",
          status: 400,
        });
      }
    } catch (err) {
      const error = err as Error;
      setOrdersError({
        message: error.message || "주문 목록 조회 중 오류가 발생했습니다",
        status: 500,
      });
    } finally {
      setOrdersLoading(false);
    }
  }, [page, sort]);

  // ===== 페이지나 정렬 조건 변경 시 자동 재조회 =====
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ===== 수동 새로고침 =====
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ===== 주문 상태 변경 =====
  const updateOrderStatus = useCallback(
    async (request: OrderStatusUpdateRequest) => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.updateOrderStatus(request);

        if (response.success && response.data) {
          // 성공 시 목록 새로고침
          await refreshOrders();
          return response.data;
        } else {
          setActionError({
            message: response.message || "주문 상태 변경에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        const error = err as Error;
        setActionError({
          message: error.message || "주문 상태 변경 중 오류가 발생했습니다",
          status: 500,
        });
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 운송장 번호 등록 =====
  const registerTrackingNumber = useCallback(
    async (request: TrackingNumberRegisterRequest) => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.registerTrackingNumber(request);

        if (response.success && response.data) {
          // 성공 시 목록 새로고침
          await refreshOrders();
          return response.data;
        } else {
          setActionError({
            message: response.message || "운송장 번호 등록에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        const error = err as Error;
        setActionError({
          message: error.message || "운송장 번호 등록 중 오류가 발생했습니다",
          status: 500,
        });
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 주문 삭제 =====
  const deleteOrder = useCallback(
    async (orderNumber: string) => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.deleteOrder({ orderNumber });

        if (response.success) {
          // 성공 시 목록 새로고침
          await refreshOrders();
          return response.data || null;
        } else {
          setActionError({
            message: response.message || "주문 삭제에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        const error = err as Error;
        setActionError({
          message: error.message || "주문 삭제 중 오류가 발생했습니다",
          status: 500,
        });
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshOrders]
  );

  // ===== 배송 상태 동기화 =====
  const syncShipmentStatus =
    useCallback(async (): Promise<ShipmentSyncResponse | null> => {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await sellerOrderApi.syncShipmentStatus();

        if (response.success && response.data) {
          // 성공 시 목록 새로고침
          await refreshOrders();
          return response.data;
        } else {
          setActionError({
            message: response.message || "배송 상태 동기화에 실패했습니다",
            status: 400,
          });
          return null;
        }
      } catch (err) {
        const error = err as Error;
        setActionError({
          message: error.message || "배송 상태 동기화 중 오류가 발생했습니다",
          status: 500,
        });
        return null;
      } finally {
        setActionLoading(false);
      }
    }, [refreshOrders]);

  return {
    // 주문 목록 데이터
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,

    // 액션 상태
    actionLoading,
    actionError,

    // 액션 함수들
    updateOrderStatus,
    registerTrackingNumber,
    deleteOrder,
    syncShipmentStatus,
  };
};
