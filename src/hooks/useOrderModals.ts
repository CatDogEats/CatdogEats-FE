// src/components/OrderManagement/hooks/useOrderModals.ts

import { useState, useCallback } from "react";
import type { OrderStatus } from "@/types/sellerOrder.types";

interface ModalState {
  orderNumber: string;
  currentStatus?: OrderStatus;
}

/**
 * 주문 관리 모달들의 상태를 관리하는 훅
 * UI 전용 상태 관리로 비즈니스 로직과 분리
 */
export const useOrderModals = () => {
  // 각 모달의 열림/닫힘 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [trackingRegisterModalOpen, setTrackingRegisterModalOpen] =
    useState(false);

  // 각 모달에 전달할 데이터
  const [modalState, setModalState] = useState<ModalState>({
    orderNumber: "",
    currentStatus: undefined,
  });

  // 상세보기 모달 열기
  const openDetailModal = useCallback((orderNumber: string) => {
    setModalState({ orderNumber });
    setDetailModalOpen(true);
  }, []);

  // 상태변경 모달 열기
  const openStatusUpdateModal = useCallback(
    (orderNumber: string, currentStatus: OrderStatus) => {
      setModalState({ orderNumber, currentStatus });
      setStatusUpdateModalOpen(true);
    },
    []
  );

  // 운송장등록 모달 열기
  const openTrackingRegisterModal = useCallback((orderNumber: string) => {
    setModalState({ orderNumber });
    setTrackingRegisterModalOpen(true);
  }, []);

  // 모든 모달 닫기
  const closeAllModals = useCallback(() => {
    setDetailModalOpen(false);
    setStatusUpdateModalOpen(false);
    setTrackingRegisterModalOpen(false);
    setModalState({ orderNumber: "", currentStatus: undefined });
  }, []);

  // 개별 모달 닫기 함수들
  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
  }, []);

  const closeStatusUpdateModal = useCallback(() => {
    setStatusUpdateModalOpen(false);
  }, []);

  const closeTrackingRegisterModal = useCallback(() => {
    setTrackingRegisterModalOpen(false);
  }, []);

  return {
    // 모달 상태
    modals: {
      detail: {
        open: detailModalOpen,
        orderNumber: modalState.orderNumber,
      },
      statusUpdate: {
        open: statusUpdateModalOpen,
        orderNumber: modalState.orderNumber,
        currentStatus: modalState.currentStatus!,
      },
      trackingRegister: {
        open: trackingRegisterModalOpen,
        orderNumber: modalState.orderNumber,
      },
    },

    // 모달 열기 함수들
    openDetailModal,
    openStatusUpdateModal,
    openTrackingRegisterModal,

    // 모달 닫기 함수들
    closeDetailModal,
    closeStatusUpdateModal,
    closeTrackingRegisterModal,
    closeAllModals,
  };
};
