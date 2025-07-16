// src/components/ProductDetail/Product.ts

export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string; // 단일 이미지 (기존 호환성)
    image?: string; // ProductImages에서 사용
    images?: string[]; // 다중 이미지 배열
    rating: number;
    reviewCount: number;
    productInfoText?: string;

    // ProductDetail 전용 추가 속성들
    description?: string;

    maker?: {
        name: string;
        description: string;
        image: string;
    };
    suitableFor?: string;
    packaging?: Array<{
        value: string;
        label: string;
    }>;
}

export interface RelatedProduct {
    id: string;
    name: string;
    price: number;
    image: string;
}