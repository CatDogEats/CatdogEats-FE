// src/service/api/buyerOrderApi.ts

import axios from "axios";
import type {
  APIResponse,
  BuyerOrderListResponse,
  BuyerOrderDetailResponse,
  BuyerShipmentDetailResponse,
  BuyerOrderDeleteRequest,
  BuyerOrderDeleteResponse,
  ApiError,
} from "@/types/buyerOrder.types";

// API 기본 URL 설정
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : import.meta.env.VITE_API_PROXY_TARGET || "";

/**
 * API 에러 처리 헬퍼 함수
 */
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response) {
      // 백엔드 APIResponse 에러 구조 처리
      const errorData = response.data;
      return {
        message: errorData?.error || errorData?.message || error.message,
        status: response.status,
        code: errorData?.code,
      };
    }
  }

  return {
    message: error.message || "알 수 없는 오류가 발생했습니다",
    status: 500,
  };
};

/**
 * API 응답 데이터 추출 헬퍼
 */
const extractApiData = <T>(response: APIResponse<T>): T => {
  if (!response.success || !response.data) {
    throw new Error(response.error || response.message || "API 응답 오류");
  }
  return response.data;
};

/**
 * 구매자용 주문/배송 관리 API 서비스
 * 백엔드 컨트롤러와 정확히 일치하는 API 호출
 */
export const buyerOrderApi = {
  /**
   * 배송 정보 목록 조회 (구매자) - 주문 목록 조회
   * API: GET /v1/buyers/orders/list?page={}&size={}
   */
  getBuyerOrders: async (
    page: number = 0,
    size: number = 20
  ): Promise<APIResponse<BuyerOrderListResponse>> => {
    try {
      const response = await axios.get<APIResponse<BuyerOrderListResponse>>(
        `${API_BASE_URL}/v1/buyers/orders/list`,
        {
          params: {
            page,
            size,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("구매자 주문 목록 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 주문 상세조회 (구매자)
   * API: GET /v1/buyers/orders/{order-number}
   */
  getBuyerOrderDetail: async (
    orderNumber: string
  ): Promise<BuyerOrderDetailResponse> => {
    try {
      const response = await axios.get<APIResponse<BuyerOrderDetailResponse>>(
        `${API_BASE_URL}/v1/buyers/orders/${orderNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("주문 상세 정보 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 정보 상세 조회 (구매자) - 물류 서버 연동
   * API: GET /v1/buyers/shipments/{order-number}
   */
  getBuyerShipmentDetail: async (
    orderNumber: string
  ): Promise<BuyerShipmentDetailResponse> => {
    try {
      const response = await axios.get<
        APIResponse<BuyerShipmentDetailResponse>
      >(`${API_BASE_URL}/v1/buyers/shipments/${orderNumber}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return extractApiData(response.data);
    } catch (error) {
      console.error("배송 상세 정보 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 주문 내역 삭제
   * API: DELETE /v1/buyers/orders
   *
   * 삭제 가능 상태: DELIVERED, CANCELLED, REFUNDED
   * 삭제 불가 상태별 에러 메시지:
   * - PAYMENT_COMPLETED: "결제가 완료된 주문은 삭제할 수 없습니다. 상품 준비 진행상황을 확인해주세요."
   * - PREPARING: "상품 준비 중인 주문은 삭제할 수 없습니다."
   * - READY_FOR_SHIPMENT: "배송 준비가 완료된 주문은 삭제할 수 없습니다."
   * - IN_DELIVERY: "배송 중인 주문은 삭제할 수 없습니다. 배송 조회 페이지에서 배송상황을 확인해주세요."
   * - REFUND_PROCESSING: "환불 처리 중인 주문은 삭제할 수 없습니다. 환불 진행상황을 확인해주세요."
   */
  deleteBuyerOrder: async (
    request: BuyerOrderDeleteRequest
  ): Promise<APIResponse<BuyerOrderDeleteResponse>> => {
    try {
      const response = await axios.delete<
        APIResponse<BuyerOrderDeleteResponse>
      >(`${API_BASE_URL}/v1/buyers/orders`, {
        data: request,
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("주문 삭제 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 주문 검색 (추후 확장 가능)
   * 현재는 기본 목록 조회와 동일하지만, 향후 검색 파라미터 추가 가능
   */
  searchBuyerOrders: async (
    searchParams: {
      searchKeyword?: string;
      statusFilter?: string;
      page?: number;
      size?: number;
    } = {}
  ): Promise<APIResponse<BuyerOrderListResponse>> => {
    try {
      const { page = 0, size = 20, ...otherParams } = searchParams;

      const response = await axios.get<APIResponse<BuyerOrderListResponse>>(
        `${API_BASE_URL}/v1/buyers/orders/list`,
        {
          params: {
            page,
            size,
            ...otherParams,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("구매자 주문 검색 실패:", error);
      throw handleApiError(error);
    }
  },
};

/**
 * 주문 삭제 에러 메시지 매핑
 */
export const ORDER_DELETE_ERROR_MESSAGES: Record<string, string> = {
  PAYMENT_COMPLETED:
    "결제가 완료된 주문은 삭제할 수 없습니다. 상품 준비 진행상황을 확인해주세요.",
  PREPARING: "상품 준비 중인 주문은 삭제할 수 없습니다.",
  READY_FOR_SHIPMENT: "배송 준비가 완료된 주문은 삭제할 수 없습니다.",
  IN_DELIVERY:
    "배송 중인 주문은 삭제할 수 없습니다. 배송 조회 페이지에서 배송상황을 확인해주세요.",
  REFUND_PROCESSING:
    "환불 처리 중인 주문은 삭제할 수 없습니다. 환불 진행상황을 확인해주세요.",
};

/**
 * 주문 상태별 삭제 가능 여부 확인
 */
export const canDeleteOrder = (orderStatus: string): boolean => {
  const deletableStatuses = ["DELIVERED", "CANCELLED", "REFUNDED"];
  return deletableStatuses.includes(orderStatus);
};

/**
 * 주문 삭제 불가 시 에러 메시지 반환
 */
export const getOrderDeleteErrorMessage = (orderStatus: string): string => {
  return (
    ORDER_DELETE_ERROR_MESSAGES[orderStatus] ||
    "해당 주문은 삭제할 수 없습니다."
  );
};
