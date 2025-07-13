// src/types/sellerOrder.types.ts

// ===== 기본 열거형들 =====

/**
 * 주문 상태 (백엔드와 동일)
 */
export type OrderStatus =
  | "PAYMENT_COMPLETED" // 결제완료
  | "PREPARING" // 상품준비중
  | "READY_FOR_SHIPMENT" // 배송준비완료
  | "IN_DELIVERY" // 배송중
  | "DELIVERED" // 배송완료
  | "CANCELLED" // 주문취소
  | "REFUNDED"; // 환불완료

/**
 * 택배사 (백엔드와 동일)
 */
export type CourierCompany =
  | "POST_OFFICE" // 우체국택배
  | "CJ_DAEHAN" // CJ대한통운
  | "HANJIN" // 한진택배
  | "LOGEN" // 로젠택배
  | "LOTTE"; // 롯데택배

// ===== API 응답 래퍼 타입 =====

/**
 * 백엔드 API 응답 래퍼 (실제 백엔드 구조)
 */
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===== 백엔드 응답 타입들 =====

/**
 * 판매자용 주문 목록 응답 (백엔드와 동일)
 * API: GET /v1/sellers/orders/list
 */
export interface SellerOrderListResponse {
  orders: SellerOrderItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 판매자용 주문 항목 (목록용)
 */
export interface SellerOrderItem {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string; // ISO string
  buyerName: string;
  totalAmount: number;
  orderItemCount: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  trackingNumber?: string;
  courierCompany?: CourierCompany;
  shippedAt?: string; // ISO string
  deliveredAt?: string; // ISO string
  isDelayed?: boolean;
  delayReason?: string;
  expectedShipDate?: string; // ISO string
}

/**
 * 판매자용 주문 상세 정보 응답
 * API: GET /v1/sellers/orders/{order-number}
 */
export interface SellerOrderDetailResponse {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string; // ISO string
  buyerName: string;
  orderItems: SellerOrderDetailItem[];
  orderSummary: OrderSummary;
  recipientInfo: RecipientInfo;
  shipmentInfo?: ShipmentInfo;
  isDelayed?: boolean;
  delayReason?: string;
  expectedShipDate?: string; // ISO string
}

/**
 * 주문 상품 상세 정보
 */
export interface SellerOrderDetailItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
}

/**
 * 주문 요약 정보
 */
export interface OrderSummary {
  totalProductAmount: number;
  totalShippingFee: number;
  totalDiscountAmount: number;
  finalPaymentAmount: number;
}

/**
 * 수령인 정보
 */
export interface RecipientInfo {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  addressDetail?: string;
  postalCode?: string;
  deliveryRequest?: string;
}

/**
 * 배송 정보
 */
export interface ShipmentInfo {
  courierCompany?: CourierCompany;
  trackingNumber?: string;
  shippedAt?: string; // ISO string
  deliveredAt?: string; // ISO string
  isShipped: boolean;
}

// ===== 요청 타입들 =====

/**
 * 주문 상태 변경 요청
 * API: POST /v1/sellers/orders/status
 */
export interface OrderStatusUpdateRequest {
  orderNumber: string;
  newStatus: OrderStatus;
  reason?: string;
  isDelayed?: boolean;
  expectedShipDate?: string; // ISO string
  // 운송장 정보 (배송중으로 변경시)
  courierCompany?: CourierCompany;
  trackingNumber?: string;
}

/**
 * 운송장 번호 등록 요청
 * API: POST /v1/sellers/orders/tracking-number
 */
export interface TrackingNumberRegisterRequest {
  orderNumber: string;
  courierCompany: CourierCompany;
  trackingNumber: string;
}

/**
 * 주문 삭제 요청
 * API: DELETE /v1/sellers/orders
 */
export interface OrderDeleteRequest {
  orderNumber: string;
}

// ===== 응답 타입들 =====

/**
 * 주문 상태 변경 응답
 */
export interface OrderStatusUpdateResponse {
  orderNumber: string;
  previousStatus: OrderStatus;
  currentStatus: OrderStatus; // 백엔드에서 실제로 사용하는 필드명
  updatedAt: string; // ISO string
  message: string;
}

/**
 * 운송장 번호 등록 응답
 */
export interface TrackingNumberRegisterResponse {
  orderNumber: string;
  courierCompany: CourierCompany;
  trackingNumber: string;
  registeredAt: string; // ISO string
  message: string;
}

/**
 * 주문 삭제 응답
 */
export interface OrderDeleteResponse {
  orderNumber: string;
  deletedAt: string; // ISO string
  message: string;
}

/**
 * 배송 상태 동기화 응답
 */
export interface ShipmentSyncResponse {
  totalCheckedOrders: number;
  updatedOrders: number;
  failedOrders: number;
  syncedAt: string; // ISO string
  message: string;
  updatedOrderNumbers?: string[];
}

// ===== 프로토타입 복원용 타입들 =====

/**
 * 주문 현황 요약 (대시보드용)
 */
export interface OrderSummaryStats {
  paymentCompleted: number;
  preparing: number;
  readyForShipment: number;
  inTransit: number;
  delivered: number;
}

/**
 * 긴급 작업 현황
 */
export interface UrgentTasks {
  delayRequests: number; // 출고 지연 요청
  longTermUndelivered: number; // 장기 미배송
}

/**
 * 기간별 필터 타입
 */
export type DateRange = "today" | "7days" | "30days" | "90days" | "custom";

/**
 * 검색 조건 타입
 */
export type SearchCondition = "orderNumber" | "buyerName" | "productName";

/**
 * 주문 필터 인터페이스
 */
export interface OrderFilter {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
  statusFilter: OrderStatus | "ALL";
  searchCondition: SearchCondition;
  searchKeyword: string;
}

// ===== 테이블 관련 타입들 =====

/**
 * 테이블 정렬 옵션
 */
export type SortOption =
  | "createdAt,desc"
  | "createdAt,asc"
  | "orderNumber,desc"
  | "orderNumber,asc"
  | "totalAmount,desc"
  | "totalAmount,asc";

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  page: number;
  size: number;
  sort: SortOption;
}

// ===== API 에러 타입 =====

/**
 * API 에러 정보
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// ===== 택배사 관련 유틸리티 =====

/**
 * 택배사 정보
 */
export interface CourierInfo {
  code: CourierCompany;
  name: string;
  trackingUrlTemplate?: string;
}

export const COURIER_INFO_MAP: Record<CourierCompany, CourierInfo> = {
  POST_OFFICE: { code: "POST_OFFICE", name: "우체국택배" },
  CJ_DAEHAN: { code: "CJ_DAEHAN", name: "CJ대한통운" },
  HANJIN: { code: "HANJIN", name: "한진택배" },
  LOGEN: { code: "LOGEN", name: "로젠택배" },
  LOTTE: { code: "LOTTE", name: "롯데택배" },
};

/**
 * 주문 상태 정보
 */
export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  color: "primary" | "warning" | "info" | "secondary" | "success" | "error";
  description: string;
}

export const ORDER_STATUS_INFO_MAP: Record<OrderStatus, OrderStatusInfo> = {
  PAYMENT_COMPLETED: {
    status: "PAYMENT_COMPLETED",
    label: "결제완료",
    color: "primary",
    description: "결제가 완료되어 상품 준비를 시작할 수 있습니다.",
  },
  PREPARING: {
    status: "PREPARING",
    label: "상품준비중",
    color: "warning",
    description: "상품을 준비하고 있습니다.",
  },
  READY_FOR_SHIPMENT: {
    status: "READY_FOR_SHIPMENT",
    label: "배송준비완료",
    color: "info",
    description: "배송 준비가 완료되었습니다.",
  },
  IN_DELIVERY: {
    status: "IN_DELIVERY",
    label: "배송중",
    color: "secondary",
    description: "상품이 배송 중입니다.",
  },
  DELIVERED: {
    status: "DELIVERED",
    label: "배송완료",
    color: "success",
    description: "배송이 완료되었습니다.",
  },
  CANCELLED: {
    status: "CANCELLED",
    label: "주문취소",
    color: "error",
    description: "주문이 취소되었습니다.",
  },
  REFUNDED: {
    status: "REFUNDED",
    label: "환불완료",
    color: "error",
    description: "환불이 완료되었습니다.",
  },
};

// ===== Hook 관련 타입들 =====

/**
 * useSellerOrderManagement 훅 반환 타입
 */
export interface UseSellerOrderManagementReturn {
  orders: SellerOrderListResponse | null;
  orderStats: { orderSummary: OrderSummaryStats; urgentTasks: UrgentTasks };
  ordersLoading: boolean;
  actionLoading: boolean;
  ordersError: string | null;
  actionError: string | null;
  pagination: PaginationInfo;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (
    request: OrderStatusUpdateRequest
  ) => Promise<OrderStatusUpdateResponse>;
  registerTrackingNumber: (
    request: TrackingNumberRegisterRequest
  ) => Promise<TrackingNumberRegisterResponse>;
  deleteOrder: (request: OrderDeleteRequest) => Promise<void>;
  syncShipmentStatus: () => Promise<ShipmentSyncResponse>;
  searchOrders: (searchParams: {
    searchType?: string;
    searchKeyword?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
}

/**
 * useSellerOrderDetail 훅 반환 타입
 */
export interface UseSellerOrderDetailReturn {
  orderDetail: SellerOrderDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useOrderModals 훅 반환 타입
 */
export interface UseOrderModalsReturn {
  modals: {
    detail: {
      open: boolean;
      orderNumber: string | null;
    };
    statusUpdate: {
      open: boolean;
      orderNumber: string | null;
      currentStatus: OrderStatus | null;
    };
  };
  openDetailModal: (orderNumber: string) => void;
  openStatusUpdateModal: (
    orderNumber: string,
    currentStatus: OrderStatus
  ) => void;
  closeDetailModal: () => void;
  closeStatusUpdateModal: () => void;
}

/**
 * useOrderFilter 훅 반환 타입
 */
export interface UseOrderFilterReturn {
  filters: {
    searchKeyword: string;
    searchType: string;
    statusFilter: OrderStatus | "ALL";
    dateRange: string;
    startDate: string;
    endDate: string;
  };
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}
