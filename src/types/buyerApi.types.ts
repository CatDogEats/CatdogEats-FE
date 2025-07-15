// src/types/buyerApi.types.ts

// ===== 공통 API 응답 타입 =====
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===== 반려동물 관련 타입 =====
export interface PetResponse {
  id: string;
  name: string;
  petCategory: "DOG" | "CAT";
  breed: string;
  age: number;
  gender: "M" | "F";
  isAllergy: boolean;
  healthState: string;
  requestion: string | null;
  updatedAt: string;
}

// ===== 주소 관련 타입 =====
export interface AddressResponse {
  id: string;
  title: string;
  city: string;
  streetAddress: string;
  detailAddress: string;
  postalCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface DefaultAddressResponse {
  recipientName: string;
  city: string;
  streetAddress: string;
  detailAddress: string;
  postalCode: string;
  phoneNumber: string;
}

// ===== 쿠폰 관련 타입 =====
export interface CouponResponse {
  count: {
    availableCount: number;
    expiringSoonCount: number;
  };
  selected: Array<{
    id: string;
    code: string;
    couponName: string;
    discountType: "PERCENT" | "AMOUNT";
    discountValue: number;
    startDate: string;
    endDate: string;
    isUsed: boolean;
  }>;
}

// ===== 주문 생성 관련 타입 =====
export interface OrderCreateRequest {
  orderItems: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentInfo: {
    orderName: string;
    sellerCoupons: string[];
  };
  shippingAddress: {
    recipientName: string;
    recipientPhone: string;
    postalCode: string;
    streetAddress: string;
    detailAddress: string;
    deliveryNote?: string;
  };
}

export interface OrderCreateResponse {
  orderId: string;
  orderNumber: string;
  totalPrice: number;
  tossPaymentInfo: {
    clientKey: string;
    tossOrderId: string;
    orderName: string;
    amount: number;
    customerName: string;
    customerEmail: string;
  };
}

// ===== 에러 타입 =====
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
