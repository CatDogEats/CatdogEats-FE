// src/service/SellerInfoAPI.ts
import { apiClient } from '@/service/auth/AuthAPI';

// ===== 백엔드 요청 타입 정의 =====
export interface SellerInfoRequestDTO {
    vendorName: string;
    businessNumber: string;
    settlementBank: string;
    settlementAcc: string;
    tags: string; // "수제간식,강아지" 형식
    operatingStartTime: string; // "09:00:00" 형식
    operatingEndTime: string; // "18:00:00" 형식
    closedDays: string; // "월요일,화요일" 형식
    deliveryFee: number;
    freeShippingThreshold: number;
    addressTitle: string;
    city: string;
    district: string;
    neighborhood: string;
    streetAddress: string;
    postalCode: string;
    detailAddress: string;
    phoneNumber: string;
    createRequest: boolean;
}

// ===== 백엔드 응답 타입 정의 =====
export interface StoreAddress {
    title: string;
    fullAddress: string;
    postalCode: string;
    phoneNumber: string;
}

export interface SellerInfoResponseDTO {
    sellerId: string;
    vendorName: string;
    vendorProfileImage: string | null;
    businessNumber: string;
    settlementBank: string;
    settlementAcc: string;
    tags: string;
    operatingStartTime: string;
    operatingEndTime: string;
    closedDays: string;
    deliveryFee: number;
    freeShippingThreshold: number;
    storeAddress: StoreAddress;
    operationStartDate: string;
    totalProducts: number;
    totalSalesQuantity: number;
    avgDeliveryDays: number;
    totalReviews: number;
    avgReviewRating: number;
}

// ===== 브랜드 이미지 관련 타입 =====
export interface SellerBrandImageResponseDTO {
    userId: string;
    vendorName: string;
    vendorProfileImage: string;
    updatedAt: string;
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors?: any[];
}

// ===== 프론트엔드 폼 데이터 타입 =====
export interface SellerInfoFormData {
    vendorName: string;
    businessNumber: string;
    settlementBank: string;
    settlementAcc: string;
    tags: string[];
    operatingStartTime: string;
    operatingEndTime: string;
    closedDays: string[];
    deliveryFee: number;
    freeShippingThreshold: number;
    postalCode: string;
    roadAddress: string;
    detailAddress: string;
    phoneNumber: string;
    profileImage: string | null;
    // 백엔드 API 전송용 주소 데이터
    _addressData?: {
        city: string;
        district: string;
        neighborhood: string;
        streetAddress: string;
    };
}

// ===== API 서비스 함수 =====
export const sellerInfoApi = {
    /**
     * 판매자 정보 조회
     */
    getSellerInfo: async (): Promise<SellerInfoResponseDTO | null> => {
        try {
            const response = await apiClient.get<APIResponse<SellerInfoResponseDTO>>('/v1/sellers/info');

            // 성공 응답이지만 데이터가 없는 경우 처리
            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            // 데이터가 없는 경우 (신규 사용자)
            console.log('판매자 정보가 없습니다 (신규 사용자)');
            return null;

        } catch (error: any) {
            // 404 에러인 경우 (정보가 없음)
            if (error.response?.status === 404) {
                console.log('판매자 정보를 찾을 수 없습니다');
                return null;
            }

            // 다른 에러인 경우
            console.error('판매자 정보 조회 실패:', error);
            throw error;
        }
    },

    /**
     * 판매자 정보 등록/수정
     */
    upsertSellerInfo: async (formData: SellerInfoFormData): Promise<SellerInfoResponseDTO> => {
        const requestData: SellerInfoRequestDTO = transformFormDataToRequest(formData);

        const response = await apiClient.patch<APIResponse<SellerInfoResponseDTO>>(
            '/v1/sellers/info',
            requestData
        );
        return response.data.data;
    },

    /**
     * 브랜드 이미지 업로드
     */
    uploadBrandImage: async (imageFile: File): Promise<SellerBrandImageResponseDTO> => {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await apiClient.patch<APIResponse<SellerBrandImageResponseDTO>>(
            '/v1/sellers/image',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data.data;
    },

    /**
     * 브랜드 이미지 삭제
     */
    deleteBrandImage: async (): Promise<SellerBrandImageResponseDTO> => {
        const response = await apiClient.delete<APIResponse<SellerBrandImageResponseDTO>>('/v1/sellers/image');
        return response.data.data;
    }
};

// ===== 데이터 변환 함수 =====

/**
 * 프론트엔드 폼 데이터를 백엔드 요청 형식으로 변환 (개선된 버전)
 */
export const transformFormDataToRequest = (formData: SellerInfoFormData): SellerInfoRequestDTO => {
    console.log("=== API 데이터 변환 시작 ===");
    console.log("입력 formData:", formData);

    // 카카오 API에서 받은 상세 주소 데이터가 있으면 사용, 없으면 기본값
    const addressData = formData._addressData || {
        city: "서울특별시",
        district: "강남구",
        neighborhood: "",
        streetAddress: formData.roadAddress || ""
    };

    console.log("사용할 주소 데이터:", addressData);

    const result: SellerInfoRequestDTO = {
        vendorName: formData.vendorName,
        businessNumber: formData.businessNumber,
        settlementBank: formData.settlementBank,
        settlementAcc: formData.settlementAcc,
        tags: formData.tags.join(','), // 배열 → 문자열
        operatingStartTime: formatTimeForBackend(formData.operatingStartTime), // "09:00" → "09:00:00"
        operatingEndTime: formatTimeForBackend(formData.operatingEndTime),
        closedDays: formData.closedDays.join(','), // 배열 → 문자열
        deliveryFee: formData.deliveryFee,
        freeShippingThreshold: formData.freeShippingThreshold,
        addressTitle: "본사", // 기본값
        city: addressData.city,
        district: addressData.district,
        neighborhood: addressData.neighborhood,
        streetAddress: addressData.streetAddress,
        postalCode: formData.postalCode,
        detailAddress: formData.detailAddress,
        phoneNumber: formData.phoneNumber, // 🔧 수정: 빈 값이어도 그대로 전송 (PATCH 특성)
        createRequest: true
    };

    console.log("최종 변환 결과:", result);
    console.log("=== API 데이터 변환 완료 ===");

    return result;
};

/**
 * 백엔드 응답을 프론트엔드 폼 데이터로 변환
 */
export const transformResponseToFormData = (response: SellerInfoResponseDTO): SellerInfoFormData => {
    // storeAddress가 존재하지 않는 경우를 대비한 안전한 접근
    const storeAddress = response.storeAddress || {
        title: "",
        fullAddress: "",
        postalCode: "",
        phoneNumber: ""
    };

    return {
        vendorName: response.vendorName || "",
        businessNumber: response.businessNumber || "",
        settlementBank: response.settlementBank || "",
        settlementAcc: response.settlementAcc || "",
        tags: response.tags ? response.tags.split(',').filter(tag => tag.trim()) : [], // 빈 문자열 제거
        operatingStartTime: formatTimeForFrontend(response.operatingStartTime), // "09:00:00" → "09:00"
        operatingEndTime: formatTimeForFrontend(response.operatingEndTime),
        closedDays: response.closedDays ? response.closedDays.split(',').filter(day => day.trim()) : [], // 빈 문자열 제거
        deliveryFee: response.deliveryFee || 0,
        freeShippingThreshold: response.freeShippingThreshold || 0,
        postalCode: storeAddress.postalCode || "",
        roadAddress: storeAddress.fullAddress || "",
        detailAddress: "", // 상세주소는 별도로 관리
        phoneNumber: storeAddress.phoneNumber || "",
        profileImage: response.vendorProfileImage || null
    };
};

// ===== 유틸리티 함수 =====

/**
 * 시간 형식 변환: "09:00" → "09:00:00"
 */
export const formatTimeForBackend = (time: string): string => {
    if (!time) return "00:00:00";
    if (time.length === 5) { // "09:00"
        return `${time}:00`;
    }
    return time;
};

/**
 * 시간 형식 변환: "09:00:00" → "09:00"
 */
export const formatTimeForFrontend = (time: string): string => {
    if (!time) return "00:00";
    if (time.length === 8) { // "09:00:00"
        return time.substring(0, 5);
    }
    return time;
};

/**
 * 요일 목록 상수
 */
export const WEEKDAYS = [
    { value: '월요일', label: '월' },
    { value: '화요일', label: '화' },
    { value: '수요일', label: '수' },
    { value: '목요일', label: '목' },
    { value: '금요일', label: '금' },
    { value: '토요일', label: '토' },
    { value: '일요일', label: '일' }
] as const;