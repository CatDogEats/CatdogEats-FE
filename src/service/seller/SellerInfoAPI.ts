// src/service/seller/SellerInfoAPI.ts
import {apiClient, retryIfUnauthorized} from '@/service/auth/AuthAPI';

// ===== 백엔드 요청 타입 정의 =====
export interface SellerInfoRequestDTO {
    vendorName?: string;
    businessNumber?: string;
    settlementBank?: string;
    settlementAcc?: string;
    tags?: string; // "수제간식,강아지" 형식
    operatingStartTime?: string; // "09:00:00" 형식
    operatingEndTime?: string; // "18:00:00" 형식
    closedDays?: string; // "월요일,화요일" 형식
    deliveryFee?: number;
    freeShippingThreshold?: number;
    addressTitle?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    streetAddress?: string;
    postalCode?: string;
    detailAddress?: string;
    phoneNumber?: string;
    createRequest?: boolean;
}

// ===== 백엔드 응답 타입 정의 (수정됨) =====
export interface StoreAddress {
    title: string;
    fullAddress: string;
    postalCode: string;
    phoneNumber: string;
}

export interface SellerInfoResponseDTO {
    userId?: string; // 🔧 추가
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
    // 🔧 추가: 새로운 응답 구조 지원
    businessAddress?: {
        addressId: string;
        title: string;
        city: string;
        district: string;
        neighborhood: string;
        streetAddress: string;
        postalCode: string;
        detailAddress: string;
        phoneNumber: string;
        fullAddress: string;
    };
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

// ===== 주소 완전성 검사 함수 =====
export const isAddressComplete = (formData: SellerInfoFormData): boolean => {
    const addressFields = [
        formData.postalCode,
        formData.roadAddress,
        formData.detailAddress,
        formData.phoneNumber,
        formData._addressData?.city,
        formData._addressData?.district,
        formData._addressData?.neighborhood,
        formData._addressData?.streetAddress
    ];

    // 모든 주소 필드가 존재하고 비어있지 않은지 확인
    return addressFields.every(field => field && field.toString().trim() !== '');
};

// ===== 깊은 비교 유틸리티 함수 =====
const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        return obj1.every((item, index) => deepEqual(item, obj2[index]));
    }

    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        return keys1.every(key => deepEqual(obj1[key], obj2[key]));
    }

    return obj1 === obj2;
};

// ===== PATCH 요청 생성 함수 =====
export const createPatchRequest = (
    currentData: SellerInfoFormData,
    originalData: SellerInfoFormData | null
): SellerInfoRequestDTO => {
    console.log("=== PATCH 요청 생성 시작 ===");
    console.log("현재 데이터:", currentData);
    console.log("원본 데이터:", originalData);

    const patchData: SellerInfoRequestDTO = {};

    // 신규 등록인 경우 모든 데이터 포함
    if (!originalData) {
        console.log("신규 등록 - 모든 데이터 포함");
        return transformFormDataToRequest(currentData);
    }

    // 개별 필드 변경사항 검사
    if (currentData.vendorName !== originalData.vendorName) {
        patchData.vendorName = currentData.vendorName;
    }

    if (currentData.businessNumber !== originalData.businessNumber) {
        patchData.businessNumber = currentData.businessNumber;
    }

    if (currentData.settlementBank !== originalData.settlementBank) {
        patchData.settlementBank = currentData.settlementBank;
    }

    if (currentData.settlementAcc !== originalData.settlementAcc) {
        patchData.settlementAcc = currentData.settlementAcc;
    }

    // 배열 필드 비교 (tags)
    if (!deepEqual(currentData.tags, originalData.tags)) {
        patchData.tags = currentData.tags.join(',');
    }

    // 시간 필드 비교
    if (currentData.operatingStartTime !== originalData.operatingStartTime) {
        patchData.operatingStartTime = formatTimeForBackend(currentData.operatingStartTime);
    }

    if (currentData.operatingEndTime !== originalData.operatingEndTime) {
        patchData.operatingEndTime = formatTimeForBackend(currentData.operatingEndTime);
    }

    // 배열 필드 비교 (closedDays)
    if (!deepEqual(currentData.closedDays, originalData.closedDays)) {
        patchData.closedDays = currentData.closedDays.join(',');
    }

    // 숫자 필드 비교
    if (currentData.deliveryFee !== originalData.deliveryFee) {
        patchData.deliveryFee = currentData.deliveryFee;
    }

    if (currentData.freeShippingThreshold !== originalData.freeShippingThreshold) {
        patchData.freeShippingThreshold = currentData.freeShippingThreshold;
    }

    // 주소 정보 변경사항 검사 (그룹 단위)
    const currentAddressComplete = isAddressComplete(currentData);
    const originalAddressComplete = isAddressComplete(originalData);

    // 현재 주소가 완전하고, 원본과 다른 경우에만 주소 정보 포함
    if (currentAddressComplete) {
        const addressChanged =
            currentData.postalCode !== originalData.postalCode ||
            currentData.roadAddress !== originalData.roadAddress ||
            currentData.detailAddress !== originalData.detailAddress ||
            currentData.phoneNumber !== originalData.phoneNumber ||
            !deepEqual(currentData._addressData, originalData._addressData);

        if (addressChanged || !originalAddressComplete) {
            const addressData = currentData._addressData || {
                city: "서울특별시",
                district: "강남구",
                neighborhood: "",
                streetAddress: currentData.roadAddress || ""
            };

            patchData.addressTitle = "본사";
            patchData.city = addressData.city;
            patchData.district = addressData.district;
            patchData.neighborhood = addressData.neighborhood;
            patchData.streetAddress = addressData.streetAddress;
            patchData.postalCode = currentData.postalCode;
            patchData.detailAddress = currentData.detailAddress;
            patchData.phoneNumber = currentData.phoneNumber;
        }
    }

    // createRequest 플래그 설정
    patchData.createRequest = !originalData;

    console.log("최종 PATCH 데이터:", patchData);
    console.log("=== PATCH 요청 생성 완료 ===");

    return patchData;
};

// ===== API 서비스 함수 =====
export const sellerInfoApi = {
    /**
     * 판매자 정보 조회
     */
    getSellerInfo: async (): Promise<SellerInfoResponseDTO | null> => {
        try {
            console.log("🔍 판매자 정보 조회 시작...");
            const response = await apiClient.get<APIResponse<SellerInfoResponseDTO>>('/v1/sellers/info');

            console.log("📥 API 응답:", response.data);

            // 성공 응답이지만 데이터가 없는 경우 처리
            if (response.data.success && response.data.data) {
                console.log("✅ 판매자 정보 조회 성공:", response.data.data);
                console.log("🖼️ 프로필 이미지 URL:", response.data.data.vendorProfileImage);
                return response.data.data;
            }

            // 데이터가 없는 경우 (신규 사용자)
            console.log('ℹ️ 판매자 정보가 없습니다 (신규 사용자)');
            return null;

        } catch (error: any) {
            // 404 에러인 경우 (정보가 없음)
            if (error.response?.status === 404) {
                console.log('ℹ️ 판매자 정보를 찾을 수 없습니다 (404)');
                return null;
            }

            // 다른 에러인 경우
            console.error('❌ 판매자 정보 조회 실패:', error);
            return await retryIfUnauthorized(error, () => sellerInfoApi.getSellerInfo());
        }
    },

    /**
     * 판매자 정보 등록/수정 (PATCH 최적화)
     */
    upsertSellerInfo: async (
        currentData: SellerInfoFormData,
        originalData: SellerInfoFormData | null = null
    ): Promise<SellerInfoResponseDTO> => {
        try {
            const requestData = createPatchRequest(currentData, originalData);
            const response = await apiClient.patch<APIResponse<SellerInfoResponseDTO>>(
                '/v1/sellers/info',
                requestData
            );
            return response.data.data;
        } catch (error: any) {
            return await retryIfUnauthorized(error, () => sellerInfoApi.upsertSellerInfo(currentData, originalData));
        }
    },

    uploadBrandImage: async (imageFile: File): Promise<SellerBrandImageResponseDTO> => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const response = await apiClient.patch<APIResponse<SellerBrandImageResponseDTO>>(
                '/v1/sellers/image',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        } catch (error: any) {
            return await retryIfUnauthorized(error, () => sellerInfoApi.uploadBrandImage(imageFile));
        }
    },

    deleteBrandImage: async (): Promise<SellerBrandImageResponseDTO> => {
        try {
            const response = await apiClient.delete<APIResponse<SellerBrandImageResponseDTO>>('/v1/sellers/image');
            return response.data.data;
        } catch (error: any) {
            return await retryIfUnauthorized(error, () => sellerInfoApi.deleteBrandImage());
        }
    }
};

// ===== 기존 데이터 변환 함수 (호환성 유지) =====
export const transformFormDataToRequest = (formData: SellerInfoFormData): SellerInfoRequestDTO => {
    const addressData = formData._addressData || {
        city: "서울특별시",
        district: "강남구",
        neighborhood: "",
        streetAddress: formData.roadAddress || ""
    };

    return {
        vendorName: formData.vendorName,
        businessNumber: formData.businessNumber,
        settlementBank: formData.settlementBank,
        settlementAcc: formData.settlementAcc,
        tags: formData.tags.join(','),
        operatingStartTime: formatTimeForBackend(formData.operatingStartTime),
        operatingEndTime: formatTimeForBackend(formData.operatingEndTime),
        closedDays: formData.closedDays.join(','),
        deliveryFee: formData.deliveryFee,
        freeShippingThreshold: formData.freeShippingThreshold,
        addressTitle: "본사",
        city: addressData.city,
        district: addressData.district,
        neighborhood: addressData.neighborhood,
        streetAddress: addressData.streetAddress,
        postalCode: formData.postalCode,
        detailAddress: formData.detailAddress,
        phoneNumber: formData.phoneNumber,
        createRequest: true
    };
};

/**
 * 🔧 개선: 백엔드 응답을 프론트엔드 폼 데이터로 변환
 */
export const transformResponseToFormData = (response: SellerInfoResponseDTO): SellerInfoFormData => {
    console.log("🔄 백엔드 응답 변환 시작:", response);

    // 🔧 개선: 새로운 응답 구조와 기존 구조 모두 지원
    let storeAddress: StoreAddress;
    let detailAddress = "";
    let addressData: { city: string; district: string; neighborhood: string; streetAddress: string } | undefined;

    if (response.businessAddress) {
        // 새로운 응답 구조
        console.log("📍 새로운 주소 구조 사용:", response.businessAddress);
        storeAddress = {
            title: response.businessAddress.title,
            fullAddress: response.businessAddress.fullAddress,
            postalCode: response.businessAddress.postalCode,
            phoneNumber: response.businessAddress.phoneNumber
        };
        detailAddress = response.businessAddress.detailAddress;
        addressData = {
            city: response.businessAddress.city,
            district: response.businessAddress.district,
            neighborhood: response.businessAddress.neighborhood,
            streetAddress: response.businessAddress.streetAddress
        };
    } else {
        // 기존 응답 구조
        console.log("📍 기존 주소 구조 사용:", response.storeAddress);
        storeAddress = response.storeAddress || {
            title: "",
            fullAddress: "",
            postalCode: "",
            phoneNumber: ""
        };
    }

    // 🔧 개선: 프로필 이미지 처리 로직 강화
    const profileImage = response.vendorProfileImage || null;
    console.log("🖼️ 변환된 프로필 이미지:", profileImage);

    const result: SellerInfoFormData = {
        vendorName: response.vendorName || "",
        businessNumber: response.businessNumber || "",
        settlementBank: response.settlementBank || "",
        settlementAcc: response.settlementAcc || "",
        tags: response.tags ? response.tags.split(',').filter(tag => tag.trim()) : [],
        operatingStartTime: formatTimeForFrontend(response.operatingStartTime),
        operatingEndTime: formatTimeForFrontend(response.operatingEndTime),
        closedDays: response.closedDays ? response.closedDays.split(',').filter(day => day.trim()) : [],
        deliveryFee: response.deliveryFee || 0,
        freeShippingThreshold: response.freeShippingThreshold || 0,
        postalCode: storeAddress.postalCode || "",
        roadAddress: storeAddress.fullAddress || "",
        detailAddress: detailAddress,
        phoneNumber: storeAddress.phoneNumber || "",
        profileImage: profileImage,
        _addressData: addressData
    };

    console.log("✅ 변환 완료:", result);
    console.log("🖼️ 최종 프로필 이미지:", result.profileImage);

    return result;
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