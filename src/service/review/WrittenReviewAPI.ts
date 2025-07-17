import { apiClient } from "@/service/auth/AuthAPI"

// === API 응답 타입 정의 ===
export interface ReviewImage {
    imageId: string
    imageUrl: string
}
export interface ApiReview {
    id: string
    productName: string
    star: number
    contents: string
    updatedAt: string
    images: ReviewImage[]
}
export interface ApiReviewListResponse {
    success: boolean
    message: string
    data: {
        content: ApiReview[]
        page: number
        size: number
        totalElements: number
        totalPages: number
        last: boolean
    }
    timestamp: string
    path: string | null
    errors: any
}
export interface ApiReviewPatchResponse {
    success: boolean
    message: string
    data: any
    timestamp: string
    path: string | null
    errors: any
}
export interface ApiReviewImagePatchResponse {
    success: boolean
    message: string
    data: ReviewImage[]
    timestamp: string
    path: string | null
    errors: any
}

// === 프론트에서 쓸 리뷰 타입 ===
export interface Review {
    id: string
    productName: string
    star: number
    contents: string
    updatedAt: string
    images: ReviewImage[]
}

// === 변환 함수 (응답 → 프론트) ===
export function mapApiReviewToReview(api: ApiReview): Review {
    return {
        id: api.id,
        productName: api.productName,
        star: api.star,
        contents: api.contents,
        updatedAt: api.updatedAt,
        images: api.images.map(img => ({
            imageId: img.imageId,
            imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : 'https://' + img.imageUrl
        }))
    }
}

// === 서비스 구현 ===
export const BuyerReview = {
    // 1. 리뷰 리스트
    getReviewsByBuyer: async(page: number, size: number) => {
        try {
            const res = await apiClient.get<ApiReviewListResponse>(
                '/v1/buyers/reviews/list',
                { params: { page, size } }
            )
            return {
                ...res.data.data,
                content: res.data.data.content.map(mapApiReviewToReview),
            }
        } catch (e) {
            console.error("리뷰 리스트 불러오기 실패", e)
            return null
        }
    },

    // 2. 리뷰 내용 수정 (PATCH)
    async updateReview(params: { reviewId: string; star?: number; contents?: string; summary?: string }) {
        try {
            // undefined 값은 body에서 자동으로 누락
            const body: any = { reviewId: params.reviewId };
            if (params.star !== undefined) body.star = params.star;
            if (params.contents !== undefined) body.contents = params.contents;
            if (params.summary !== undefined) body.summary = params.summary;

            const res = await apiClient.patch<ApiReviewPatchResponse>(
                "/v1/buyers/reviews",
                body,
                { headers: { "Content-Type": "application/json" } }
            );
            return res.data;
        } catch (e) {
            console.error("리뷰 수정 실패", e);
            return null;
        }
    },

    // 3. 리뷰 이미지 수정 (PATCH, FormData)
    async updateReviewImage(
        reviewId: string,
        deleteImageIds: string[],
        images: File[]
    ) {
        try {
            const formData = new FormData();
            formData.append("reviewId", reviewId);
            deleteImageIds.forEach(id => formData.append("oldImageIds", id));
            images.forEach(file => formData.append("images", file));

            const res = await apiClient.patch<ApiReviewImagePatchResponse>(
                "/v1/buyers/reviews/images",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        } catch (e) {
            console.error("리뷰 이미지 수정 실패", e);
            return null;
        }
    },

    // 4. 리뷰 삭제
    deleteReview: async(reviewId: string) => {
        try {
            const res = await apiClient.delete<ApiReviewPatchResponse>(
                '/v1/buyers/reviews', { data: { reviewId } }
            )
            return res.data
        } catch (e) {
            console.error("리뷰 삭제 실패", e)
            return null
        }
    }
}
