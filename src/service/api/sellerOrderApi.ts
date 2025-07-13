// src/service/api/sellerOrderApi.ts

import axios from "axios";
import type {
  APIResponse,
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse,
  TrackingNumberRegisterRequest,
  TrackingNumberRegisterResponse,
  OrderDeleteRequest,
  OrderDeleteResponse,
  ShipmentSyncResponse,
  ApiError,
  PaginationInfo,
} from "@/types/sellerOrder.types";

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
 * 판매자용 주문 관리 API 서비스
 * 백엔드 컨트롤러와 정확히 일치하는 API 호출
 */
export const sellerOrderApi = {
  /**
   * 배송 관리 (판매자) - 주문 목록 조회
   * API: GET /v1/sellers/orders/list?page={}&sort={}
   */
  getSellerOrders: async (
    pagination: PaginationInfo
  ): Promise<SellerOrderListResponse> => {
    try {
      const response = await axios.get<APIResponse<SellerOrderListResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/list`,
        {
          params: {
            page: pagination.page,
            sort: pagination.sort,
            size: pagination.size,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("판매자 주문 목록 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 검색 조건으로 주문 목록 조회
   * API: GET /v1/sellers/orders/search
   */
  searchSellerOrders: async (
    pagination: PaginationInfo,
    searchParams: {
      searchType?: string;
      searchKeyword?: string;
      statusFilter?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<SellerOrderListResponse> => {
    try {
      const response = await axios.get<APIResponse<SellerOrderListResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/search`,
        {
          params: {
            page: pagination.page,
            sort: pagination.sort,
            size: pagination.size,
            ...searchParams,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("판매자 주문 검색 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 고객 주소 조회 (판매자)
   * API: GET /v1/sellers/orders/{order-number}
   */
  getSellerOrderDetail: async (
    orderNumber: string
  ): Promise<SellerOrderDetailResponse> => {
    try {
      const response = await axios.get<APIResponse<SellerOrderDetailResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/${orderNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
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
  ): Promise<OrderStatusUpdateResponse> => {
    try {
      const response = await axios.post<APIResponse<OrderStatusUpdateResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/status`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
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
  ): Promise<TrackingNumberRegisterResponse> => {
    try {
      const response = await axios.post<
        APIResponse<TrackingNumberRegisterResponse>
      >(`${API_BASE_URL}/v1/sellers/orders/tracking-number`, request, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return extractApiData(response.data);
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
  ): Promise<OrderDeleteResponse> => {
    try {
      const response = await axios.delete<APIResponse<OrderDeleteResponse>>(
        `${API_BASE_URL}/v1/sellers/orders`,
        {
          data: request,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("주문 삭제 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 배송 상태 동기화 (판매자)
   * API: POST /v1/sellers/orders/sync
   */
  syncShipmentStatus: async (): Promise<ShipmentSyncResponse> => {
    try {
      const response = await axios.post<APIResponse<ShipmentSyncResponse>>(
        `${API_BASE_URL}/v1/sellers/orders/sync`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("배송 상태 동기화 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 판매자 주문 통계 조회 (대시보드용)
   * API: GET /v1/sellers/orders/statistics
   */
  getOrderStatistics: async (): Promise<{
    orderSummary: {
      paymentCompleted: number;
      preparing: number;
      readyForShipment: number;
      inTransit: number;
      delivered: number;
    };
    urgentTasks: {
      delayRequests: number;
      longTermUndelivered: number;
    };
  }> => {
    try {
      const response = await axios.get<APIResponse<any>>(
        `${API_BASE_URL}/v1/sellers/orders/statistics`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("주문 통계 조회 실패:", error);

      // 백엔드 API가 아직 없는 경우 목업 데이터 반환
      console.warn("주문 통계 API가 구현되지 않아 목업 데이터를 사용합니다.");
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
  },

  /**
   * 주문 상태별 개수 조회 (목록 데이터에서 계산)
   */
  calculateOrderStatistics: (orders: SellerOrderListResponse) => {
    const stats = {
      paymentCompleted: 0,
      preparing: 0,
      readyForShipment: 0,
      inTransit: 0,
      delivered: 0,
    };

    orders.orders.forEach((order) => {
      switch (order.orderStatus) {
        case "PAYMENT_COMPLETED":
          stats.paymentCompleted++;
          break;
        case "PREPARING":
          stats.preparing++;
          break;
        case "READY_FOR_SHIPMENT":
          stats.readyForShipment++;
          break;
        case "IN_DELIVERY":
          stats.inTransit++;
          break;
        case "DELIVERED":
          stats.delivered++;
          break;
      }
    });

    return {
      orderSummary: stats,
      urgentTasks: {
        delayRequests: orders.orders.filter((order) => order.isDelayed).length,
        longTermUndelivered: orders.orders.filter(
          (order) =>
            order.orderStatus === "IN_DELIVERY" &&
            new Date().getTime() - new Date(order.orderDate).getTime() >
              7 * 24 * 60 * 60 * 1000
        ).length,
      },
    };
  },
};

/**
 * API 응답 타입 가드
 */
export const isAPIResponseSuccess = <T>(
  response: APIResponse<T>
): response is APIResponse<T> & { success: true; data: T } => {
  return response.success && response.data !== undefined;
};

/**
 * 백엔드 APIResponse 구조 검증
 */
export const validateAPIResponse = <T>(response: any): APIResponse<T> => {
  if (typeof response !== "object" || response === null) {
    throw new Error("Invalid API response format");
  }

  if (typeof response.success !== "boolean") {
    throw new Error("Missing or invalid 'success' field in API response");
  }

  if (typeof response.message !== "string") {
    throw new Error("Missing or invalid 'message' field in API response");
  }

  return response as APIResponse<T>;
};
