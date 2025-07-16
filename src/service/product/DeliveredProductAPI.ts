export interface DeliveredProduct {
    productId: string;
    productImage: string;
    productName: string;
    deliveredAt: string;
}
export interface DeliveredProductsResponse {
    success: boolean;
    message: string;
    data: {
        content: DeliveredProduct[];
        pageable: any;
        last: boolean;
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        first: boolean;
        numberOfElements: number;
        empty: boolean;
    };
}

export interface CreateReviewRequest {
    productId: string;
    star: number;
    contents: string;
    summary: string;
}
export interface CreateReviewResponse {
    data: { reviewId: string };
    [key: string]: any;
}
export interface UploadReviewImageResponse {
    data: { imageId: string; imageUrl: string }[];
    [key: string]: any;
}

import { apiClient } from "@/service/auth/AuthAPI"

// 배송된 상품 목록 조회
export const getDeliveredProducts = async (
    page = 0,
    size = 10
): Promise<DeliveredProductsResponse> => {
    const response = await apiClient.get("/v1/buyers/reviews/delivered-products", {
        params: { page, size },
    });
    return response.data;
};

// 리뷰 등록
export async function registerReview(data: CreateReviewRequest): Promise<string> {
    const res = await apiClient.post("/v1/buyers/reviews", data);
    // 백엔드가 Location 헤더로도 줄 수 있으니 fallback 처리
    const reviewId =
        res.headers["location"]
            ? res.headers["location"].split("/").pop()
            : res.data?.data?.reviewId;
    if (!reviewId) throw new Error("리뷰 등록 후 reviewId를 찾을 수 없습니다.");
    return reviewId;
}

// 리뷰 이미지 업로드 (쿼리 파라미터 reviewId, images만 FormData)
export async function uploadReviewImages(reviewId: string, files: File[]): Promise<UploadReviewImageResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    const res = await apiClient.post(
        `/v1/buyers/reviews/images?reviewId=${encodeURIComponent(reviewId)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
}