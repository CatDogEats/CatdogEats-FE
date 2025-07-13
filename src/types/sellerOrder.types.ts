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

/**
 * 주문 상태별 라벨
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  READY_FOR_SHIPMENT: "배송준비완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "주문취소",
} as const;

/**
 * 택배사별 라벨
 */
export const COURIER_COMPANY_LABELS: Record<CourierCompany, string> = {
  CJ_DAEHAN: "CJ대한통운",
  HANJIN: "한진택배",
  LOTTE: "롯데택배",
  LOGEN: "로젠택배",
  POST_OFFICE: "우체국택배",
} as const;

// ===== API 응답 공통 타입 =====

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: string;
}

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
  delayReason?: string; // 출고 지연 사유 추가
}

/**
 * 배송 기본 정보 (목록용)
 */
export interface ShipmentBasicInfo {
  courier: string;
  trackingNumber: string;
  isShipped: boolean;
  shippedAt?: string;
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
  searchType?: string;
  searchKeyword?: string;
  filterStatus?: OrderStatus;
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
 * 수취인 정보
 */
export interface RecipientInfo {
  name: string;
  phone: string;
  address: string;
}

/**
 * 배송 정보 (상세용)
 */
export interface ShipmentInfo {
  courier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  isShipped: boolean;
}

/**
 * 판매자용 주문 상세 정보 응답
 * API: GET /v1/sellers/orders/{order-number}
 */
export interface SellerOrderDetailResponse {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  buyerName: string;
  orderItems: SellerOrderDetailItem[];
  orderSummary: OrderSummary;
  recipientInfo: RecipientInfo;
  shipmentInfo?: ShipmentInfo;
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
  expectedShipDate?: string;
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
  newStatus: OrderStatus;
  updatedAt: string;
  message: string;
}

/**
 * 운송장 번호 등록 응답
 */
export interface TrackingNumberRegisterResponse {
  orderNumber: string;
  courierCompany: CourierCompany;
  trackingNumber: string;
  registeredAt: string;
  message: string;
}

/**
 * 주문 삭제 응답
 */
export interface OrderDeleteResponse {
  orderNumber: string;
  deletedAt: string;
  message: string;
}

/**
 * 배송 상태 동기화 응답
 */
export interface ShipmentSyncResponse {
  totalCheckedOrders: number;
  updatedOrders: number;
  failedOrders: number;
  syncedAt: string;
  message: string;
  updatedOrderNumbers?: string[];
}

// ===== Frontend-prototype 복원용 추가 타입들 =====

/**
 * 주문 현황 요약 (대시보드용)
 */
export interface OrderSummaryStats {
  paymentCompleted: number;
  preparing: number;
  readyForDelivery: number;
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

// ===== API 에러 타입 =====

/**
 * API 에러 정보
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
