import { apiClient } from "@/service/auth/AuthAPI"

// 상품 등록: data를 백엔드 포맷에 맞게 변환 후 전송
export async function registerProduct(form: any) {
    // 프론트 → 백엔드 필드 매핑
    const payload = {
        title: form.productName,
        subTitle: form.subtitle,
        productInfo: form.ingredients,
        contents: form.description,
        petCategory: form.category,
        productCategory: form.productType,
        isDiscounted: form.isDiscount,
        discountRate: form.discountRate,
        price: form.price,
        leadTime: form.leadTime,
        stock: form.stockQuantity,
    };

    // 상품 등록
    const res = await apiClient.post("/v1/sellers/products", payload);
    const location = res.headers["location"] || res.headers["Location"];
    if (!location) throw new Error("상품 등록 후 Location 헤더를 찾을 수 없습니다.");
    const productId = location.split("/").pop();
    return productId;
}

// 상품 이미지 업로드
export async function uploadProductImages(productId: string, files: File[]) {
    const formData = new FormData();
    formData.append("productId", productId);
    files.forEach((file) => {
        formData.append("images", file);
    });

    return apiClient.post("/v1/sellers/products/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}