// src/types/Product.ts

export interface Product {
    productNumber: string;
    name: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    image?: string; // 호환성을 위한 필드
    rating: number;
    reviewCount: number;
    isNew?: boolean;
    isBestseller?: boolean;
    isBestSeller?: boolean; // 호환성을 위한 필드
    isOutOfStock?: boolean;
    restockDate?: string;
    shippingInfo?: string;
    category?: ProductCategory | string;
    petType?: PetType;
    ingredients?: string[];
    healthBenefits?: string[];
    isFavorite?: boolean;
    hasAllergens?: boolean; // 알러지 유발 성분 포함 여부
}

export type PetType = "강아지" | "고양이";

export type ProductCategory =
    | "훈련용 간식"
    | "건강 간식"
    | "치아 건강"
    | "수제 간식"
    | "무첨가 간식"
    | "dog"
    | "cat"; // 호환성을 위한 필드

export interface ProductFilters {
    petType: PetType | null;
    productType: ProductType | null;
}

export type ProductType = "전체" | "수제품" | "완제품";

export interface SortOption {
    value: string;
    label: string;
}

export const PET_TYPES: PetType[] = ["강아지", "고양이"];

export const PRODUCT_TYPES: ProductType[] = ["전체", "수제품", "완제품"];

export const SORT_OPTIONS = [
    { value: "CREATED_AT", label: "최신순" },
    { value: "PRICE", label: "가격순" },
    { value: "AVERAGE_STAR", label: "평점순" },
];


export const ALLERGEN_OPTIONS = [
    { value: null, label: "전체" },
    { value: false, label: "무" },
    { value: true, label: "유" },
] as const;