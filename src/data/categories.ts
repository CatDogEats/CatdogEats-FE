// src/data/categories.ts

import type { Category, ContentCategory } from '@/components/Home/types';

export const productCategories: Category[] = [
    {
        id: "dog",
        name: "강아지 간식",
        description: "강아지를 위한 건강하고 맛있는 간식들",
        icon: "🐶",
        image: "/placeholder.svg?height=150&width=150"
    },
    {
        id: "cat",
        name: "고양이 간식",
        description: "고양이가 좋아하는 특별한 간식들",
        icon: "🐱",
        image: "/placeholder.svg?height=150&width=150"
    },
    {
        id: "allergy-free",
        name: "알러지 프리",
        description: "알러지 걱정 없는 안전한 간식들",
        icon: "🌿",
        image: "/placeholder.svg?height=150&width=150"
    },
    {
        id: "dental",
        name: "치아 건강",
        description: "치아와 잇몸 건강을 위한 간식들",
        icon: "🦷",
        image: "/placeholder.svg?height=150&width=150"
    }
];

export const contentCategories: ContentCategory[] = [
    {
        id: "new",
        name: "신상품",
        description: "새로 출시된 인기 상품들"
    },
    {
        id: "bestseller",
        name: "베스트셀러",
        description: "가장 인기 있는 상품들"
    },
    {
        id: "discount",
        name: "할인상품",
        description: "특가로 만나는 좋은 상품들"
    }
];