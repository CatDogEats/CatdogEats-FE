// src/data/workshops.ts

import type { Workshop } from '@/components/Home/types';

export const popularWorkshops: Workshop[] = [
    {
        id: "1",
        name: "사랑가득 엄마손길",
        description: "유기농 재료로 만드는 건강 간식 전문 공방입니다. 신선한 재료로 매일 만드는 건강한 간식을 제공합니다.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop",
        rating: 4.8,
        reviewCount: 234,
        location: "서울 강남구",
        specialties: ["유기농", "건강간식", "수제", "맞춤 제작"]
    },
    {
        id: "2",
        name: "댕댕이 쉐프",
        description: "특별한 날을 위한 맞춤 케이크 & 쿠키를 만드는 디자인 공방입니다.",
        image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=200&fit=crop",
        rating: 4.6,
        reviewCount: 187,
        location: "서울 홍대",
        specialties: ["케이크", "쿠키", "맞춤제작", "특별한 날"]
    },
    {
        id: "3",
        name: "냥이네 부엌",
        description: "까다로운 냥님 입맛 저격! 영양만점 간식을 만드는 고양이 전문 공방입니다.",
        image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=200&fit=crop",
        rating: 4.7,
        reviewCount: 156,
        location: "부산 해운대구",
        specialties: ["고양이 전문", "영양간식", "프리미엄", "전문 상담"]
    },
    {
        id: "4",
        name: "헬시펫 키친",
        description: "반려동물 영양사가 직접 운영하는 건강 간식 전문 공방입니다.",
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=200&fit=crop",
        rating: 4.5,
        reviewCount: 98,
        location: "대구 수성구",
        specialties: ["건강식", "다이어트", "시니어", "건강 관리"]
    },
    {
        id: "5",
        name: "자연애 공방",
        description: "자연 그대로의 맛을 살린 무첨가 간식을 만드는 친환경 공방입니다.",
        image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=200&fit=crop",
        rating: 4.4,
        reviewCount: 143,
        location: "제주도 제주시",
        specialties: ["무첨가", "자연식", "소량생산", "지속가능"]
    },
    {
        id: "6",
        name: "그린펫 팩토리",
        description: "친환경 재료와 지속가능한 방식으로 제작하는 펫 간식 공방입니다.",
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.5,
        reviewCount: 67,
        location: "제주도 제주시",
        specialties: ["친환경", "지속가능", "제주 특산물"]
    }
];