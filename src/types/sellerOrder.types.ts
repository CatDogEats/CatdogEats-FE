// src/types/sellerOrder.types.ts

/**
 * 주문 상태 enum (백엔드와 동일)
 */
export type OrderStatus =
  | "PAYMENT_COMPLETED" // 결제완료
  | "PREPARING" // 상품준비중
  | "READY_FOR_SHIPMENT" // 배송준비완료
  | "IN_DELIVERY" // 배송중
  | "DELIVERED" // 배송완료
  | "CANCELLED"; // 주문취소

/**
 * 택배사 enum (백엔드와 동일)
 */
export type CourierCompany =
  | "CJ_DAEHAN" // CJ대한통운
  | "HANJIN" // 한진택배
  | "LOTTE" // 롯데택배
  | "LOGEN" // 로젠택배
  | "POST_OFFICE"; // 우체국택배

// ===== 판매자용 주문 목록 관련 타입 =====

/**
 * 판매자용 주문 상품 정보 (목록용)
 */
export interface SellerOrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * 주문 요약 정보 (목록용)
 */
export interface OrderSummaryInfo {
  itemCount: number;
  totalAmount: number;
}

/**
 * 배송 기본 정보 (목록용)
 */
export interface ShipmentBasicInfo {
  courier: string;
  trackingNumber: string;
  isShipped: boolean;
  shippedAt: string;
}

/**
 * 판매자용 주문 요약 정보 (목록의 각 행)
 */
export interface SellerOrderSummary {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  buyerName: string;
  maskedBuyerName: string;
  orderItems: SellerOrderItem[];
  orderSummary: OrderSummaryInfo;
  shipmentInfo: ShipmentBasicInfo;
}

/**
 * 판매자용 주문 목록 응답
 * API: GET /v1/sellers/orders/list
 */
export interface SellerOrderListResponse {
  orders: SellerOrderSummary[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchType: string;
  searchKeyword: string;
  filterStatus: OrderStatus;
}

// ===== 판매자용 주문 상세 관련 타입 =====

/**
 * 판매자용 주문 상품 상세 정보
 */
export interface SellerOrderDetailItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendorName: string;
}

/**
 * 주문 요약 정보 (상세용)
 */
export interface OrderSummary {
  itemCount: number;
  totalProductPrice: number;
  deliveryFee: number;
  totalAmount: number;
}

/**
 * 배송 정보 (상세용)
 */
export interface ShipmentInfo {
  courier: string;
  trackingNumber: string;
  shippedAt: string;
  deliveredAt: string;
  isShipped: boolean;
  shipmentMemo: string;
}

/**
 * 배송지 정보
 */
export interface ShippingAddress {
  recipientName: string;
  recipientPhone: string;
  maskedPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  fullAddress: string;
  deliveryRequest: string;
}

/**
 * 상태 관리 정보
 */
export interface StatusManagement {
  canChangeStatus: boolean;
  availableStatuses: OrderStatus[];
  canRegisterTracking: boolean;
  statusDescription: string;
}

/**
 * 판매자용 주문 상세 응답
 * API: GET /v1/sellers/orders/{order-number}
 */
export interface SellerOrderDetailResponse {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  shippingAddress: ShippingAddress;
  orderItems: SellerOrderDetailItem[];
  orderSummary: OrderSummary;
  shipmentInfo: ShipmentInfo;
  statusManagement: StatusManagement;
}

// ===== 요청 DTO 타입들 =====

/**
 * 주문 상태 변경 요청
 * API: POST /v1/sellers/orders/status
 */
export interface OrderStatusUpdateRequest {
  orderNumber: string;
  newStatus: OrderStatus;
  reason?: string;
  isDelayed?: boolean;
  expectedShipDate?: string;
}

/**
 * 운송장 번호 등록 요청
 * API: POST /v1/sellers/orders/tracking-number
 */
export interface TrackingNumberRegisterRequest {
  orderNumber: string;
  courierCompany: CourierCompany;
  trackingNumber: string;
  shipmentMemo?: string;
  startShipmentImmediately?: boolean;
}

/**
 * 주문 삭제 요청
 * API: DELETE /v1/sellers/orders
 */
export interface OrderDeleteRequest {
  orderNumbers: string[];
}

// ===== 응답 DTO 타입들 =====

/**
 * 주문 상태 변경 응답
 */
export interface OrderStatusUpdateResponse {
  orderNumber: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: string;
  message: string;
}

/**
 * 운송장 등록 응답
 */
export interface TrackingNumberRegisterResponse {
  orderNumber: string;
  courierCompany: CourierCompany;
  trackingNumber: string;
  shippedAt: string;
  message: string;
}

/**
 * 주문 삭제 응답
 */
export interface OrderDeleteResponse {
  deletedOrderNumbers: string[];
  successCount: number;
  message: string;
}

/**
 * 업데이트된 주문 정보 (동기화용)
 */
export interface UpdatedOrderInfo {
  orderNumber: string;
  trackingNumber: string;
  courier: string;
  deliveredAt: string;
}

/**
 * 실패한 주문 정보 (동기화용)
 */
export interface FailedOrderInfo {
  orderNumber: string;
  trackingNumber: string;
  courier: string;
  errorReason: string;
}

/**
 * 배송 상태 동기화 응답
 * API: POST /v1/sellers/orders/sync-shipment-status
 */
export interface ShipmentSyncResponse {
  totalCheckedOrders: number;
  updatedOrders: number;
  failedOrders: number;
  updatedOrderList: UpdatedOrderInfo[];
  failedOrderList: FailedOrderInfo[];
  syncedAt: string;
  message: string;
}

/**
 * 전역 API 응답 포맷
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  errors: any[];
}

// ===== 상수 정의 =====

/**
 * 주문 상태 라벨
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  READY_FOR_SHIPMENT: "배송준비완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "주문취소",
};

/**
 * 택배사 라벨
 */
export const COURIER_COMPANY_LABELS: Record<CourierCompany, string> = {
  CJ_DAEHAN: "CJ대한통운",
  HANJIN: "한진택배",
  LOTTE: "롯데택배",
  LOGEN: "로젠택배",
  POST_OFFICE: "우체국택배",
};

/**
 * 상태별 변경 가능한 다음 상태들
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PAYMENT_COMPLETED: ["PREPARING"],
  PREPARING: ["READY_FOR_SHIPMENT", "CANCELLED"],
  READY_FOR_SHIPMENT: ["IN_DELIVERY"],
  IN_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
