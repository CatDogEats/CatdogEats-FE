import { apiClient } from "@/service/auth/AuthAPI"

// 1. 판매자 상품 목록 + 리뷰통계 조회
export async function getSellerProductsOverview({
                                                    page = 0,
                                                    size = 10,
                                                    sortType = "LATEST", // "STAR", "REVIEW" 가능
                                                }: { page?: number; size?: number; sortType?: "LATEST" | "STAR" | "REVIEW" }) {
    const response = await apiClient.get("/v1/sellers/products/list", {
        params: { page, size, sortType },
        withCredentials: true,
    })
    return response.data
}

// 2. 특정 상품의 리뷰 목록 조회
export async function getReviewsByProduct({
                                              productNumber,
                                              page = 0,
                                              size = 10,
                                          }: { productNumber: string; page?: number; size?: number }) {
    const response = await apiClient.get(`/v1/sellers/products/${productNumber}/list`, {
        params: { page, size },
        withCredentials: true,
    })
    return response.data
}
