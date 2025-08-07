// src/types/ProductManagement.ts

export interface ProductFormData {
  id?: string;
  productName: string;
  subtitle: string;
  category: ProductCategory;
  productType: "FINISHED" | "HANDMADE";
  price: number;
  isDiscount: boolean;
  discountRate: number;
  description: string;
  ingredients: string;
  images: File[];
  stockQuantity: number;
  salesStartDate: string;
  shippingCosts: number;
  leadTime: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 재고 현황 테이블용 StockItem 인터페이스 (단순화된 버전)
export interface StockItem {
  id: string;
  productNumber: number; // 원본 productNumber 추가
  productName: string;
  supplier: string;
  currentStock: number;
  availableStock: number;
  safetyStock: number;
  unitPrice: number;
  status: "충분" | "부족" | "품절";
  lastUpdated: string;
}

// 재고 이동 기록용 인터페이스
export interface StockMovement {
  id: string;
  productId: string;
  productsTitle: string;
  type: UiAdjustmentType;
  quantity: number;
  updatedAt: string;
  orderNumber?: string;
  notes?: string;
}

export type ProductCategory =
    | "DOG"
    | "CAT";

export type StockStatus = "충분" | "부족" | "품절" | "재주문필요";

export const PRODUCT_CATEGORIES = [
  { value: "DOG", label: "강아지 간식" },
  { value: "CAT", label: "고양이 간식" }
] as const;

// API에서 사용하는 타입 (백엔드 AdjustmentType enum과 일치)
export type ApiAdjustmentType = "IN" | "OUT" | "ADJUSTMENT";

// UI에서 사용하는 타입 (백엔드에 맞춰 "반품" 제거)
export type UiAdjustmentType = "입고" | "출고" | "조정";

export interface AdjustForm {
  type: "입고" | "출고" | "조정";
  quantity: string;
  orderNumber: string;
  safetyStock: string;
  notes: string;
}

// API 타입을 UI 타입으로 변환하는 함수 (백엔드 enum과 일치)
export const convertApiTypeToUiType = (apiType: ApiAdjustmentType): UiAdjustmentType => {
  switch (apiType) {
    case "IN":
      return "입고";
    case "OUT":
      return "출고";
    case "ADJUSTMENT":
      return "조정";
    default:
      return "조정";
  }
};

// UI 타입을 API 타입으로 변환하는 함수 (백엔드 enum과 일치)
export const convertUiTypeToApiType = (uiType: UiAdjustmentType): ApiAdjustmentType => {
  switch (uiType) {
    case "입고":
      return "IN";
    case "출고":
      return "OUT";
    case "조정":
      return "ADJUSTMENT";
    default:
      return "ADJUSTMENT";
  }
};

export const PRODUCT_TYPE_OPTIONS = [
  { value: "FINISHED", label: "완제품" },
  { value: "HANDMADE", label: "수제품" },
] as const;