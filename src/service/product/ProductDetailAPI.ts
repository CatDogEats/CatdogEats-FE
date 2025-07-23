// src/api/ProductAPI.ts
import {apiClient} from "@/service/auth/AuthAPI"
// 실제 프론트에서 사용할 Product 타입은 기존대로 import해서 사용
import {Product} from "@/components/ProductDetail/Product";

// 백엔드에서 내려오는 응답 타입 정의 (필요에 따라 확장)
interface BackendProductResponse {
    success: boolean;
    message: string;
    data: {
        title: string;
        subTitle: string;
        productInfo: string;
        contents: string;
        isDiscounted: boolean;
        discountRate: number;
        price: number;
        discountedPrice: number;
        images: string[][];
        vendorName: string | null;
        averageStar: number | null;
        reviewCount: number;
    };
    [key: string]: any;
}

function prefixUrlIfNeeded(url?: string): string | undefined {
    if (!url) return undefined;
    return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

/**
 * 상품 상세조회
 */
export async function getProductDetail(productNumber: string): Promise<Product> {
    const res = await apiClient.get<BackendProductResponse>(`/v1/buyers/products/${productNumber}`);

    if (!res.data.success || !res.data.data) {
        throw new Error("상품 정보를 불러오지 못했습니다.");
    }
    const data = res.data.data;

    // images가 2차원 배열로 오므로 1차원으로 flatten
    let flatImages: string[] = Array.isArray(data.images)
        ? data.images.flat().filter(Boolean)
        : [];

    // 각 이미지에 prefix 적용
    flatImages = flatImages.map(prefixUrlIfNeeded).filter(Boolean) as string[];

    const firstImage = flatImages[0];

    // 프론트 Product 타입으로 매핑
    return {
        id: productNumber,
        name: data.title,
        brand: data.vendorName && data.vendorName.trim() ? data.vendorName : "브랜드 정보 없음",
        price: data.discountedPrice ?? data.price,
        originalPrice: data.price,
        imageUrl: prefixUrlIfNeeded(firstImage),
        image: prefixUrlIfNeeded(firstImage),
        images: flatImages,
        rating: data.averageStar ?? 0,
        reviewCount: data.reviewCount ?? 0,
        description: data.subTitle,
        productInfoText: data.productInfo,
        // 이런 아이에게 좋아요! 영역
        suitableFor: data.contents,
    };
}
