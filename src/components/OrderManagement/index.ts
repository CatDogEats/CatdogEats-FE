// src/components/OrderManagement/index.ts

// 메인 컴포넌트 exports
export { default as OrderShippingManagement } from './components/OrderShippingManagement';

// 하위 컴포넌트 exports (필요시 개별 사용)
export { default as OrderListTable } from './components/OrderListTable';
export { default as OrderSearchFilter } from './components/OrderSearchFilter';

// 기존 컴포넌트 유지 (호환성)
export { default as OrderShippingManagement as OrderManagementMain } from './components/OrderShippingManagement';

// 타입 exports (기존 유지)
export * from './types/order.types';