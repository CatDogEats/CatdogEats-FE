// src/components/SellerDashboard/settlement/types/settlement.types.ts
export interface SettlementItem {
    id: string;
    productName: string;
    orderAmount: number;
    commission: number;
    settlementAmount: number;
    status: '처리중' | '정산완료'; // '대기중' 제거
    orderDate: string;
    deliveryDate: string; // null 가능성 제거, 항상 문자열로 처리
    settlementDate: string; // settlementCreatedAt을 settlementDate로 명명
    // 선택적 필드들 (기존 호환성 유지)
    paymentDate?: string;
    confirmDate?: string;
}

export interface SettlementFilters {
    paymentFilter: string;
    settlementFilter: string;
    periodFilter: string;
    startDate?: string;
    endDate?: string;
}

export interface SalesData {
    month: string;
    amount: number;
}

// 새로 추가된 타입들
export interface YearlyMonthData {
    year: number;
    monthlyData: { month: string; amount: number; }[];
}

export interface ProductSalesData {
    productName: string;
    amount: number;
    percentage: number;
    color: string;
    totalSales?: number;
    salesCount: number;
}

// Props 타입들
export interface SettlementTabProps {
    settlementData?: SettlementItem[];
    salesData?: SalesData[];
}

export interface SettlementTableProps {
    data: SettlementItem[];
    filters: SettlementFilters;
    onFiltersChange: (filters: Partial<SettlementFilters>) => void;
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    loading?: boolean;
}

export interface SalesChartProps {
    data: SalesData[];
    title?: string;
}

// 확장된 SalesChart Props
export interface EnhancedSalesChartProps extends SalesChartProps {
    yearlyData?: YearlyMonthData[];
    productData?: ProductSalesData[];
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

// 날짜 범위 피커 컴포넌트 Props
export interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onDateChange: (startDate: string, endDate: string) => void;
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}