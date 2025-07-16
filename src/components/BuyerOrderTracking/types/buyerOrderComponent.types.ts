// src/components/BuyerOrderTracking/types/buyerOrderComponent.types.ts

// ===== 컴포넌트 Props 인터페이스들 =====

/**
 * OrdersViewEnhanced 컴포넌트 Props
 */
export interface OrdersViewEnhancedProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  handleOrderAction: (action: string, order: any) => void;
}

/**
 * ShippingDetailViewEnhanced 컴포넌트 Props
 */
export interface ShippingDetailViewEnhancedProps {
  setDetailView: (view: string | null) => void;
  orderNumber?: string; // selectedOrder에서 전달받을 주문번호
}

/**
 * OrderDetailEnhanced 컴포넌트 Props
 */
export interface OrderDetailEnhancedProps {
  selectedOrder: any; // 기존 프로토타입 Order 객체
  setDetailView: (view: string | null) => void;
  handleOrderAction: (action: string, order: any) => void;
}

// ===== 공통 UI 상태 타입들 =====

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * 에러 메시지 상태 타입
 */
export interface ErrorMessageState {
  errorMessage: string | null;
  showError: boolean;
}

/**
 * 페이지네이션 UI 상태 타입
 */
export interface PaginationUIState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// ===== 액션 타입들 =====

/**
 * 주문 액션 타입
 */
export type OrderAction =
  | "view_detail"
  | "view_shipping"
  | "write_review"
  | "request_return"
  | "delete"
  | "refresh";

/**
 * 주문 액션 핸들러 타입
 */
export type OrderActionHandler = (
  action: OrderAction,
  order: any
) => void | Promise<void>;

// ===== 프로토타입 호환성 타입들 =====

/**
 * 기존 OrdersView Props (호환성 유지)
 */
export interface LegacyOrdersViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  mockOrders: any[]; // 기존 mockOrders
  handleOrderAction: (action: string, order: any) => void;
}

/**
 * 기존 ShippingDetailView Props (호환성 유지)
 */
export interface LegacyShippingDetailViewProps {
  setDetailView: (view: string | null) => void;
}

/**
 * 기존 OrderDetail Props (호환성 유지)
 */
export interface LegacyOrderDetailProps {
  selectedOrder: any;
  setDetailView: (view: string | null) => void;
  handleOrderAction: (action: string, order: any) => void;
}

// ===== 필터 및 검색 관련 타입들 =====

/**
 * 주문 검색 필터 타입
 */
export interface OrderSearchFilter {
  searchKeyword: string;
  statusFilter: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 기간 필터 옵션 타입
 */
export type PeriodOption = "최근 6개월" | "2025년" | "2024년" | "전체";

/**
 * 검색 상태 타입
 */
export interface SearchState {
  searchQuery: string;
  selectedPeriod: PeriodOption;
  isSearching: boolean;
}

// ===== 스낵바 및 알림 관련 타입들 =====

/**
 * 스낵바 설정 타입
 */
export interface SnackbarConfig {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

/**
 * 알림 메시지 타입
 */
export interface AlertMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: number;
}

// ===== 테이블 관련 타입들 =====

/**
 * 테이블 컬럼 정의 타입
 */
export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  sortable?: boolean;
}

/**
 * 테이블 행 데이터 타입
 */
export interface TableRowData {
  id: string;
  [key: string]: any;
}

// ===== 모달 및 다이얼로그 관련 타입들 =====

/**
 * 확인 다이얼로그 상태 타입
 */
export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: "default" | "warning" | "error";
}

// ===== 유틸리티 타입들 =====

/**
 * 컴포넌트 Ref 타입
 */
export interface ComponentRef {
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * 이벤트 핸들러 타입
 */
export interface EventHandlers {
  onRefresh?: () => void | Promise<void>;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

// ===== 상수들 =====

/**
 * 페이지 크기 옵션
 */
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/**
 * 기본 페이지 설정
 */
export const DEFAULT_PAGE_CONFIG = {
  PAGE: 0,
  SIZE: 20,
  ITEMS_PER_PAGE: 5,
} as const;

/**
 * 스낵바 기본 설정
 */
export const DEFAULT_SNACKBAR_CONFIG = {
  AUTO_HIDE_DURATION: 6000,
  ANCHOR_ORIGIN: {
    vertical: "top" as const,
    horizontal: "center" as const,
  },
} as const;
