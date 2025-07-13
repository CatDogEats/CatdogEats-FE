// src/service/api/sellerOrderApi.ts

import axios from "axios";
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
  ApiResponse,
  ApiError,
} from "@/types/sellerOrder.types";

// API 기본 URL (환경에 따라 조정)
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
      return {
        message: response.data?.message || error.message,
        status: response.status,
        code: response.data?.code,
      };
    }
  }

  return {
    message: error.message || "알 수 없는 오류가 발생했습니다",
    status: 500,
  };
};

/**
 * 판매자용 주문 관리 API 서비스
 * 기존 프로젝트의 axios 패턴을 준수하여 구현
 */
export const sellerOrderApi = {
  /**
   * 배송 관리 (판매자 목록 조회)
   * API: GET /v1/sellers/orders/list?page={}&sort={}
   */
  getSellerOrders: async (
    page: number = 0,
    sort: string = "createdAt,desc"
  ): Promise<ApiResponse<SellerOrderListResponse>> => {
    try {
      const response = await axios.get<ApiResponse<SellerOrderListResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/list`,
        {
          params: {
            page,
            sort,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("판매자 주문 목록 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 고객 주소 조회 (판매자)
   * API: GET /v1/sellers/orders/{order-number}
   */
  getSellerOrderDetail: async (
    orderNumber: string
  ): Promise<ApiResponse<SellerOrderDetailResponse>> => {
    try {
      const response = await axios.get<ApiResponse<SellerOrderDetailResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/${orderNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("판매자 주문 상세 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 상태 관리 (판매자)
   * API: POST /v1/sellers/orders/status
   */
  updateOrderStatus: async (
    request: OrderStatusUpdateRequest
  ): Promise<ApiResponse<OrderStatusUpdateResponse>> => {
    try {
      const response = await axios.post<ApiResponse<OrderStatusUpdateResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/status`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("주문 상태 변경 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 운송장 등록 (판매자)
   * API: POST /v1/sellers/orders/tracking-number
   */
  registerTrackingNumber: async (
    request: TrackingNumberRegisterRequest
  ): Promise<ApiResponse<TrackingNumberRegisterResponse>> => {
    try {
      const response = await axios.post<
        ApiResponse<TrackingNumberRegisterResponse>
      >(`${API_BASE_URL}/v1/sellers/orders/tracking-number`, request, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("운송장 번호 등록 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 주문 내역 삭제 (판매자)
   * API: DELETE /v1/sellers/orders
   */
  deleteOrder: async (
    request: OrderDeleteRequest
  ): Promise<ApiResponse<OrderDeleteResponse>> => {
    try {
      const response = await axios.delete<ApiResponse<OrderDeleteResponse>>(
        `${API_BASE_URL}/v1/sellers/orders`,
        {
          data: request,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("주문 삭제 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 상태 동기화 (판매자)
   * API: POST /v1/sellers/orders/sync
   */
  syncShipmentStatus: async (): Promise<ApiResponse<ShipmentSyncResponse>> => {
    try {
      const response = await axios.post<ApiResponse<ShipmentSyncResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/sync`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("배송 상태 동기화 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 검색 조건으로 주문 목록 조회
   * API: GET /v1/sellers/orders/search
   */
  searchOrders: async (searchParams: {
    page?: number;
    sort?: string;
    searchType?: string;
    searchKeyword?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<SellerOrderListResponse>> => {
    try {
      const response = await axios.get<ApiResponse<SellerOrderListResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/search`,
        {
          params: {
            page: searchParams.page || 0,
            sort: searchParams.sort || "createdAt,desc",
            ...searchParams,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("주문 검색 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 출고 지연 요청 해결
   * API: POST /v1/sellers/orders/resolve-delay
   */
  resolveDelayRequest: async (
    orderNumber: string,
    expectedDate?: string
  ): Promise<ApiResponse<OrderStatusUpdateResponse>> => {
    try {
      const response = await axios.post<ApiResponse<OrderStatusUpdateResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/resolve-delay`,
        {
          orderNumber,
          expectedDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("출고 지연 해결 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 상태별 주문 개수 조회 (대시보드용)
   * API: GET /v1/sellers/orders/summary
   */
  getOrderSummary: async (): Promise<
    ApiResponse<{
      paymentCompleted: number;
      preparing: number;
      readyForDelivery: number;
      inTransit: number;
      delivered: number;
      delayRequests: number;
      longTermUndelivered: number;
    }>
  > => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/v1/sellers/orders/summary`
      );
      return response.data;
    } catch (error) {
      console.error("주문 요약 조회 실패:", error);
      throw handleApiError(error);
    }
  },
};
