// src/service/SettlementTransformer.ts
import {
    SettlementItemResponse,
    SettlementListResponse,
    MonthlySettlementStatusResponse,
    formatDateToString,
    mapBackendStatusToFrontend
} from '@/service/SettlementAPI';
import { SettlementItem } from '@/components/SellerDashboard/settlement/types/settlement.types';

/**
 * 백엔드 SettlementItemResponse를 프론트엔드 SettlementItem으로 변환
 */
export const transformSettlementItem = (backendItem: SettlementItemResponse): SettlementItem => {
    return {
        id: backendItem.orderNumber, // 주문번호를 ID로 사용
        productName: backendItem.productName,
        orderAmount: backendItem.orderAmount,
        commission: backendItem.commission,
        settlementAmount: backendItem.settlementAmount,
        status: mapBackendStatusToFrontend(backendItem.status),
        orderDate: formatDateToString(backendItem.orderDate),
        // 선택적 필드들
        deliveryDate: backendItem.deliveryDate ? formatDateToString(backendItem.deliveryDate) : undefined,
        settlementDate: backendItem.settlementCreatedAt ? formatDateToString(backendItem.settlementCreatedAt) : undefined,
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
 * 날짜 문자열을 프론트엔드에서 사용하는 형식으로 변환
 * YYYY-MM-DD → MM/DD 형식으로 축약
 */
export const formatDateForTable = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
};

/**
 * 프론트엔드에서 사용하는 필터를 백엔드 API 파라미터로 변환
 */
export const transformFiltersToApiParams = (filters: {
    startDate?: string;
    endDate?: string;
    settlementFilter?: string;
}) => {
    const params: any = {};

    if (filters.startDate) {
        params.startDate = filters.startDate;
    }

    if (filters.endDate) {
        params.endDate = filters.endDate;
    }

    // 백엔드에서는 상태 필터를 별도로 처리하지 않고 전체 데이터를 가져온 후 프론트에서 필터링
    // 만약 백엔드에서 상태 필터를 지원한다면 여기서 추가 처리

    return params;
};

/**
 * CSV 다운로드를 위한 파일명 생성
 */
export const generateCsvFileName = (targetMonth: string, vendorName?: string): string => {
    const fileName = vendorName
        ? `정산내역_${vendorName}_${targetMonth}.csv`
        : `정산내역_${targetMonth}.csv`;

    return fileName;
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