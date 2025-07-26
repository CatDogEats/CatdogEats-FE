    import {apiClient, retryIfUnauthorized} from "@/service/auth/AuthAPI"

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

    export const BuyerReview = {
        // 1. 리뷰 리스트 조회
        getReviewsByBuyer: async (
            page: number,
            size: number
        ): Promise<{
            content: Review[];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
            last: boolean;
        }> => {
            try {
                const res = await apiClient.get<ApiReviewListResponse>(
                    "/v1/buyers/reviews/list",
                    { params: { page, size } }
                );
                return {
                    ...res.data.data,
                    content: res.data.data.content.map(mapApiReviewToReview),
                };
            } catch (e) {
                return await retryIfUnauthorized(e, () =>
                    BuyerReview.getReviewsByBuyer(page, size)
                );
            }
        },

        // 2. 리뷰 내용 수정 (PATCH)
        async updateReview(params: {
            reviewId: string;
            star?: number;
            contents?: string;
            summary?: string;
        }): Promise<ApiReviewPatchResponse> {
            try {
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
                return await retryIfUnauthorized(e, () => BuyerReview.updateReview(params));
            }
        },

        // 3. 리뷰 이미지 수정 (PATCH, FormData)
        async updateReviewImage(
            reviewId: string,
            deleteImageIds: string[],
            images: File[]
        ): Promise<ApiReviewImagePatchResponse> {
            try {
                const formData = new FormData();
                formData.append("reviewId", reviewId);
                deleteImageIds.forEach((id) => formData.append("oldImageIds", id));
                images.forEach((file) => formData.append("images", file));

                const res = await apiClient.patch<ApiReviewImagePatchResponse>(
                    "/v1/buyers/reviews/images",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                return res.data;
            } catch (e) {
                return await retryIfUnauthorized(e, () =>
                    BuyerReview.updateReviewImage(reviewId, deleteImageIds, images)
                );
            }
        },

        // 4. 리뷰 삭제
        deleteReview: async (reviewId: string): Promise<ApiReviewPatchResponse> => {
            try {
                const res = await apiClient.delete<ApiReviewPatchResponse>(
                    "/v1/buyers/reviews",
                    { data: { reviewId } }
                );
                return res.data;
            } catch (e) {
                return await retryIfUnauthorized(e, () => BuyerReview.deleteReview(reviewId));
            }
        },
    };