import { useState, useEffect, useCallback } from 'react';
import { CartApiService, CartItem, RecommendationResponse, AddCartItemRequest } from '@/service/cartApi';

export interface UseCartReturn {
    // 상태
    cartItems: CartItem[];
    loading: boolean;
    error: string | null;
    recommendations: RecommendationResponse[];

    // 액션
    fetchCart: () => Promise<void>;
    addItem: (request: AddCartItemRequest) => Promise<boolean>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
    removeItem: (cartItemId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    updateItemSelection: (cartItemId: string, selected: boolean) => void;
    fetchRecommendations: () => Promise<void>;

    // 계산된 값
    getTotalPrice: () => number;
    getTotalItemCount: () => number;
    getSelectedItems: () => CartItem[];
}

export const useCart = (): UseCartReturn => {
    // 상태 관리
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);

    // 에러 처리 헬퍼
    const handleError = useCallback((error: unknown, defaultMessage: string) => {
        console.error('Cart operation failed:', error);
        const errorMessage = error instanceof Error ? error.message : defaultMessage;
        setError(errorMessage);
        return false;
    }, []);

    // 장바구니 조회
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await CartApiService.getCart();

            // 백엔드 응답에서 cartItems 배열 추출하고 selected 필드 초기화
            const itemsWithSelection = response.cartItems.map(item => ({
                ...item,
                selected: true // 기본적으로 모든 아이템 선택
            }));

            setCartItems(itemsWithSelection);

        } catch (error) {
            handleError(error, '장바구니를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    // 장바구니에 상품 추가
    const addItem = useCallback(async (request: AddCartItemRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await CartApiService.addCartItem(request);
            await fetchCart(); // 장바구니 새로고침

            return true;
        } catch (error) {
            return handleError(error, '상품을 장바구니에 추가하는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [fetchCart, handleError]);

    // 수량 수정
    const updateQuantity = useCallback(async (cartItemId: string, quantity: number): Promise<boolean> => {
        if (quantity < 1) return false;

        try {
            setLoading(true);
            setError(null);

            await CartApiService.updateCartItem(cartItemId, { quantity });

            // 로컬 상태 즉시 업데이트 (UX 개선)
            setCartItems(prev => prev.map(item =>
                item.id === cartItemId ? { ...item, quantity } : item
            ));

            return true;
        } catch (error) {
            // 실패 시 서버에서 다시 가져와서 동기화
            await fetchCart();
            return handleError(error, '수량 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [fetchCart, handleError]);

    // 상품 삭제
    const removeItem = useCallback(async (cartItemId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await CartApiService.removeCartItem(cartItemId);

            // 로컬 상태에서 즉시 제거 (UX 개선)
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));

            return true;
        } catch (error) {
            // 실패 시 서버에서 다시 가져와서 동기화
            await fetchCart();
            return handleError(error, '상품 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [fetchCart, handleError]);

    // 장바구니 비우기
    const clearCart = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await CartApiService.clearCart();
            setCartItems([]);

            return true;
        } catch (error) {
            return handleError(error, '장바구니 비우기에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    // 아이템 선택 상태 변경 (로컬 상태만 변경)
    const updateItemSelection = useCallback((cartItemId: string, selected: boolean) => {
        setCartItems(prev => prev.map(item =>
            item.id === cartItemId ? { ...item, selected } : item
        ));
    }, []);

    // 추천 상품 조회
    const fetchRecommendations = useCallback(async () => {
        try {
            const data = await CartApiService.getRecommendations();
            setRecommendations(data);
        } catch (error) {
            console.warn('추천 상품 조회 실패:', error);
            // 추천 상품은 실패해도 에러로 처리하지 않음
            setRecommendations([]);
        }
    }, []);

    // 계산된 값들
    const getTotalPrice = useCallback((): number => {
        return cartItems
            .filter(item => item.selected)
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    const getTotalItemCount = useCallback((): number => {
        return cartItems
            .filter(item => item.selected)
            .reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const getSelectedItems = useCallback((): CartItem[] => {
        return cartItems.filter(item => item.selected);
    }, [cartItems]);

    // 컴포넌트 마운트 시 장바구니 로드
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        // 상태
        cartItems,
        loading,
        error,
        recommendations,

        // 액션
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        updateItemSelection,
        fetchRecommendations,

        // 계산된 값
        getTotalPrice,
        getTotalItemCount,
        getSelectedItems,
    };
};