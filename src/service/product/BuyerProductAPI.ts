// service/product/BuyerProduct.ts

import { apiClient } from "@/service/auth/AuthAPI"
import { Product } from '@/types/Product';

// 상품 필터 타입
export type ProductFilterType = 'BEST' | 'NEW' | 'DISCOUNT';

// API 응답 Product 타입 정의 (id 필드 포함)
export interface ApiProduct {
    id: string;
    productNumber: string;
    imageUrl: string;
    vendorName: string;
    title: string;
    averageStar: number | null;
    reviewCount: number;
    price: number;
    isDiscounted: boolean;
    discountRate: number;
    discountedPrice: number;
    createdAt: string;
}

export interface MainProductResponse {
    success: boolean;
    message: string;
    data: ApiProduct[];
    timestamp: string;
    path: string | null;
    errors: any;
}

// 변환 함수
export function mapApiProductToFrontProduct(apiProduct: ApiProduct): Product {
    let imageUrl = apiProduct.imageUrl;
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
        imageUrl = 'https://' + imageUrl;
    }
    return {
        productNumber: apiProduct.productNumber,
        name: apiProduct.title,
        rating: apiProduct.averageStar ?? 0,
        brand: apiProduct.vendorName,
        originalPrice: apiProduct.price,
        price: apiProduct.discountedPrice,
        imageUrl: imageUrl,
        reviewCount: apiProduct.reviewCount,
    };
}

// 상품 리스트 조회 (메인)
export async function getMainProducts(filterType: ProductFilterType): Promise<Product[]> {
    const res = await apiClient.get<MainProductResponse>(
        '/v1/buyers/products/main',
        { params: { filterType } }
    );
    return res.data.data.map(mapApiProductToFrontProduct);
}
