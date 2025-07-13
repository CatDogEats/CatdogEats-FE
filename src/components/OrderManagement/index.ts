// src/components/OrderManagement/index.ts

// ==================== 메인 컴포넌트 ====================
export { default as OrderShippingManagement } from "./components/OrderShippingManagement";

// ==================== 대시보드 컴포넌트 ====================
export { default as OrderStatusDashboard } from "./components/OrderStatusDashboard";

// ==================== 탭 컴포넌트 ====================
export { default as OrderSearchTab } from "./components/OrderSearchTab";

// ==================== 테이블 및 목록 컴포넌트 ====================
export { default as OrderListTable } from "./components/OrderListTable";

// ==================== 모달 컴포넌트 ====================
export { default as OrderDetailModal } from "./components/OrderDetailModal";
export { default as OrderStatusUpdateModal } from "./components/OrderStatusUpdateModal";

// ==================== Hook exports ====================
export {
  useSellerOrderManagement,
  useSellerOrderDetail,
  useOrderModals,
  useOrderFilter,
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

  // UI 관련 타입들
  OrderSummaryStats,
  UrgentTasks,
  OrderFilter,
  DateRange,
  SearchCondition,
  SortOption,
  PaginationInfo,

  // Hook 타입들 (hooks 파일에서 정의됨)
  // UseSellerOrderManagementReturn,
  // UseSellerOrderDetailReturn,
  // UseOrderModalsReturn,
  // UseOrderFilterReturn,

  // 에러 타입
  ApiError,

  // 유틸리티 타입들
  CourierInfo,
  OrderStatusInfo,
} from "@/types/sellerOrder.types";

// ==================== 상수 exports ====================
export {
  COURIER_INFO_MAP,
  ORDER_STATUS_INFO_MAP,
} from "@/types/sellerOrder.types";
