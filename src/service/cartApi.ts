import { APIResponse } from '@/types/api';
import {apiClient, retryIfUnauthorized} from "@/service/auth/AuthAPI.ts";

// 백엔드 응답 구조에 맞춘 타입 정의
export interface BackendCartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number; // 백엔드: productPrice
    quantity: number;
    totalPrice: number;
    addedAt: string;
    canIncrease: boolean;
    canDecrease: boolean;
    maxQuantity: number;
    minQuantity: number;
}

export interface BackendCartResponse {
    cartId: string;
    items: BackendCartItem[]; // 백엔드: items (cartItems 아님)
    totalAmount: number;
    totalItemCount: number;
    totalShippingFee: number; // ✅ 백엔드는 totalShippingFee 사용
}

// 프론트엔드에서 사용할 통일된 타입
export interface CartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    price: number; // productPrice → price로 변환
    quantity: number;
    selected?: boolean;
    sellerId?: string;
    sellerName?: string;
}

export interface CartResponse {
    cartId: string;
    totalItemCount: number;
    totalPrice: number;
    totalDeliveryFee: number;
    totalAmount: number;
    cartItems: CartItem[]; // 프론트엔드에서는 cartItems로 통일
}

export interface AddCartItemRequest {
    productNumber: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

// 백엔드 추천 응답 구조
export interface BackendRecommendationResponse {
    productId: string;
    productNumber: number;
    title: string; // 백엔드: title
    price: number;
    petCategory: string;
    purchaseCount: number;
}

// 프론트엔드에서 사용할 추천 응답 타입
export interface RecommendationResponse {
    productId: string;
    productName: string; // title → productName으로 변환
    productImage: string;
    price: number;
    sellerId?: string;
    sellerName?: string;
}


// API 응답 처리 유틸리티 함수
const handleApiResponse = async <T>(response: any): Promise<T> => {
    // axios 응답 객체일 경우를 감지
    const isAxiosResponse = !!response && response.data !== undefined;

    if (!response.status || response.status >= 400) {
        const errorData = isAxiosResponse ? response.data : await response.data?.().catch(() => ({}));
        console.error('❌ API 요청 실패:', {
            status: response.status,
            statusText: response.statusText,
            url: isAxiosResponse ? response.config?.url : response.url,
            errorData
        });
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const result: APIResponse<T> = isAxiosResponse ? response.data : await response.json();

    console.log('✅ API 응답 성공:', {
        url: isAxiosResponse ? response.config?.url : response.url,
        success: result.success,
        message: result.message
    });

    if (!result.success) {
        throw new Error(result.message || 'API 요청이 실패했습니다.');
    }

    return result.data;
};

// 백엔드 응답을 프론트엔드 형식으로 변환하는 유틸리티 함수들
const convertBackendCartToFrontend = (backendResponse: BackendCartResponse): CartResponse => {

    const cartItems = backendResponse.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || '/api/placeholder/100/100', // 기본 이미지
        price: item.unitPrice, // productPrice → price 변환
        quantity: item.quantity,
        selected: true, // 기본값
        sellerId: '', // 현재 백엔드에서 제공하지 않음
        sellerName: '판매자', // 기본값
    }));

    return {
        cartId: backendResponse.cartId,
        totalItemCount: backendResponse.totalItemCount,
        totalPrice: backendResponse.totalAmount, // ✅ 상품 총 금액
        totalDeliveryFee: backendResponse.totalShippingFee, // ✅ totalShippingFee → totalDeliveryFee 변환
        totalAmount: backendResponse.totalAmount + backendResponse.totalShippingFee, // ✅ 최종 총합 (상품 + 배송비)
        cartItems
    };

};

const convertBackendRecommendationToFrontend = (backendRec: BackendRecommendationResponse): RecommendationResponse => ({
    productId: backendRec.productId,
    productName: backendRec.title, // title → productName 변환
    productImage: '/api/placeholder/100/100', // 기본 이미지
    price: backendRec.price,
    sellerId: '',
    sellerName: '판매자'
});

// 장바구니 API 서비스
export class CartApiService {

    // 장바구니 조회
    static async getCart(): Promise<CartResponse> {
        try {
            console.log('📦 장바구니 조회 요청');

            const response = await apiClient.get(`/v1/buyers/carts`);

            const backendData = await handleApiResponse<BackendCartResponse>(response);

            console.log('📦 백엔드 원본 응답:', backendData);

            // 백엔드 응답을 프론트엔드 형식으로 변환
            const frontendData = convertBackendCartToFrontend(backendData);

            console.log('📦 변환된 프론트엔드 데이터:', frontendData);

            return frontendData;
        } catch (error) {
            console.error('❌ 장바구니 조회 실패:', error);
            return await retryIfUnauthorized(error, () => this.getCart())
        }
    }

    // 장바구니에 상품 추가
    static async addCartItem(request: AddCartItemRequest): Promise<void> {
        try {
            console.log('➕ 장바구니 상품 추가 요청:', request);

            const response = await apiClient.post(`/v1/buyers/carts`, request);

            await handleApiResponse<void>(response);

        } catch (error) {
            console.error('❌ 장바구니 상품 추가 실패:', error);
            return await retryIfUnauthorized(error, () => this.addCartItem(request))
        }
    }

    // ✅ 장바구니 아이템 수량 수정 - 전체 장바구니 데이터 반환하도록 수정
    static async updateCartItem(cartItemId: string, request: UpdateCartItemRequest): Promise<CartResponse> {
        try {
            console.log('✏️ 장바구니 상품 수량 수정 요청:', { cartItemId, ...request });

            const response = await apiClient.patch(`/v1/buyers/carts/${cartItemId}`, request);

            const backendData = await handleApiResponse<BackendCartResponse>(response);

            console.log('✏️ 수량 수정 후 백엔드 응답:', backendData);

            const frontendData = convertBackendCartToFrontend(backendData);

            console.log('✏️ 수량 수정 후 변환된 데이터:', frontendData);

            return frontendData;
        } catch (error) {
            console.error('❌ 장바구니 상품 수량 수정 실패:', error);
            return await retryIfUnauthorized(error, () => this.updateCartItem(cartItemId, request))
        }
    }

    // 장바구니 아이템 삭제
    static async removeCartItem(cartItemId: string): Promise<void> {
        try {
            console.log('🗑️ 장바구니 상품 삭제 요청:', cartItemId);

            const response = await apiClient.delete(`/v1/buyers/carts/${cartItemId}`);

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('❌ 장바구니 상품 삭제 실패:', error);
            return await retryIfUnauthorized(error, () => this.removeCartItem(cartItemId))
        }
    }

    // 장바구니 비우기
    static async clearCart(): Promise<void> {
        try {
            console.log('🧹 장바구니 비우기 요청');

            const response = await apiClient.delete(`/v1/buyers/carts`);

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('❌ 장바구니 비우기 실패:', error);
            return await retryIfUnauthorized(error, () => this.clearCart())
        }
    }

    // ✅ 새로운 API: 장바구니 전체 정보 새로고침 (삭제 후 배송비 재계산 등을 위해)
    static async refreshCart(): Promise<CartResponse> {
        try {
            console.log('🔄 장바구니 새로고침 요청');
            return await this.getCart();
        } catch (error) {
            console.error('❌ 장바구니 새로고침 실패:', error);
            return await retryIfUnauthorized(error, () => this.refreshCart())
        }
    }

    // 추천 상품 조회
    static async getRecommendations(): Promise<RecommendationResponse[]> {
        try {
            console.log('🎯 추천 상품 조회 요청');

            const response = await apiClient.get(`/v1/buyers/carts/recommendation`);

            const backendData = await handleApiResponse<BackendRecommendationResponse[]>(response);

            // 백엔드 응답을 프론트엔드 형식으로 변환
            const frontendData = Array.isArray(backendData)
                ? backendData.map(convertBackendRecommendationToFrontend)
                : [];

            console.log('🎯 변환된 추천 데이터:', frontendData);

            return frontendData;

        } catch (error) {
            console.warn('⚠️ 추천 상품 조회 실패 (무시됨):', error);
            // 추천 상품 실패는 전체 앱에 영향을 주지 않으므로 빈 배열 반환
            return [];
        }
    }
}