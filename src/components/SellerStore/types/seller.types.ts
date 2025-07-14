// src/components/SellerStore/types/seller.types.ts - 업데이트된 버전
import { ProductResponse, SellerInfoResponse } from '@/service/SellerStoreAPI';

// 프론트엔드용 판매자 프로필 타입 (백엔드 응답을 변환)
export interface SellerProfile {
    id: string;
    name: string;
    profileImage: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
    establishedDate: string; // operationStartDate로 변경
    tags: string[];
    operatingHours: string;
    closedDays: string; // 새로 추가
    location: string; // 주소 정보로 변경
    shippingInfo: string;
    isVerified: boolean;
    isSafetyChecked: boolean;
    description?: string;
}

// 프론트엔드용 상품 타입 (백엔드 응답을 변환)
export interface SellerProduct {
    id: string;
    sellerId: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    isLiked: boolean;
    isOutOfStock: boolean;
    discountPercentage?: number;
}

// 유사 판매자 타입 (기존 유지)
export interface SimilarSeller {
    id: string;
    name: string;
    profileImage: string;
    description: string;
    speciality: string;
}

/**
 * 배송 정보를 사용자 친화적인 형식으로 포맷팅
 * @param avgDeliveryDays 평균 배송 소요일 (소수점 포함)
 * @returns 포맷된 배송 정보 문자열
 */
const formatShippingInfo = (avgDeliveryDays: number): string => {
    // 0일인 경우
    if (avgDeliveryDays <= 0) {
        return '배송 정보 없음';
    }

    // 반올림된 일수 계산
    const roundedDays = Math.round(avgDeliveryDays);

    // 1-2일인 경우: 정확한 일수 표시
    if (roundedDays <= 2) {
        return `평균 ${roundedDays}일 소요`;
    }

    // 3일 이상인 경우: 범위 표시 (±1일)
    const minDays = Math.max(1, roundedDays - 1); // 최소 1일 보장
    const maxDays = roundedDays + 1;

    return `평균 ${minDays}-${maxDays}일 소요`;
};

// 백엔드 응답을 프론트엔드 타입으로 변환하는 유틸리티 함수들
export const transformSellerInfo = (sellerInfo: SellerInfoResponse): SellerProfile => {
    // 이미지 URL 처리
    let profileImage = '/images/default-seller.png'; // 기본 이미지

    if (sellerInfo.vendorProfileImage) {
        console.log('원본 이미지 URL:', sellerInfo.vendorProfileImage); // 디버깅용

        // 절대 URL인 경우 (http:// 또는 https://로 시작)
        if (sellerInfo.vendorProfileImage.startsWith('http')) {
            profileImage = sellerInfo.vendorProfileImage;
        }
        // CloudFront URL인 경우 (도메인으로 시작하지만 프로토콜 없음)
        else if (sellerInfo.vendorProfileImage.includes('cloudfront.net') ||
            sellerInfo.vendorProfileImage.includes('.amazonaws.com') ||
            sellerInfo.vendorProfileImage.match(/^[a-zA-Z0-9.-]+\.(com|net|org)/)) {
            profileImage = `https://${sellerInfo.vendorProfileImage}`;
        }
        // 상대 경로인 경우 (/로 시작)
        else if (sellerInfo.vendorProfileImage.startsWith('/')) {
            const backendUrl = import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
            profileImage = `${backendUrl.replace(/\/$/, '')}${sellerInfo.vendorProfileImage}`;
        }
        // 기타 경우 그대로 시도
        else {
            profileImage = sellerInfo.vendorProfileImage;
        }
    }

    // 운영 시작 날짜 처리
    const formatOperationStartDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        } catch (error) {
            console.error('날짜 형변환 오류:', error);
            return dateString; // 원본 문자열 반환
        }
    };

    // 주소 정보 처리 (한 줄로 표시)
    const formatLocation = () => {
        const { storeAddress } = sellerInfo;
        if (storeAddress && storeAddress.fullAddress) {
            return storeAddress.phoneNumber
                ? `${storeAddress.fullAddress} (${storeAddress.phoneNumber})`
                : storeAddress.fullAddress;
        }
        return '서울'; // 기본값
    };

    console.log('최종 이미지 URL:', profileImage); // 디버깅용

    return {
        id: sellerInfo.sellerId,
        name: sellerInfo.vendorName,
        profileImage: profileImage,
        rating: 4.5, // 백엔드에서 평점 정보가 없으므로 기본값
        reviewCount: sellerInfo.totalReviews,
        salesCount: sellerInfo.totalSalesQuantity,
        establishedDate: formatOperationStartDate(sellerInfo.operationStartDate),
        tags: sellerInfo.tags ? sellerInfo.tags.split(',') : [],
        operatingHours: `${sellerInfo.operatingStartTime} - ${sellerInfo.operatingEndTime}`,
        closedDays: sellerInfo.closedDays || '', // 휴무일 정보
        location: formatLocation(), // 주소 정보
        shippingInfo: formatShippingInfo(sellerInfo.avgDeliveryDays), // 개선된 배송 정보 포맷팅
        isVerified: true, // 기본값
        isSafetyChecked: true, // 기본값
        description: `${sellerInfo.vendorName}의 전문 스토어`
    };
};

export const transformProduct = (product: ProductResponse): SellerProduct => {
    const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';
    const discountPercentage = product.discountRate || undefined;
    const originalPrice = product.discountRate ? product.price : undefined;

    // 상품 이미지 URL 처리
    let productImage = '/images/default-product.png'; // 기본 이미지

    if (product.imageUrl) {
        console.log('원본 상품 이미지 URL:', product.imageUrl); // 디버깅용

        // 절대 URL인 경우 (http:// 또는 https://로 시작)
        if (product.imageUrl.startsWith('http')) {
            productImage = product.imageUrl;
        }
        // CloudFront URL인 경우 (도메인으로 시작하지만 프로토콜 없음)
        else if (product.imageUrl.includes('cloudfront.net') ||
            product.imageUrl.includes('.amazonaws.com') ||
            product.imageUrl.match(/^[a-zA-Z0-9.-]+\.(com|net|org)/)) {
            productImage = `https://${product.imageUrl}`;
        }
        // 상대 경로인 경우 (/로 시작)
        else if (product.imageUrl.startsWith('/')) {
            const backendUrl = import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
            productImage = `${backendUrl.replace(/\/$/, '')}${product.imageUrl}`;
        }
        // 기타 경우 그대로 시도
        else {
            productImage = product.imageUrl;
        }
    }

    console.log('최종 상품 이미지 URL:', productImage); // 디버깅용

    return {
        id: product.productId,
        sellerId: '', // 백엔드 응답에 없으므로 빈 문자열
        name: product.title,
        price: product.discountedPrice,
        originalPrice: originalPrice,
        image: productImage,
        rating: product.avgRating,
        reviewCount: product.reviewCount,
        isLiked: false, // 기본값 (추후 찜 목록 API 연동 시 업데이트)
        isOutOfStock: isOutOfStock,
        discountPercentage: discountPercentage
    };
};

// 필터 옵션 매핑
export const FILTER_MAP = {
    bestProducts: 'best',
    discountProducts: 'discount',
    newProducts: 'new',
    excludeOutOfStock: 'exclude_sold_out'
} as const;

// 정렬 옵션
export const SORT_OPTIONS = {
    latest: 'createdAt,desc',
    oldest: 'createdAt,asc',
    priceLow: 'price,asc',
    priceHigh: 'price,desc'
} as const;