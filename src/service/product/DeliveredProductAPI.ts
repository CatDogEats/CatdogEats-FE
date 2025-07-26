import { apiClient, retryIfUnauthorized } from "@/service/auth/AuthAPI";

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

// 🚚 배송된 상품 목록 조회
export const getDeliveredProducts = async (
    page = 0,
    size = 10
): Promise<DeliveredProductsResponse> => {
    try {
        const response = await apiClient.get("/v1/buyers/reviews/delivered-products", {
            params: { page, size },
        });
        return response.data;
    } catch (e) {
        return await retryIfUnauthorized(e, () => getDeliveredProducts(page, size));
    }
};

// ✍️ 리뷰 등록
export async function registerReview(data: CreateReviewRequest): Promise<string> {
    try {
        const res = await apiClient.post("/v1/buyers/reviews", data);
        const reviewId =
            res.headers["location"]
                ? res.headers["location"].split("/").pop()
                : res.data?.data?.reviewId;

        if (!reviewId) throw new Error("리뷰 등록 후 reviewId를 찾을 수 없습니다.");
        return reviewId;
    } catch (e) {
        return await retryIfUnauthorized(e, () => registerReview(data));
    }
}

// 🖼️ 리뷰 이미지 업로드
export async function uploadReviewImages(
    reviewId: string,
    files: File[]
): Promise<UploadReviewImageResponse> {
    try {
        const formData = new FormData();
        files.forEach(file => formData.append("images", file));

        const res = await apiClient.post(
            `/v1/buyers/reviews/images?reviewId=${encodeURIComponent(reviewId)}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return res.data;
    } catch (e) {
        return await retryIfUnauthorized(e, () => uploadReviewImages(reviewId, files));
    }
}
