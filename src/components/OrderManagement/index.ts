// src/components/OrderManagement/index.ts

// ==================== 메인 컴포넌트 ====================
export { default as OrderShippingManagement } from "./components/OrderShippingManagement";

// ==================== 대시보드 컴포넌트 ====================
export { default as OrderStatusDashboard } from "./components/OrderStatusDashboard";

// ==================== 탭 컴포넌트 (검색 탭만 별도 컴포넌트) ====================
export { default as OrderSearchTab } from "./components/OrderSearchTab";

// ==================== 하위 컴포넌트 (필요시 개별 사용) ====================
export { default as OrderListTable } from "./components/OrderListTable";
export { default as OrderSearchFilter } from "./components/OrderSearchFilter";
export { default as OrderDetailModal } from "./components/OrderDetailModal";
export { default as OrderStatusUpdateModal } from "./components/OrderStatusUpdateModal";

// ==================== 타입 exports ====================
export * from "./types/order.types";
