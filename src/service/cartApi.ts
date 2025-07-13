import { APIResponse } from '@/types/api';

export interface CartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    selected?: boolean;
    sellerId: string;
    sellerName: string;
}

export interface CartResponse {
    totalItemCount: number;
    totalPrice: number;
    cartItems: CartItem[];
}

export interface AddCartItemRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface RecommendationResponse {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    sellerId: string;
    sellerName: string;
}

// API 기본 설정
const API_BASE_URL = '/v1';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// JWT 토큰 가져오기 함수 (실제 토큰 저장 방식에 맞게 수정 필요)
const getAuthToken = (): string | null => {
    // 실제 프로젝트의 토큰 저장 방식에 맞게 수정
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// API 요청 헤더 생성
const createHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// API 응답 처리 유틸리티
const handleApiResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: APIResponse<T> = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'API 요청이 실패했습니다.');
    }

    return result.data;
};

// 장바구니 API 서비스
export class CartApiService {

    // 장바구니 조회
    static async getCart(): Promise<CartResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return await handleApiResponse<CartResponse>(response);
        } catch (error) {
            console.error('장바구니 조회 실패:', error);
            throw error;
        }
    }

    // 장바구니에 상품 추가
    static async addCartItem(request: AddCartItemRequest): Promise<CartResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(request),
            });

            return await handleApiResponse<CartResponse>(response);
        } catch (error) {
            console.error('장바구니 상품 추가 실패:', error);
            throw error;
        }
    }

    // 장바구니 아이템 수량 수정
    static async updateCartItem(cartItemId: string, request: UpdateCartItemRequest): Promise<CartResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts/${cartItemId}`, {
                method: 'PATCH',
                headers: createHeaders(),
                body: JSON.stringify(request),
            });

            return await handleApiResponse<CartResponse>(response);
        } catch (error) {
            console.error('장바구니 상품 수량 수정 실패:', error);
            throw error;
        }
    }

    // 장바구니 아이템 삭제
    static async removeCartItem(cartItemId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts/${cartItemId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('장바구니 상품 삭제 실패:', error);
            throw error;
        }
    }

    // 장바구니 비우기
    static async clearCart(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            await handleApiResponse<void>(response);
        } catch (error) {
            console.error('장바구니 비우기 실패:', error);
            throw error;
        }
    }

    // 추천 상품 조회
    static async getRecommendations(): Promise<RecommendationResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/buyers/carts/recommendation`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return await handleApiResponse<RecommendationResponse[]>(response);
        } catch (error) {
            console.error('추천 상품 조회 실패:', error);
            throw error;
        }
    }
}