import { apiClient } from "@/service/auth/AuthAPI"

export interface ReviewSummary {
    productTitle: string;
    positiveReview: string;
    positiveMainPoints: string[];
    positiveKeywords: string[];
    negativeReview: string;
    negativeMainPoints: string[];
    negativeKeywords: string[];
}

// 서버 응답 전체 타입
export interface ReviewSummaryResponse {
    success: boolean;
    message: string;
    data: ReviewSummary;
    timestamp: string;
    path?: string | null;
    errors?: any;
}

export async function getReviewSummary(productNumber: string): Promise<ReviewSummary> {
    const res = await apiClient.get<ReviewSummaryResponse>(`/v1/buyers/reviews/${productNumber}`);
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "리뷰 요약 정보를 가져오지 못했습니다.");
    }
    return res.data.data;
}
