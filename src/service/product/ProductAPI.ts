import { apiClient } from "@/service/auth/AuthAPI"

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

// 백엔드 상품 단건 타입
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

// 프론트 사용용 ProductFormData (id: string 등 프론트에 맞게)
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
    // 기타 필요시 추가
}

// 상품 등록
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

// 판매자 상품 목록 조회
export async function fetchSellerProducts(page = 0, size = 10): Promise<APIResponse<PageResponse<SellerProduct>>> {
    const res = await apiClient.get<APIResponse<PageResponse<SellerProduct>>>("/v1/sellers/products", {
        params: { page, size }
    });
    return res.data;
}

// 상품 수정
export interface UpdateProductRequest {
    productId: string;
    title?: string;
    subTitle?: string;
    productInfo?: string;
    contents?: string;
    petCategory?: "DOG" | "CAT";
    productCategory?: "FINISHED" | "HANDMADE";
    stockStatus?: string;
    isDiscounted?: boolean;
    discountRate?: number;
    price?: number;
    leadTime?: number;
    stock?: number;
    // 기타 필요시 추가
}
export async function updateProduct(data: {
    productId: string;
    title: string;
    petCategory: "DOG" | "CAT";
    productCategory: "FINISHED" | "HANDMADE";
    price: number;
    stock: number
}): Promise<APIResponse<null>> {
    const res = await apiClient.patch<APIResponse<null>>("/v1/sellers/products", data, {
        headers: { "Content-Type": "application/json" }
    });
    return res.data;
}

// 상품 이미지 수정 (update)
export async function updateProductImage(
    productId: string,
    oldImageIds: string[], // 삭제할 이미지 id 목록
    files: File[]
) {
    const formData = new FormData();
    formData.append("productId", productId);
    oldImageIds.forEach(id => formData.append("oldImageIds", id));
    files.forEach(file => formData.append("images", file));

    // 실제 백엔드 경로가 다르면 경로 수정!
    return apiClient.post("/v1/sellers/products/images/update", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<APIResponse<null>> {
    const res = await apiClient.delete<APIResponse<null>>("/v1/sellers/products", {
        data: { productId },
        headers: { "Content-Type": "application/json" }
    });
    return res.data;
}

// 매핑 함수 (백엔드 → 프론트)
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
        updatedAt: product.updatedAt
    };
}

