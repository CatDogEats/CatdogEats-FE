// src/service/api/buyerApi.ts

import axios from "axios";
import type {
  APIResponse,
  PetResponse,
  AddressResponse,
  DefaultAddressResponse,
  CouponResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  ApiError,
} from "@/types/buyerApi.types";

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
 * 구매자용 API 서비스
 */
export const buyerApi = {
  /**
   * 반려동물 정보 조회
   * API: GET /v1/buyers/pet
   */
  getPetInfo: async (): Promise<PetResponse[]> => {
    try {
      const response = await axios.get<APIResponse<PetResponse[]>>(
        `${API_BASE_URL}/v1/buyers/pet`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("반려동물 정보 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 모든 주소 정보 조회 (모달용)
   * API: GET /v1/buyers/address/all
   */
  getAllAddresses: async (): Promise<AddressResponse[]> => {
    try {
      const response = await axios.get<APIResponse<AddressResponse[]>>(
        `${API_BASE_URL}/v1/buyers/address/all`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("주소 목록 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 기본 주소 정보 조회 (자동 로드용)
   * API: GET /v1/buyers/address/default
   */
  getDefaultAddress: async (): Promise<DefaultAddressResponse | null> => {
    try {
      const response = await axios.get<APIResponse<DefaultAddressResponse>>(
        `${API_BASE_URL}/v1/buyers/address/default`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      // 기본 주소가 없는 경우 null 반환
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error("기본 주소 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 사용 가능한 쿠폰 조회
   * API: GET /v1/buyers/coupons?filter=AVAILABLE&page=0
   */
  getAvailableCoupons: async (): Promise<CouponResponse> => {
    try {
      const response = await axios.get<APIResponse<CouponResponse>>(
        `${API_BASE_URL}/v1/buyers/coupons`,
        {
          params: {
            filter: "AVAILABLE",
            page: 0,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("쿠폰 목록 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 주문 생성
   * API: POST /v1/buyers/orders
   */
  createOrder: async (
    orderData: OrderCreateRequest
  ): Promise<OrderCreateResponse> => {
    try {
      const response = await axios.post<APIResponse<OrderCreateResponse>>(
        `${API_BASE_URL}/v1/buyers/orders`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return extractApiData(response.data);
    } catch (error) {
      console.error("주문 생성 실패:", error);
      throw handleApiError(error);
    }
  },
};
