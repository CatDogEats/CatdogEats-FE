import { apiClient } from '@/service/auth/AuthAPI';
import { retryIfUnauthorized } from '@/service/auth/AuthAPI.ts';

// 재고 조정 요청 DTO
export interface AdjustmentRequestDTO {
    id: string; // productId
    type: string
    quantity: number; // 조정 수량 (입고: 양수, 출고: 음수)
    note: string; // 조정 사유
}

// 재고 조정 기록 조회 응답
export interface InventoryAdjustmentProjection {
    id: string;
    productId: string;
    productsTitle: string;
    note: string;
    adjustmentType: string;
    quantity: number;
    updatedAt: string;
}

// 상품 재고 목록 조회 응답
export interface ProductInventoryProjection {
    id: string;
    productId: string;
    productNumber: number,
    title: string;
    currentStock: number;
    safetyStock?: number;
    unitPrice: number;
    lastUpdated: string;
    supplier?: string;
}

// 페이지 응답 인터페이스
export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
        };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
}

function toProductInventoryProjection(item: any): ProductInventoryProjection {
    return {
        id: item.id,
        productId: item.productId,
        productNumber: item.productNumber,
        title: item.title,
        currentStock: item.stock,
        safetyStock: item.safetyStock,
        unitPrice: item.discountedPrice ?? item.price ?? 0,
        lastUpdated: item.lastUpdated ?? new Date().toISOString(),
    };
}

export const inventoryApi = {
    // 재고 조정 기록 조회 (GET)
    getAdjustmentRecords: async (
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<InventoryAdjustmentProjection>> => {
        try {
            const response = await apiClient.get(
                '/v1/sellers/products/inventory/record',
                { params: { page, size } }
            );
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('재고 조정 기록 조회 실패:', error);
            return await retryIfUnauthorized(error, () =>
                inventoryApi.getAdjustmentRecords(page, size)
            );
        }
    },

    // 재고 조정 등록 (POST)
    createAdjustmentRecord: async (
        dto: AdjustmentRequestDTO
    ): Promise<void> => {
        try {
            await apiClient.post(
                '/v1/sellers/products/inventory/record',
                dto
            );
        } catch (error) {
            console.error('재고 조정 등록 실패:', error);
            return await retryIfUnauthorized(error, () =>
                inventoryApi.createAdjustmentRecord(dto)
            );
        }
    },

    // 상품 재고 목록 조회 (GET) + 변환 로직 적용
    getProductInventoryList: async (
        page: number = 0,
        size: number = 10,
        title?: string
    ): Promise<PageResponse<ProductInventoryProjection>> => {
        try {
            const params: any = { page, size };
            if (title) params.title = title;

            const response = await apiClient.get(
                '/v1/sellers/products/inventory/List',
                {
                    params: { page, size },
                    headers: {
                        'Cache-Control': 'no-cache', // 캐시 제어 헤더 추가
                    },
                }
            );
            const raw = response.data.data;
            console.log(response.data.data);
            return {
                ...raw,
                content: raw.content.map(toProductInventoryProjection),
            };
        } catch (error) {
            console.error('상품 재고 목록 조회 실패:', error);
            return await retryIfUnauthorized(error, () =>
                inventoryApi.getProductInventoryList(page, size, title)
            );
        }
    },
};
