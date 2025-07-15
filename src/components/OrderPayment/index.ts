// src/components/OrderPayment/index.ts

// ==================== 메인 컴포넌트 ====================
export { default as OrderPaymentManagement } from "./components/OrderPaymentManagement";

// ==================== 하위 컴포넌트들 ====================
export { default as OrderSummary } from "./components/OrderSummary";
export { default as PetInformationForm } from "./components/PetInformationForm";
export { default as ShippingInformationForm } from "./components/ShippingInformationForm";
export { default as PaymentMethodSelection } from "./components/PaymentMethodSelection";
export { default as OrderTotal } from "./components/OrderTotal";
export { default as PetModal } from "./components/PetModal";
export { default as AddressModal } from "./components/AddressModal";
export { default as AddressSearchDialog } from "./components/AddressSearchDialog";
export { default as AddressSearchField } from "./components/AddressSearchField";

// ==================== 타입 exports ====================
export type {
  // 기본 인터페이스들
  OrderItem,
  PetInfo,
  SavedPet,
  ShippingInfo,
  SavedAddress,
  Coupon,

  // 컴포넌트 Props 인터페이스들
  OrderSummaryProps,
  PetInformationFormProps,
  ShippingInformationFormProps,
  PaymentMethodSelectionProps,
  OrderTotalProps,
  PetModalProps,
  AddressModalProps,

  // API 관련 타입들
  OrderCreateRequest,
  OrderCreateResponse,
} from "./types/orderPayment.types";

// ==================== API Service exports ====================
export { buyerApi, handleApiError } from "@/service/api/buyerApi";

// ==================== Hook exports ====================
export { useBuyerOrderData } from "@/hooks/useBuyerData";

// ==================== API 타입 exports ====================
export type {
  APIResponse,
  PetResponse,
  AddressResponse,
  DefaultAddressResponse,
  CouponResponse,
  ApiError,
} from "@/types/buyerApi.types";
