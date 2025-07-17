// src/types/buyerOrder.types.ts

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

// ===== 구매자 주문 응답 타입들 =====

/**
 * 구매자 주문 목록 응답
 * API: GET /v1/buyers/orders/list?page={}&size={}
 */
export interface BuyerOrderListResponse {
  orders: BuyerOrderSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 구매자 주문 요약 정보 (목록용)
 */
export interface BuyerOrderSummary {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  orderItemsInfo: string;
  totalAmount: number;
  courier?: string; // [수정] shipmentInfo 객체 제거, 최상위로 이동
  trackingNumber?: string; // [수정] shipmentInfo 객체 제거, 최상위로 이동
}

/**
 * 구매자 주문 상품 정보 (목록용)
 */
export interface BuyerOrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * 주문 요약 정보
 */
export interface OrderSummaryInfo {
  itemCount: number;
  totalAmount: number;
}

/**
 * 배송 기본 정보 (목록용)
 */
export interface ShipmentBasicInfo {
  courier?: string;
  trackingNumber?: string;
  isShipped: boolean;
  shippedAt?: string; // ISO string
}

/**
 * 구매자 주문 상세 정보 응답
 * API: GET /v1/buyers/orders/{order-number}
 */
export interface BuyerOrderDetailResponse {
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string; // ISO string
  recipientInfo: RecipientInfo;
  paymentInfo: PaymentInfo;
  orderItems: BuyerOrderDetailItem[];
}

/**
 * 구매자 주문 상품 상세 정보
 */
export interface BuyerOrderDetailItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * 수령인 정보
 */
export interface RecipientInfo {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  deliveryNote: string;
}

/**
 * 결제 정보
 */
export interface PaymentInfo {
  totalProductPrice: number;
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
}

/**
 * 구매자 배송 상세 정보 응답 (물류 서버 연동)
 * API: GET /v1/buyers/shipments/{order-number}
 */
export interface BuyerShipmentDetailResponse {
  orderNumber: string;
  deliveryStatus: string;
  courier: string;
  trackingNumber: string;
  shippedAt?: string; // ISO string
  deliveredAt?: string; // ISO string
  recipientInfo: RecipientInfo;
  trackingDetails: TrackingDetail[];
}

/**
 * 배송 추적 상세 정보
 */
export interface TrackingDetail {
  timestamp: string; // ISO string
  location: string;
  status: string;
  description: string;
}

// ===== 요청 타입들 =====

/**
 * 주문 삭제 요청
 * API: DELETE /v1/buyers/orders
 */
export interface BuyerOrderDeleteRequest {
  orderNumber: string;
}

/**
 * 주문 삭제 응답
 */
export interface BuyerOrderDeleteResponse {
  orderNumber: string;
  deletedAt: string; // ISO string
  message: string;
}

// ===== 페이지네이션 관련 타입들 =====

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  page: number;
  size: number;
}

// ===== 상태 매핑 및 UI 관련 타입들 =====

/**
 * 주문 상태 표시 정보
 */
export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  description: string;
}

/**
 * 프로토타입 Order 타입 (기존 UI 호환성 유지)
 */
export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  productName: string;
  quantity: number;
  amount: number;
  shippingStatus: string;
  customerPhone?: string;
  shippingAddress: string;
  trackingNumber?: string;
  shippingCompany?: string;
  total: number; // OrderDetail에서 사용
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>; // OrdersView에서 사용
  date: string; // OrdersView 필터링에서 사용

  // 추가된 옵셔널 속성들
  deliveredAt?: string; // 배송완료 일자 (ISO string)
  arrivalDate?: string; // 도착일 (UI 표시용)
  orderItemsInfo?: string; // 주문 상품 정보 ("상품명 외 N건" 형태)
  totalAmount?: number; // 총 결제 금액 (API 호환성)
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

// ===== 주문 상태 정보 매핑 =====

/**
 * 주문 상태별 표시 정보 매핑
 */
export const ORDER_STATUS_INFO_MAP: Record<OrderStatus, OrderStatusInfo> = {
  PAYMENT_COMPLETED: {
    status: "PAYMENT_COMPLETED",
    label: "결제완료",
    color: "info",
    description: "결제가 완료되었습니다.",
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
    color: "primary",
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

// ===== 데이터 변환 헬퍼 함수들 =====

/**
 * API 데이터를 프로토타입 Order 형태로 변환
 */
export const convertAPIDataToPrototype = (
  apiResponse: BuyerOrderListResponse
): Order[] => {
  if (!apiResponse?.orders) return [];

  return apiResponse.orders.map((orderSummary: BuyerOrderSummary) => {
    let itemCount = 1;
    if (orderSummary.orderItemsInfo.includes(" 외 ")) {
      try {
        const parts = orderSummary.orderItemsInfo.split(" 외 ");
        const numberPart = parts[1].split("건")[0];
        const extraCount = parseInt(numberPart.trim(), 10);
        if (!isNaN(extraCount)) {
          itemCount += extraCount;
        }
      } catch {}
    }

    return {
      id: orderSummary.orderNumber,
      orderNumber: orderSummary.orderNumber,
      orderDate: orderSummary.orderDate.split("T")[0],
      date: orderSummary.orderDate,
      customerName: "",
      productName: orderSummary.orderItemsInfo,
      orderItemsInfo: orderSummary.orderItemsInfo,
      quantity: itemCount,
      amount: orderSummary.totalAmount,
      total: orderSummary.totalAmount,
      totalAmount: orderSummary.totalAmount,
      shippingStatus: mapAPIStatusToPrototype(orderSummary.orderStatus),
      deliveredAt: undefined,
      arrivalDate: undefined,
      trackingNumber: orderSummary.trackingNumber,
      shippingCompany: orderSummary.courier,
      products: [],
      shippingAddress: "",
      customerPhone: undefined,
    };
  });
};

/**
 * API 상태를 프로토타입 상태로 변환
 */
const mapAPIStatusToPrototype = (apiStatus: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    PAYMENT_COMPLETED: "payment_completed",
    PREPARING: "preparing",
    READY_FOR_SHIPMENT: "ready_for_delivery",
    IN_DELIVERY: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "order_cancelled",
    REFUNDED: "order_cancelled",
  };
  return statusMap[apiStatus] || "payment_completed";
};
