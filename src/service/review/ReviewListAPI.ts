import { apiClient } from "@/service/auth/AuthAPI"
import { Review, ReviewStats } from "@/components/ProductDetail/review";

export interface APIResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
    path: string | null
    errors: any
}

export interface PageResponse<T> {
    content: T[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
    empty: boolean;
}

export interface ReviewImage {
    imageId: string;
    imageUrl: string;
}

export interface ReviewResponseItem {
    id: string;
    writerName: string;
    petInfoDtoList: any[]; // 필요하면 타입 정의
    star: number;
    contents: string;
    updatedAt: string;
    images: ReviewImage[];
}

export interface PetInfoDto {
    breed: string;
    age: number;
    gender: "M" | "F";
}

export async function getProductReviews(
    productNumber: string,
    page: number = 0,
    size: number = 10
) {
    const res = await apiClient.get<APIResponse<PageResponse<ReviewResponseItem>>>(`/v1/buyers/reviews/${productNumber}/list`, {
        params: { page, size }
    });
    return res.data;
}

export function mapReviewResponseToReview(item: ReviewResponseItem): Review {
    // petInfoDtoList 가공 (여러마리라면 첫 번째만 표시)
    let petInfoText = "";
    if (item.petInfoDtoList && item.petInfoDtoList.length > 0) {
        const pet = item.petInfoDtoList[0];
        petInfoText = `${pet.breed}, ${pet.age}살, ${pet.gender === "M" ? "남" : "여"}`;
    }
    return {
        id: item.id,
        reviewer: {
            name: item.writerName,
            avatar: "", // 필요시 기본값
            petInfo: petInfoText,
        },
        rating: item.star,
        content: item.contents,
        date: item.updatedAt,
        images: item.images?.map(img =>
            img.imageUrl.startsWith("http") ? img.imageUrl : `https://${img.imageUrl}`
        ) || [],
    };
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
    const totalReviews = reviews.length;
    const ratingCounts: Record<string, number> = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    reviews.forEach(r => {
        const ratingKey = String(r.rating) as keyof typeof ratingCounts;
        if (ratingCounts[ratingKey] !== undefined) {
            ratingCounts[ratingKey]++;
        }
    });

    // **여기서 퍼센트로 변환**
    const ratingDistribution: Record<string, number> = {};
    (["5", "4", "3", "2", "1"] as const).forEach(key => {
        ratingDistribution[key] =
            totalReviews > 0 ? Math.round((ratingCounts[key] / totalReviews) * 100) : 0;
    });

    const ratingSum = reviews.reduce((acc, cur) => acc + cur.rating, 0);
    const averageRating = totalReviews === 0 ? 0 : Number((ratingSum / totalReviews).toFixed(1));

    return {
        averageRating,
        totalReviews,
        ratingDistribution, // 이제 % 값이 들어감!
    };
}