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
      const response = await axios.get<
        APIResponse<{
          content: PetResponse[];
          page: number;
          size: number;
          totalElements: number;
          totalPages: number;
          last: boolean;
        }>
      >(`${API_BASE_URL}/v1/buyers/pet`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const pageData = extractApiData(response.data);
      return pageData.content; // ✅ 수정: content 배열만 반환
    } catch (error) {
      console.error("반려동물 정보 조회 실패:", error);
      throw handleApiError(error);
    }
  },

  /**
   * 모든 주소 정보 조회 (모달용)
   * API: GET /v1/buyers/address/all
   * ✅ 수정: 에러 처리 개선 및 디버깅 정보 추가
   */
  getAllAddresses: async (): Promise<AddressResponse[]> => {
    try {
      console.log(
        "주소 목록 조회 시작:",
        `${API_BASE_URL}/v1/buyers/address/all`
      );

      const response = await axios.get<APIResponse<AddressResponse[]>>(
        `${API_BASE_URL}/v1/buyers/address/all`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("주소 목록 조회 응답:", response.data);

      const result = extractApiData(response.data);
      console.log("주소 목록 추출 결과:", result);

      return result;
    } catch (error) {
      console.error("주소 목록 조회 실패:", error);

      // ✅ 추가: 구체적인 에러 상황별 처리
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error("HTTP 상태 코드:", status);
        console.error("에러 응답 데이터:", errorData);

        if (status === 401) {
          throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
        } else if (status === 403) {
          throw new Error("주소 조회 권한이 없습니다.");
        } else if (status === 500) {
          throw new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      }

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
      // 404(없음) 또는 500(서버 에러) 모두 null 로 처리
      if (
        axios.isAxiosError(error) &&
        [404, 500].includes(error.response?.status ?? 0)
      ) {
        return null;
      }
      // 그 외 클라이언트단 치명적 오류만 상위로 throw
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
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        // 서버 오류(500)만 무시
        return {
          selected: [],
          count: {
            availableCount: 0,
            expiringSoonCount: 0,
          },
        };
      }
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
