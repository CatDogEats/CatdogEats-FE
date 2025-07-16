// src/components/OrderManagement/index.ts

// ==================== 메인 컴포넌트 ====================
export { default as OrderShippingManagement } from "./components/OrderShippingManagement";

// ==================== Hook exports ====================
export {
  useSellerOrderManagement,
  useSellerOrderDetail,
} from "@/hooks/useSellerOrders";

// ==================== API Service exports ====================
export {
  sellerOrderApi,
  handleApiError,
  isAPIResponseSuccess,
  validateAPIResponse,
} from "@/service/api/sellerOrderApi";

// ==================== 타입 exports ====================
export type {
  // 기본 타입들
  OrderStatus,
  CourierCompany,
  APIResponse,

  // 응답 타입들
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  SellerOrderItem,
  SellerOrderDetailItem,
  OrderSummary,
  RecipientInfo,
  ShipmentInfo,

  // 요청 타입들
  OrderStatusUpdateRequest,
  TrackingNumberRegisterRequest,
  OrderDeleteRequest,

  // 응답 타입들
  OrderStatusUpdateResponse,
  TrackingNumberRegisterResponse,
  OrderDeleteResponse,
  ShipmentSyncResponse,

  // 에러 타입
  ApiError,
} from "@/types/sellerOrder.types";

// ==================== 상수 exports ====================
export {
  COURIER_INFO_MAP,
  ORDER_STATUS_INFO_MAP,
} from "@/types/sellerOrder.types";
