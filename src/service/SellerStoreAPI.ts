// src/services/SellerStoreAPI.ts
import { apiClient } from '@/service/auth/AuthAPI';

// 주소 정보 타입 추가
export interface StoreAddress {
    title: string;
    fullAddress: string;
    postalCode: string;
    phoneNumber: string;
}

// 백엔드 응답 타입 정의
export interface SellerInfoResponse {
    sellerId: string;
    vendorName: string;
    vendorProfileImage: string | null;
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

export interface ProductResponse {
    productId: string;
    productNumber: number;
    title: string;
    price: number;
    discountedPrice: number;
    discountRate: number | null;
    imageUrl: string;
    petCategory: 'DOG' | 'CAT';
    productCategory: 'HANDMADE' | 'FINISHED';
    stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    avgRating: number;
    reviewCount: number;
    bestScore: number;
}

export interface ProductsPageResponse {
    content: ProductResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface SellerStorePageResponse {
    sellerInfo: SellerInfoResponse;
    products: ProductsPageResponse;
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors: any;
}

// API 요청 파라미터 타입
export interface SellerStoreParams {
    page?: number;
    size?: number;
    sort?: string;
    petcategory?: 'DOG' | 'CAT';
    productCategory?: 'HANDMADE' | 'FINISHED';
    filter?: 'best' | 'discount' | 'new' | 'exclude_sold_out';
}

// 카테고리 선택 상태를 API 파라미터로 변환하는 유틸리티 함수
export const convertCategoriesToParams = (categories: {
    dog: boolean;
    cat: boolean;
    handmade: boolean;
    finished: boolean;
}) => {
    const params: Pick<SellerStoreParams, 'petcategory' | 'productCategory'> = {};

    // 반려동물 카테고리 처리
    if (categories.dog && !categories.cat) {
        params.petcategory = 'DOG';
    } else if (categories.cat && !categories.dog) {
        params.petcategory = 'CAT';
    }
    // 둘 다 선택이거나 둘 다 미선택이면 파라미터 없음 (전체)

    // 상품 카테고리 처리
    if (categories.handmade && !categories.finished) {
        params.productCategory = 'HANDMADE';
    } else if (categories.finished && !categories.handmade) {
        params.productCategory = 'FINISHED';
    }
    // 둘 다 선택이거나 둘 다 미선택이면 파라미터 없음 (전체)

    return params;
};

// 판매자 스토어 API
export const sellerStoreApi = {
    /**
     * 판매자 스토어 페이지 조회
     */
    getSellerStorePage: async (
        vendorName: string,
        params: SellerStoreParams = {}
    ): Promise<SellerStorePageResponse> => {
        const {
            page = 1,
            size = 10,
            sort = 'createdAt,desc',
            petcategory,
            productCategory,
            filter
        } = params;

        // 쿼리 파라미터 구성
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());
        queryParams.append('sort', sort);

        if (petcategory) queryParams.append('petcategory', petcategory);
        if (productCategory) queryParams.append('productCategory', productCategory);
        if (filter) queryParams.append('filter', filter);

        const response = await apiClient.get<APIResponse<SellerStorePageResponse>>(
            `/v1/users/page/${encodeURIComponent(vendorName)}?${queryParams.toString()}`
        );

        return response.data.data;
    }
};