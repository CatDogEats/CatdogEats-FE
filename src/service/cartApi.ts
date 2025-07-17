import { APIResponse } from '@/types/api';

// 백엔드 응답 구조에 맞춘 타입 정의
export interface BackendCartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    productPrice: number; // 백엔드: productPrice
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
    userId: string;
    items: BackendCartItem[]; // 백엔드: items (cartItems 아님)
    totalAmount: number;
    totalItemCount: number;
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
    totalItemCount: number;
    totalPrice: number;
    cartItems: CartItem[]; // 프론트엔드에서는 cartItems로 통일
}

export interface AddCartItemRequest {
    productId: string;
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

// API 기본 설정 - 환경변수 우선, 없으면 localhost:8080 사용
const API_BASE_URL = import.meta.env.VITE_API_PROXY_TARGET?.replace(/\/$/, '') || 'http://localhost:8080';

console.log('🔗 Cart API Base URL:', API_BASE_URL);

// 토큰 가져오기 함수 - localStorage와 쿠키 모두 확인
const getAuthToken = (): string | null => {
    // 1. localStorage에서 토큰 확인
    const localToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (localToken) {
        return localToken;
    }

    // 2. 쿠키에서 토큰 확인
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' && value) {
            console.log('🍪 쿠키에서 토큰 발견, localStorage에 저장');
            localStorage.setItem('accessToken', value);
            return value;
        }
    }

    return null;
};

// API 요청 헤더 생성
const createHeaders = (): HeadersInit => {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// fetch 요청 기본 옵션
const createFetchOptions = (method: string, body?: any): RequestInit => {
    const options: RequestInit = {
        method,
        headers: createHeaders(),
        credentials: 'include', // 쿠키 포함
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    return options;
};

// API 응답 처리 유틸리티 함수
const handleApiResponse = async <T>(response: any): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 상세한 에러 로깅
        console.error('❌ API 요청 실패:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData
        });

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: APIResponse<T> = await response.json();

    console.log('✅ API 응답 성공:', {
        url: response.url,
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
        price: item.productPrice, // productPrice → price 변환
        quantity: item.quantity,
        selected: true, // 기본값
        sellerId: '', // 현재 백엔드에서 제공하지 않음
        sellerName: '판매자', // 기본값
    }));

    return {
        totalItemCount: backendResponse.totalItemCount,
        totalPrice: backendResponse.totalAmount,
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

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts`,
                createFetchOptions('GET')
            );

            const backendData = await handleApiResponse<BackendCartResponse>(response);

            console.log('📦 백엔드 원본 응답:', backendData);

            // 백엔드 응답을 프론트엔드 형식으로 변환
            const frontendData = convertBackendCartToFrontend(backendData);

            console.log('📦 변환된 프론트엔드 데이터:', frontendData);

            return frontendData;
        } catch (error) {
            console.error('❌ 장바구니 조회 실패:', error);
            throw error;
        }
    }

    // 장바구니에 상품 추가
    static async addCartItem(request: AddCartItemRequest): Promise<CartResponse> {
        try {
            console.log('➕ 장바구니 상품 추가 요청:', request);

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts`,
                createFetchOptions('POST', request)
            );

            const backendData = await handleApiResponse<BackendCartResponse>(response);
            return convertBackendCartToFrontend(backendData);
        } catch (error) {
            console.error('❌ 장바구니 상품 추가 실패:', error);
            throw error;
        }
    }

    // 장바구니 아이템 수량 수정
    static async updateCartItem(cartItemId: string, request: UpdateCartItemRequest): Promise<CartResponse> {
        try {
            console.log('✏️ 장바구니 상품 수량 수정 요청:', { cartItemId, ...request });

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts/${cartItemId}`,
                createFetchOptions('PATCH', request)
            );

            const backendData = await handleApiResponse<BackendCartResponse>(response);
            return convertBackendCartToFrontend(backendData);
        } catch (error) {
            console.error('❌ 장바구니 상품 수량 수정 실패:', error);
            throw error;
        }
    }

    // 장바구니 아이템 삭제
    static async removeCartItem(cartItemId: string): Promise<void> {
        try {
            console.log('🗑️ 장바구니 상품 삭제 요청:', cartItemId);

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts/${cartItemId}`,
                createFetchOptions('DELETE')
            );

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('❌ 장바구니 상품 삭제 실패:', error);
            throw error;
        }
    }

    // 장바구니 비우기
    static async clearCart(): Promise<void> {
        try {
            console.log('🧹 장바구니 비우기 요청');

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts`,
                createFetchOptions('DELETE')
            );

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('❌ 장바구니 비우기 실패:', error);
            throw error;
        }
    }

    // 추천 상품 조회
    static async getRecommendations(): Promise<RecommendationResponse[]> {
        try {
            console.log('🎯 추천 상품 조회 요청');

            const response = await fetch(`${API_BASE_URL}/v1/buyers/carts/recommendation`,
                createFetchOptions('GET')
            );

            // 추천 API가 500 에러를 반환하는 경우 빈 배열 반환
            if (!response.ok) {
                console.warn('⚠️ 추천 상품 API 에러:', response.status, response.statusText);
                return [];
            }

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