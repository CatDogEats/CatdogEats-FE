// src/services/api/sellerOrderApi.ts

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
} from "@/types/sellerOrder.types";

// API 기본 URL (환경에 따라 조정)
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : import.meta.env.VITE_API_PROXY_TARGET || "";

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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  },

  /**
   * 주문 내역 삭제 (판매자)
   * API: DELETE /v1/sellers/orders
   */
  deleteOrders: async (
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
      throw error;
    }
  },

  /**
   * 주문 상태 동기화
   * API: POST /v1/sellers/orders/sync-shipment-status
   */
  syncShipmentStatus: async (): Promise<ApiResponse<ShipmentSyncResponse>> => {
    try {
      const response = await axios.post<ApiResponse<ShipmentSyncResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/sync-shipment-status`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("주문 상태 동기화 실패:", error);
      throw error;
    }
  },
};

/**
 * 에러 핸들링을 위한 공통 에러 타입
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Axios 에러를 ApiError로 변환하는 헬퍼 함수
 */
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // 서버가 응답을 반환한 경우
    return {
      message: error.response.data?.message || "서버 오류가 발생했습니다",
      status: error.response.status,
      code: error.response.data?.code,
    };
  } else if (error.request) {
    // 요청이 전송되었지만 응답을 받지 못한 경우
    return {
      message: "네트워크 오류가 발생했습니다",
      status: 0,
    };
  } else {
    // 기타 오류
    return {
      message: error.message || "알 수 없는 오류가 발생했습니다",
      status: -1,
    };
  }
};

// 기본 export
export default sellerOrderApi;
