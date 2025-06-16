// src/components/Home/types/index.ts

// Product 타입은 이제 전역 타입을 사용
export type { Product } from '@/types/Product';

// 기존 Home 관련 타입들은 유지
export interface Workshop {
    id: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    reviewCount: number;
    location: string;
    specialties: string[];
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    image?: string;
}

export interface ContentCategory {
    id: string;
    name: string;
    description?: string;
}

