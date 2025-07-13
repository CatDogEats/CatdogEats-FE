// src/hooks/useOrderModals.ts

import { useState, useCallback } from "react";
import type { OrderStatus } from "@/types/sellerOrder.types";

interface DetailModalState {
  open: boolean;
  orderNumber: string;
}

interface StatusUpdateModalState {
  open: boolean;
  orderNumber: string;
  currentStatus: OrderStatus;
}

interface ModalsState {
  detail: DetailModalState;
  statusUpdate: StatusUpdateModalState;
}

/**
 * 주문 관리 모달들의 상태를 관리하는 훅
 * 각 모달의 열기/닫기 상태와 필요한 데이터를 중앙에서 관리
 */
export const useOrderModals = () => {
  const [modals, setModals] = useState<ModalsState>({
    detail: {
      open: false,
      orderNumber: "",
    },
    statusUpdate: {
      open: false,
      orderNumber: "",
      currentStatus: "PAYMENT_COMPLETED",
    },
  });

  // ===== 상세보기 모달 =====
  const openDetailModal = useCallback((orderNumber: string) => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: true,
        orderNumber,
      },
    }));
  }, []);

  const closeDetailModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      detail: {
        open: false,
        orderNumber: "",
      },
    }));
  }, []);

  // ===== 상태 변경 모달 =====
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

  const closeStatusUpdateModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      statusUpdate: {
        open: false,
        orderNumber: "",
        currentStatus: "PAYMENT_COMPLETED",
      },
    }));
  }, []);

  // ===== 모든 모달 닫기 =====
  const closeAllModals = useCallback(() => {
    setModals({
      detail: {
        open: false,
        orderNumber: "",
      },
      statusUpdate: {
        open: false,
        orderNumber: "",
        currentStatus: "PAYMENT_COMPLETED",
      },
    });
  }, []);

  return {
    modals,
    openDetailModal,
    closeDetailModal,
    openStatusUpdateModal,
    closeStatusUpdateModal,
    closeAllModals,
  };
};
