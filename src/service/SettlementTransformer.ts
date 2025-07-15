// src/service/SettlementTransformer.ts
import {
    mapBackendStatusToFrontend,
    MonthlySettlementStatusResponse,
    SettlementItemResponse,
    SettlementListResponse
} from '@/service/SettlementAPI';
import {SettlementItem} from '@/components/SellerDashboard/settlement/types/settlement.types';

/**
 * ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환 (시간대 문제 해결)
 */
export const formatDateToString = (isoString: string): string => {
    if (!isoString) return '';

    try {
        // ISO 문자열을 Date 객체로 변환
        const date = new Date(isoString);

        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', isoString);
            return '';
        }

        // 로컬 시간대 기준으로 YYYY-MM-DD 형식 반환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Date formatting error:', error, 'Input:', isoString);
        return '';
    }
};

/**
 * 백엔드 SettlementItemResponse를 프론트엔드 SettlementItem으로 변환
 */
export const transformSettlementItem = (backendItem: SettlementItemResponse): SettlementItem => {
    return <SettlementItem>{
        id: backendItem.orderNumber, // 주문번호를 ID로 사용
        productName: backendItem.productName,
        orderAmount: backendItem.orderAmount,
        commission: backendItem.commission,
        settlementAmount: backendItem.settlementAmount,
        status: mapBackendStatusToFrontend(backendItem.status),
        orderDate: formatDateToString(backendItem.orderDate),
        deliveryDate: backendItem.deliveryDate
            ? formatDateToString(backendItem.deliveryDate)
            : '배송대기', // null인 경우 "배송대기"로 표시
        settlementDate: formatDateToString(backendItem.settlementCreatedAt),
    };
};

/**
 * 백엔드 SettlementListResponse를 프론트엔드 데이터로 변환
 */
export const transformSettlementList = (backendResponse: SettlementListResponse) => {
    const transformedItems = backendResponse.settlements.content.map(transformSettlementItem);

    return {
        items: transformedItems,
        pagination: {
            totalElements: backendResponse.settlements.totalElements,
            totalPages: backendResponse.settlements.totalPages,
            currentPage: backendResponse.settlements.number,
            size: backendResponse.settlements.size,
            numberOfElements: backendResponse.settlements.numberOfElements,
            hasNext: !backendResponse.settlements.last,
            hasPrevious: !backendResponse.settlements.first,
            isEmpty: backendResponse.settlements.empty
        },
        summary: {
            totalCount: backendResponse.summary.totalCount,
            totalSettlementAmount: backendResponse.summary.totalSettlementAmount,
            completedAmount: backendResponse.summary.completedAmount,
            inProgressAmount: backendResponse.summary.inProgressAmount,
            completionRate: backendResponse.summary.totalCount > 0
                ? (backendResponse.summary.completedAmount / backendResponse.summary.totalSettlementAmount) * 100
                : 0
        }
    };
};

/**
 * 백엔드 MonthlySettlementStatusResponse를 프론트엔드 형태로 변환
 */
export const transformMonthlyStatus = (backendResponse: MonthlySettlementStatusResponse) => {
    return {
        totalCount: backendResponse.totalCount,
        totalMonthlyAmount: backendResponse.totalMonthlyAmount,
        completedCount: backendResponse.completedCount,
        completedAmount: backendResponse.completedAmount,
        inProgressCount: backendResponse.inProgressCount,
        inProgressAmount: backendResponse.inProgressAmount,
        // 계산된 필드들
        pendingCount: 0, // 백엔드에서는 대기중이 없고 처리중/완료만 있음
        pendingAmount: 0,
        completionRate: backendResponse.totalCount > 0
            ? (backendResponse.completedCount / backendResponse.totalCount) * 100
            : 0
    };
};

/**
 * 프론트엔드에서 상태별 필터링을 수행하는 함수
 */
export const filterSettlementsByStatus = (
    items: SettlementItem[],
    statusFilter: string
): SettlementItem[] => {
    if (statusFilter === '전체') {
        return items;
    }

    return items.filter(item => item.status === statusFilter);
};

/**
 * 필터링된 데이터의 페이지네이션 정보 계산
 */
export const calculateFilteredPagination = (
    filteredItems: SettlementItem[],
    currentPage: number,
    pageSize: number
) => {
    const totalElements = filteredItems.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalElements);
    const currentPageItems = filteredItems.slice(startIndex, endIndex);

    return {
        items: currentPageItems,
        totalElements,
        totalPages,
        hasNext: currentPage < totalPages - 1,
        hasPrevious: currentPage > 0,
        numberOfElements: currentPageItems.length,
        isEmpty: currentPageItems.length === 0
    };
};

/**
 * 필터링된 데이터의 요약 정보 재계산
 */
export const recalculateFilteredSummary = (filteredItems: SettlementItem[]) => {
    const totalCount = filteredItems.length;
    const totalSettlementAmount = filteredItems.reduce((sum, item) => sum + item.settlementAmount, 0);
    const completedItems = filteredItems.filter(item => item.status === '정산완료');
    const inProgressItems = filteredItems.filter(item => item.status === '처리중');

    const completedAmount = completedItems.reduce((sum, item) => sum + item.settlementAmount, 0);
    const inProgressAmount = inProgressItems.reduce((sum, item) => sum + item.settlementAmount, 0);

    const completionRate = totalCount > 0 ? (completedItems.length / totalCount) * 100 : 0;

    return {
        totalCount,
        totalSettlementAmount,
        completedAmount,
        inProgressAmount,
        completionRate
    };
};

/**
 * CSV 다운로드를 위한 파일명 생성
 */
export const generateCsvFileName = (targetMonth: string, vendorName?: string): string => {
    return vendorName
        ? `정산내역_${vendorName}_${targetMonth}.csv`
        : `정산내역_${targetMonth}.csv`;
};

/**
 * Blob을 파일로 다운로드하는 유틸리티 함수
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
