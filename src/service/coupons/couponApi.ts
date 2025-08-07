import {apiClient, retryIfUnauthorized} from '@/service/auth/AuthAPI';

// 쿠폰 관련 타입 정의
export interface Coupon {
    id: string;
    code: string;
    couponName: string;
    discountType: 'PERCENT' | 'AMOUNT';
    discountValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    isUsed?: boolean;
    usedAt?: string;
    status?: 'available' | 'expiring' | 'expired' | 'used';
    isExpiringSoon?: boolean;
    title?: string;
    expiryDate?: string;
    minOrderAmount?: number;
    vendorName?: string;
}

export interface BuyerCouponListResponse {
    count: {
        availableCount: number;
        expiringSoonCount: number;
    };
    selected: Array<{
        id: string;
        code: string;
        couponName: string;
        discountType: 'PERCENT' | 'AMOUNT';
        discountValue: number;
        startDate: string;
        endDate: string;
        isUsed: boolean;
    }>;
}

export interface SellerCouponListResponse {
    id: string;
    code: string;
    couponName: string;
    discountType: 'PERCENT' | 'AMOUNT';
    discountValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    vendorName?: string;
}

// 쿠폰 필터 타입 (백엔드와 정확히 매칭)
export type CouponFilterType = 'ALL' | 'AVAILABLE' | 'EXPIRING' | 'USED_OR_EXPIRED';

// 구매자 쿠폰 생성 요청
export interface BuyerCreateCouponRequest {
    code: string;
}

// 판매자 쿠폰 생성 요청
export interface SellerCreateCouponRequest {
    code: string;
    couponName: string;
    discountType: 'PERCENT' | 'AMOUNT';
    discountValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
}

// 판매자 쿠폰 수정 요청
export interface SellerModifyCouponRequest {
    id: string;
    couponName?: string;
    code?: string;
    discountType?: 'PERCENT' | 'AMOUNT';
    discountValue?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
}

// 판매자 쿠폰 삭제 요청
export interface SellerDeleteCouponRequest {
    id: string;
}

// 구매자 쿠폰 API
export const buyerCouponApi = {
    // 구매자 쿠폰 목록 조회
    getBuyerCoupons: async (filter: CouponFilterType = 'ALL', page: number = 0): Promise<BuyerCouponListResponse> => {
        try {
            const response = await apiClient.get('/v1/buyers/coupons', {
                params: { filter, page }
            });
            return response.data.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => buyerCouponApi.getBuyerCoupons(filter, page));
        }
    },

    // 구매자 쿠폰 등록 (쿠폰 코드로)
    createBuyerCoupon: async (request: BuyerCreateCouponRequest): Promise<void> => {
        try {
            const response = await apiClient.post('/v1/buyers/coupons', request);
            return response.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => buyerCouponApi.createBuyerCoupon(request));
        }

    }
};

// 판매자 쿠폰 API
export const sellerCouponApi = {
    // 판매자 쿠폰 목록 조회 (본인 쿠폰)
    getSellerCoupons: async (page: number = 0, size: number = 10): Promise<SellerCouponListResponse[]> => {
        try {
            const response = await apiClient.get('/v1/sellers/coupons', {
                params: { page, size }
            });
            return response.data.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => sellerCouponApi.getSellerCoupons(page, size));
        }
    },

    // 특정 판매자 쿠폰 목록 조회 (vendorName으로)
    getSellerCouponsByVendor: async (vendorName: string, page: number = 0): Promise<SellerCouponListResponse[]> => {
        const response = await apiClient.get(`/v1/sellers/coupons/${vendorName}`, {
            params: { page }
        });
        return response.data.data;
    },

    // 판매자 쿠폰 생성
    createSellerCoupon: async (request: SellerCreateCouponRequest): Promise<void> => {
        try {
            const response = await apiClient.post('/v1/sellers/coupons', request);
            return response.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => sellerCouponApi.createSellerCoupon(request));
        }
    },

    // 판매자 쿠폰 수정
    updateSellerCoupon: async (request: SellerModifyCouponRequest): Promise<void> => {
        try {
            const response = await apiClient.patch('/v1/sellers/coupons', request);
            return response.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => sellerCouponApi.updateSellerCoupon(request));
        }
    },

    // 판매자 쿠폰 삭제
    deleteSellerCoupon: async (request: SellerDeleteCouponRequest): Promise<void> => {
        try {
            const response = await apiClient.delete('/v1/sellers/coupons', {
                data: request
            });
            return response.data;
        } catch (error: unknown) {
            return await retryIfUnauthorized(error, () => sellerCouponApi.deleteSellerCoupon(request));
        }
    }
};

// 쿠폰 데이터 변환 유틸리티 함수들
export const couponUtils = {
    // 백엔드 쿠폰 데이터를 프론트엔드 형식으로 변환
    transformBuyerCoupon: (coupon: any): Coupon => {
        if (!coupon) {
            console.warn('Invalid coupon data:', coupon);
            return {
                id: 'unknown',
                code: 'unknown',
                couponName: 'Unknown Coupon',
                discountType: 'AMOUNT',
                discountValue: 0,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                usageLimit: 0,
                status: 'expired'
            };
        }

        const now = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let status: 'available' | 'expiring' | 'expired' | 'used';

        if (coupon.isUsed) {
            status = 'used';
        } else if (endDate < now || now < startDate) {
            // 만료되었거나 아직 시작되지 않은 쿠폰
            status = 'expired';
        } else if (daysUntilExpiry <= 3) {
            // 3일 이내 만료 예정 (백엔드 쿼리와 일치)
            status = 'expiring';
        } else {
            status = 'available';
        }

        return {
            id: coupon.id,
            code: coupon.code,
            couponName: coupon.couponName,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            usageLimit: coupon.usageLimit || 0, // 백엔드 쿼리에는 없지만 기본값 설정
            isUsed: coupon.isUsed,
            usedAt: coupon.usedAt,
            status,
            isExpiringSoon: status === 'expiring',
            title: coupon.couponName,
            expiryDate: coupon.endDate,
        };
    },

    // 쿠폰 필터 타입 변환
    getFilterFromCategory: (category: string): CouponFilterType => {
        switch (category) {
            case 'available':
                return 'AVAILABLE';
            case 'expiring':
                return 'EXPIRING';
            case 'used-expired':
                return 'USED_OR_EXPIRED';
            default:
                return 'ALL';
        }
    },

    // 할인 금액 포맷팅
    formatDiscount: (discountType: 'PERCENT' | 'AMOUNT', discountValue: number): string => {
        if (discountType === 'PERCENT') {
            return `${discountValue}%`;
        }
        return `${discountValue.toLocaleString()}원`;
    },

    // 날짜 포맷팅
    formatExpiryDate: (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일까지`;
    }
};