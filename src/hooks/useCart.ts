import { useState, useEffect, useCallback } from 'react';
import {
    CartApiService,
    CartResponse,
    CartItem,
    AddCartItemRequest,
    RecommendationResponse
} from '@/service/cartApi';

interface UseCartReturn {
    // 상태
    cartData: CartResponse | null;
    cartItems: CartItem[];
    loading: boolean;
    error: string | null;
    recommendations: RecommendationResponse[];

    // 액션
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<boolean>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
    removeItem: (cartItemId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    fetchRecommendations: () => Promise<void>;

    // 유틸리티
    getTotalPrice: () => number;
    getTotalItemCount: () => number;
    getSelectedItems: () => CartItem[];
    updateItemSelection: (cartItemId: string, selected: boolean) => void;
}

export const useCart = (): UseCartReturn => {
    // 상태 관리
    const [cartData, setCartData] = useState<CartResponse | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);

    // 에러 핸들링 유틸리티
    const handleError = useCallback((error: unknown, defaultMessage: string) => {
        const errorMessage = error instanceof Error ? error.message : defaultMessage;
        setError(errorMessage);
        console.error(defaultMessage, error);
        return false;
    }, []);

    // 성공 처리 유틸리티
    const handleSuccess = useCallback(() => {
        setError(null);
        return true;
    }, []);

    // 장바구니 조회
    const fetchCart = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await CartApiService.getCart();
            setCartData(response);

            // 장바구니 아이템에 selected 속성 추가 (기본값: true)
            const itemsWithSelection = response.cartItems.map(item => ({
                ...item,
                selected: true
            }));

            setCartItems(itemsWithSelection);
            console.log('장바구니 조회 성공:', response);
        } catch (error) {
            handleError(error, '장바구니 조회에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    // 장바구니에 상품 추가
    const addToCart = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
        setLoading(true);

        try {
            const request: AddCartItemRequest = { productId, quantity };
            const response = await CartApiService.addCartItem(request);

            setCartData(response);
            const itemsWithSelection = response.cartItems.map(item => ({
                ...item,
                selected: true
            }));
            setCartItems(itemsWithSelection);

            console.log('장바구니 상품 추가 성공:', response);
            return handleSuccess();
        } catch (error) {
            return handleError(error, '상품을 장바구니에 추가하는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [handleError, handleSuccess]);

    // 수량 변경
    const updateQuantity = useCallback(async (cartItemId: string, quantity: number): Promise<boolean> => {
        if (quantity < 1) return false;

        setLoading(true);

        try {
            const response = await CartApiService.updateCartItem(cartItemId, { quantity });

            setCartData(response);
            const itemsWithSelection = response.cartItems.map(item => {
                const existingItem = cartItems.find(existing => existing.id === item.id);
                return {
                    ...item,
                    selected: existingItem?.selected ?? true
                };
            });
            setCartItems(itemsWithSelection);

            console.log('장바구니 수량 변경 성공:', response);
            return handleSuccess();
        } catch (error) {
            return handleError(error, '상품 수량 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [cartItems, handleError, handleSuccess]);

    // 상품 삭제
    const removeItem = useCallback(async (cartItemId: string): Promise<boolean> => {
        setLoading(true);

        try {
            await CartApiService.removeCartItem(cartItemId);

            // 로컬 상태에서 아이템 제거
            const updatedItems = cartItems.filter(item => item.id !== cartItemId);
            setCartItems(updatedItems);

            // cartData 업데이트
            if (cartData) {
                const newTotalItemCount = updatedItems.length;
                const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                setCartData({
                    ...cartData,
                    totalItemCount: newTotalItemCount,
                    totalPrice: newTotalPrice,
                    cartItems: updatedItems.map(({ selected, ...item }) => item)
                });
            }

            console.log('장바구니 상품 삭제 성공');
            return handleSuccess();
        } catch (error) {
            return handleError(error, '상품 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [cartItems, cartData, handleError, handleSuccess]);

    // 장바구니 비우기
    const clearCart = useCallback(async (): Promise<boolean> => {
        setLoading(true);

        try {
            await CartApiService.clearCart();

            setCartItems([]);
            setCartData({
                totalItemCount: 0,
                totalPrice: 0,
                cartItems: []
            });

            console.log('장바구니 비우기 성공');
            return handleSuccess();
        } catch (error) {
            return handleError(error, '장바구니 비우기에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [handleError, handleSuccess]);

    // 추천 상품 조회
    const fetchRecommendations = useCallback(async (): Promise<void> => {
        try {
            const response = await CartApiService.getRecommendations();
            setRecommendations(response);
            console.log('추천 상품 조회 성공:', response);
        } catch (error) {
            console.error('추천 상품 조회 실패:', error);
            // 추천 상품은 실패해도 에러 상태로 설정하지 않음
        }
    }, []);

    // 아이템 선택 상태 변경 (로컬 상태만 변경)
    const updateItemSelection = useCallback((cartItemId: string, selected: boolean) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === cartItemId ? { ...item, selected } : item
            )
        );
    }, []);

    // 유틸리티 함수들
    const getTotalPrice = useCallback((): number => {
        return cartItems
            .filter(item => item.selected)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cartItems]);

    const getTotalItemCount = useCallback((): number => {
        return cartItems
            .filter(item => item.selected)
            .reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const getSelectedItems = useCallback((): CartItem[] => {
        return cartItems.filter(item => item.selected);
    }, [cartItems]);

    // 컴포넌트 마운트 시 장바구니 조회
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        // 상태
        cartData,
        cartItems,
        loading,
        error,
        recommendations,

        // 액션
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchRecommendations,

        // 유틸리티
        getTotalPrice,
        getTotalItemCount,
        getSelectedItems,
        updateItemSelection,
    };
};