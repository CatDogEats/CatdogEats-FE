// src/hooks/useOrderModals.ts

import { useState, useCallback } from "react";
import type { OrderStatus } from "@/types/sellerOrder.types";

interface ModalState {
  detail: {
    open: boolean;
    orderNumber: string | null;
  };
  statusUpdate: {
    open: boolean;
    orderNumber: string | null;
    currentStatus: OrderStatus | null;
  };
}

interface UseOrderModalsReturn {
  modals: ModalState;
  openDetailModal: (orderNumber: string) => void;
  openStatusUpdateModal: (
    orderNumber: string,
    currentStatus: OrderStatus
  ) => void;
  closeDetailModal: () => void;
  closeStatusUpdateModal: () => void;
  closeAllModals: () => void;
}

/**
 * 주문 관리 모달 상태 관리 Hook
 * - 주문 상세 조회 모달
 * - 주문 상태 변경 모달
 * - 통합된 모달 상태 관리
 */
export const useOrderModals = (): UseOrderModalsReturn => {
  // ===== 모달 상태 =====
  const [modals, setModals] = useState<ModalState>({
    detail: {
      open: false,
      orderNumber: null,
    },
    statusUpdate: {
      open: false,
      orderNumber: null,
      currentStatus: null,
    },
  });

  // ===== 주문 상세 모달 열기 =====
  const openDetailModal = useCallback((orderNumber: string) => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: true,
        orderNumber,
      },
    }));
  }, []);

  // ===== 주문 상태 변경 모달 열기 =====
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

  // ===== 주문 상세 모달 닫기 =====
  const closeDetailModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: false,
        orderNumber: null,
      },
    }));
  }, []);

  // ===== 주문 상태 변경 모달 닫기 =====
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

  // ===== 모든 모달 닫기 =====
  const closeAllModals = useCallback(() => {
    setModals({
      detail: {
        open: false,
        orderNumber: null,
      },
      statusUpdate: {
        open: false,
        orderNumber: null,
        currentStatus: null,
      },
    });
  }, []);

  return {
    modals,
    openDetailModal,
    openStatusUpdateModal,
    closeDetailModal,
    closeStatusUpdateModal,
    closeAllModals,
  };
};
