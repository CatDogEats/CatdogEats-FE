import { apiClient, retryIfUnauthorized } from "@/service/auth/AuthAPI";

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors: any;
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

export interface SellerProduct {
    productId: string;
    title: string;
    updatedAt: string;
    petCategory: "DOG" | "CAT";
    productNumber: string;
    price: number;
    stock: number;
    productCategory: "FINISHED" | "HANDMADE";
    imageUrl: string;
}

export interface ProductFormData {
    id: string;
    productNumber: string;
    productName: string;
    category: "DOG" | "CAT";
    productType: "FINISHED" | "HANDMADE";
    price: number;
    stockQuantity: number;
    images: string[];
    createdAt?: string;
    updatedAt?: string;
}

// ✅ 상품 등록
export async function registerProduct(form: any): Promise<string> {
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

    try {
        const res = await apiClient.post("/v1/sellers/products", payload);
        const location = res.headers["location"] || res.headers["Location"];
        if (!location) throw new Error("상품 등록 후 Location 헤더를 찾을 수 없습니다.");
        return location.split("/").pop();
    } catch (e) {
        return await retryIfUnauthorized(e, () => registerProduct(form));
    }
}

// ✅ 상품 이미지 업로드
export async function uploadProductImages(productId: string, files: File[]): Promise<string> {
    const formData = new FormData();
    formData.append("productId", productId);
    files.forEach((file) => formData.append("images", file));

    try {
        return await apiClient.post("/v1/sellers/products/images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    } catch (e) {
        return await retryIfUnauthorized(e, () =>
            uploadProductImages(productId, files)
        );
    }
}

// ✅ 판매자 상품 목록 조회
export async function fetchSellerProducts(
    page = 0,
    size = 10
): Promise<APIResponse<PageResponse<SellerProduct>>> {
    try {
        const res = await apiClient.get<APIResponse<PageResponse<SellerProduct>>>(
            "/v1/sellers/products",
            {
                params: { page, size },
            }
        );
        return res.data;
    } catch (e) {
        return await retryIfUnauthorized(e, () => fetchSellerProducts(page, size));
    }
}

// ✅ 상품 수정
export async function updateProduct(data: {
    productId: string;
    title: string;
    petCategory: "DOG" | "CAT";
    productCategory: "FINISHED" | "HANDMADE";
    price: number;
    stock: number;
}): Promise<APIResponse<null>> {
    try {
        const res = await apiClient.patch<APIResponse<null>>(
            "/v1/sellers/products",
            data,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return res.data;
    } catch (e) {
        return await retryIfUnauthorized(e, () => updateProduct(data));
    }
}

// ✅ 상품 이미지 수정
export async function updateProductImage(
    productId: string,
    oldImageIds: string[],
    files: File[]
): Promise<string> {
    const formData = new FormData();
    formData.append("productId", productId);
    oldImageIds.forEach((id) => formData.append("oldImageIds", id));
    files.forEach((file) => formData.append("images", file));

    try {
        return await apiClient.post(
            "/v1/sellers/products/images/update",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
    } catch (e: any) {
        return await retryIfUnauthorized(e, () =>
            updateProductImage(productId, oldImageIds, files)
        );
    }
}

// ✅ 상품 삭제
export async function deleteProduct(
    productId: string
): Promise<APIResponse<null>> {
    try {
        const res = await apiClient.delete<APIResponse<null>>(
            "/v1/sellers/products",
            {
                data: { productId },
                headers: { "Content-Type": "application/json" },
            }
        );
        return res.data;
    } catch (e) {
        return await retryIfUnauthorized(e, () => deleteProduct(productId));
    }
}

// ✅ 매핑 함수
export function mapApiProductToForm(product: SellerProduct): ProductFormData {
    let imageUrl = product.imageUrl;
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
        imageUrl = "https://" + imageUrl;
    }
    return {
        id: product.productId,
        productNumber: product.productNumber,
        productName: product.title,
        category: product.petCategory,
        productType: product.productCategory,
        price: product.price,
        stockQuantity: product.stock,
        images: [imageUrl],
        updatedAt: product.updatedAt,
    };
}
