import { apiClient } from "@/service/auth/AuthAPI"

// 상품 목록 API 호출
export async function fetchProducts({
                                        petCategory,
                                        productCategory,
                                        sortBy,
                                        page,
                                        size,
                                    }: {
    petCategory?: "DOG" | "CAT";
    productCategory?: "HANDMADE" | "FINISHED";
    sortBy?: "CREATED_AT" | "PRICE" | "AVERAGE_STAR";
    page?: number;
    size?: number;
}) {
    const params: Record<string, any> = {};
    if (petCategory) params.petCategory = petCategory;
    if (productCategory) params.productCategory = productCategory;
    if (sortBy) params.sortBy = sortBy;
    params.page = page ?? 0;
    params.size = size ?? 8;

    const response = await apiClient.get("/v1/buyers/products/list", { params });
    return response.data.data;
}