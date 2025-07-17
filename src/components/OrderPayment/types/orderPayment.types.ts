// src/components/OrderPayment/types/orderPayment.types.ts

// ===== 기본 인터페이스들 =====

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface PetInfo {
  name: string;
  category: string;
  breed: string;
  age: string;
  gender: string;
  hasAllergies: boolean;
  healthCondition: string;
  specialRequests: string;
}

export interface SavedPet extends PetInfo {
  id: string;
  avatar?: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
}

export interface SavedAddress extends ShippingInfo {
  id: string;
  label: string;
}

export interface Coupon {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount: number;
  description: string;
}

// ===== 컴포넌트 Props 인터페이스들 =====

export interface OrderSummaryProps {
  orderItems: OrderItem[];
}

export interface PetInformationFormProps {
  petInfo: PetInfo;
  onPetInfoChange: (field: keyof PetInfo, value: string | boolean) => void;
  onOpenPetModal: () => void;
}

export interface ShippingInformationFormProps {
  shippingInfo: ShippingInfo;
  onShippingInfoChange: (field: keyof ShippingInfo, value: string) => void;
  onOpenAddressModal: () => void;
  addressModalLoading?: boolean; // ✅ 추가: 주소 모달 로딩 상태
}

export interface PaymentMethodSelectionProps {
  availableCoupons: Coupon[];
  selectedCoupon: string;
  onCouponSelect: (couponId: string) => void;
  isCouponApplicable: (coupon: Coupon) => boolean;
  discountAmount: number;
}

export interface OrderTotalProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface PetModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPet: (pet: SavedPet) => void;
  savedPets: SavedPet[];
}

export interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: SavedAddress) => void;
  savedAddresses: SavedAddress[];
}

// ===== API 관련 타입들 =====

export interface OrderCreateRequest {
  orderItems: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentInfo: {
    orderName: string;
    sellerCoupons: string[];
    // ✅ 추가: 백엔드 PaymentInfoRequest와 일치하는 필드들
    customerName?: string;
    customerEmail?: string;
    successUrl?: string;
    failUrl?: string;
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
