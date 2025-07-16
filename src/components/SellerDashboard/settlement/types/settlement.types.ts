// src/components/SellerDashboard/settlement/types/settlement.types.ts
export interface SettlementItem {
    id: string;
    productName: string;
    orderAmount: number;
    commission: number;
    settlementAmount: number;
    status: '처리중' | '정산완료'; 
    orderDate: string;
    deliveryDate: string; 
    settlementDate: string; 
    // 선택적 필드들
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

//  MonthlyChartData 타입과 SalesData 타입 통합
export interface SalesData {
    month: string;
    amount: number;
    originalAmount?: number; // 실제 금액 (툴팁용)
    orderCount?: number; // 주문수
    totalQuantity?: number; // 판매수량
}

// MonthlyChartData 타입을 SalesData로 통합 
export type MonthlyChartData = SalesData;

// 새로 된 타입들
export interface YearlyMonthData {
    year: number;
    monthlyData: SalesData[]; //  MonthlyChartData 대신 SalesData 사용
}

export interface ProductSalesData {
    productName: string;
    amount: number;
    percentage: number;
    color: string;
    totalSales?: number;
    salesCount: number;
    productId?: string; //  : 상품 ID
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
    selectedMonth?: number;
    viewMode?: 'monthly' | 'yearly';
    onYearChange?: (year: number) => void;
    onMonthChange?: (month: number) => void;
    onViewModeChange?: (mode: 'monthly' | 'yearly') => void;
    loading?: boolean; //  : 로딩 상태
    yearTotalAmount?: number; //  : 년도 총 매출
    yearTotalQuantity?: number; //  : 년도 총 판매수량
    availableYears?: number[]; //  : 사용 가능한 년도 목록
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