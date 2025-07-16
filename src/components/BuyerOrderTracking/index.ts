// src/components/BuyerOrderTracking/index.ts

// ==================== 메인 컴포넌트들 ====================
export { default as OrdersViewEnhanced } from "./components/OrdersViewEnhanced";
export { default as ShippingDetailViewEnhanced } from "./components/ShippingDetailViewEnhanced";
export { default as OrderDetailEnhanced } from "./components/OrderDetailEnhanced";

// ==================== 타입 exports ====================

import type {
  OrderStatus,
  CourierCompany,
  APIResponse,
  BuyerOrderListResponse,
  BuyerOrderSummary,
  BuyerOrderItem,
  OrderSummaryInfo,
  ShipmentBasicInfo,
  BuyerOrderDetailResponse,
  BuyerOrderDetailItem,
  RecipientInfo,
  PaymentInfo,
  BuyerShipmentDetailResponse,
  TrackingDetail,
  BuyerOrderDeleteRequest,
  BuyerOrderDeleteResponse,
  PaginationInfo,
  OrderStatusInfo,
  Order,
  ApiError,
} from "../../types/buyerOrder.types";

import {
  ORDER_STATUS_INFO_MAP,
  convertAPIDataToPrototype,
} from "../../types/buyerOrder.types";

// 그 다음 export
export type {
  OrderStatus,
  CourierCompany,
  APIResponse,
  BuyerOrderListResponse,
  BuyerOrderSummary,
  BuyerOrderItem,
  OrderSummaryInfo,
  ShipmentBasicInfo,
  BuyerOrderDetailResponse,
  BuyerOrderDetailItem,
  RecipientInfo,
  PaymentInfo,
  BuyerShipmentDetailResponse,
  TrackingDetail,
  BuyerOrderDeleteRequest,
  BuyerOrderDeleteResponse,
  PaginationInfo,
  OrderStatusInfo,
  Order,
  ApiError,
};

export { ORDER_STATUS_INFO_MAP, convertAPIDataToPrototype };

// 컴포넌트 전용 타입들
export type {
  // 컴포넌트 Props
  OrdersViewEnhancedProps,
  ShippingDetailViewEnhancedProps,
  OrderDetailEnhancedProps,

  // 레거시 호환성
  LegacyOrdersViewProps,
  LegacyShippingDetailViewProps,
  LegacyOrderDetailProps,

  // UI 상태 타입들
  LoadingState,
  ErrorMessageState,
  PaginationUIState,
  SearchState,
  SnackbarConfig,
  AlertMessage,
  ConfirmDialogState,

  // 액션 타입들
  OrderAction,
  OrderActionHandler,

  // 필터 및 검색
  OrderSearchFilter,
  PeriodOption,

  // 테이블 관련
  TableColumn,
  TableRowData,

  // 유틸리티 타입들
  ComponentRef,
  EventHandlers,
  PageSizeOption,
} from "./types/buyerOrderComponent.types";

// ==================== API Service exports ====================
export {
  buyerOrderApi,
  handleApiError,
  ORDER_DELETE_ERROR_MESSAGES,
  canDeleteOrder,
  getOrderDeleteErrorMessage,
} from "../../service/api/buyerOrderApi";

/**
 * 프로토타입 UI와 Enhanced 컴포넌트 간 전환을 위한 래퍼 함수들
 */

/**
 * 기존 OrdersView를 Enhanced 버전으로 래핑
 */
export const createEnhancedOrdersView = (legacyProps: any) => {
  // mockOrders를 제거하고 나머지 props 전달
  const { mockOrders, ...enhancedProps } = legacyProps;
  return enhancedProps;
};

/**
 * 기존 ShippingDetailView를 Enhanced 버전으로 래핑
 */
export const createEnhancedShippingDetailView = (
  legacyProps: any,
  selectedOrder?: any
) => {
  return {
    ...legacyProps,
    orderNumber: selectedOrder?.orderNumber,
  };
};

/**
 * 기존 OrderDetail을 Enhanced 버전으로 래핑
 */
export const createEnhancedOrderDetail = (legacyProps: any) => {
  // 기존 props 그대로 사용
  return legacyProps;
};

// ==================== 마이그레이션 헬퍼들 ====================

/**
 * 기존 mockOrders를 API 응답 형태로 변환하는 헬퍼
 * (테스트 및 마이그레이션 과정에서 사용)
 */
export const convertMockOrdersToAPIResponse = (
  mockOrders: any[]
): BuyerOrderListResponse => {
  const orders: BuyerOrderSummary[] = mockOrders.map((mockOrder, index) => ({
    orderNumber:
      mockOrder.orderNumber || `ORD${String(index + 1).padStart(6, "0")}`,
    orderStatus:
      mockOrder.shippingStatus === "delivered"
        ? "DELIVERED"
        : "PAYMENT_COMPLETED",
    orderDate:
      mockOrder.date || mockOrder.orderDate || new Date().toISOString(),
    orderItems:
      mockOrder.products?.map((product: any, idx: number) => ({
        orderItemId: `item_${index}_${idx}`,
        productId: `prod_${index}_${idx}`,
        productName: product.name,
        productImage: undefined,
        quantity: product.quantity || 1,
        unitPrice: product.price || 0,
        totalPrice: (product.price || 0) * (product.quantity || 1),
      })) || [],
    orderSummary: {
      itemCount: mockOrder.quantity || 1,
      totalAmount: mockOrder.amount || mockOrder.total || 0,
    },
    shipmentInfo: {
      courier: mockOrder.shippingCompany,
      trackingNumber: mockOrder.trackingNumber,
      isShipped: !!mockOrder.trackingNumber,
      shippedAt: mockOrder.shippedAt,
    },
  }));

  return {
    orders,
    totalElements: orders.length,
    totalPages: Math.ceil(orders.length / 20),
    currentPage: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  };
};

/**
 * 에러 메시지 표준화 헬퍼
 */
export const standardizeErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return "알 수 없는 오류가 발생했습니다.";
};

/**
 * 주문 상태 라벨 변환 헬퍼
 */
export const getOrderStatusLabel = (status: string): string => {
  const statusInfo = ORDER_STATUS_INFO_MAP[status as OrderStatus];
  return statusInfo?.label || status;
};

/**
 * 날짜 포맷팅 헬퍼
 */
export const formatOrderDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

/**
 * 가격 포맷팅 헬퍼
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()} 원`;
};

// ==================== 디버그 및 개발 헬퍼들 ====================

/**
 * 개발 환경에서 API 응답 로깅
 */
export const logApiResponse = (endpoint: string, response: any) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🔍 API Response: ${endpoint}`);
    console.log("Response:", response);
    console.groupEnd();
  }
};

/**
 * 개발 환경에서 컴포넌트 props 로깅
 */
export const logComponentProps = (componentName: string, props: any) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`⚙️ Component Props: ${componentName}`);
    console.log("Props:", props);
    console.groupEnd();
  }
};

// ==================== 상수 exports ====================
export {
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_CONFIG,
  DEFAULT_SNACKBAR_CONFIG,
} from "./types/buyerOrderComponent.types";
