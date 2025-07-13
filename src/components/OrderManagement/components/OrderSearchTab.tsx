// src/components/OrderManagement/components/OrderSearchTab.tsx

import React from "react";
import { Box } from "@mui/material";
import OrderSearchFilter from "./OrderSearchFilter";
import OrderListTable from "./OrderListTable";
import type {
  OrderStatus,
  SellerOrderListResponse,
} from "@/types/sellerOrder.types";

interface OrderSearchTabProps {
  // 검색 관련
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  searchType: string;
  onSearchTypeChange: (type: string) => void;

  // 필터 관련
  statusFilter: OrderStatus | "ALL";
  onStatusFilterChange: (status: OrderStatus | "ALL") => void;

  // 액션 관련
  onSearch: () => void;
  onReset: () => void;
  onSync: () => void;

  // 데이터 관련
  data: SellerOrderListResponse | null;
  loading: boolean;
  syncLoading: boolean;

  // 테이블 액션
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetailView: (orderNumber: string) => void;
  onStatusChange: (orderNumber: string, currentStatus: OrderStatus) => void;
  onDeleteOrder: (orderNumber: string) => void;
}

/**
 * 주문 검색 탭 컴포넌트
 * 기존 OrderSearchFilter + OrderListTable 조합
 */
const OrderSearchTab: React.FC<OrderSearchTabProps> = ({
  searchKeyword,
  onSearchKeywordChange,
  searchType,
  onSearchTypeChange,
  statusFilter,
  onStatusFilterChange,
  onSearch,
  onReset,
  onSync,
  data,
  loading,
  syncLoading,
  onPageChange,
  onRowsPerPageChange,
  onDetailView,
  onStatusChange,
  onDeleteOrder,
}) => {
  return (
    <Box>
      {/* 검색 필터 */}
      <OrderSearchFilter
        searchKeyword={searchKeyword}
        onSearchKeywordChange={onSearchKeywordChange}
        searchType={searchType}
        onSearchTypeChange={onSearchTypeChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onSearch={onSearch}
        onReset={onReset}
        onSync={onSync}
        loading={loading}
        syncLoading={syncLoading}
      />

      {/* 주문 목록 테이블 */}
      <OrderListTable
        data={data}
        loading={loading}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onDetailView={onDetailView}
        onStatusChange={onStatusChange}
        onDeleteOrder={onDeleteOrder}
      />
    </Box>
  );
};

export default OrderSearchTab;
