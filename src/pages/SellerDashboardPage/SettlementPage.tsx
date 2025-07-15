// src/pages/SellerDashboardPage/SettlementPage.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Container,
    useTheme,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';

// 컴포넌트 임포트
import SettlementTable from '@/components/SellerDashboard/settlement/SettlementTable';
import SalesChart from '@/components/SellerDashboard/settlement/SalesChart';
import SalesInsight from '@/components/SellerDashboard/settlement/SalesInsight';
import MonthlySettlementStatus from '@/components/SellerDashboard/settlement/MonthlySettlementStatus'; // 수정된 버전
import MonthlyReceiptManager from '@/components/SellerDashboard/settlement/MonthlyReceiptManager'; // 신규 추가

// 타입 임포트
import {
    SettlementFilters,
    SettlementItem,
    YearlyMonthData,
    ProductSalesData
} from '@/components/SellerDashboard/settlement/types/settlement.types';

// API 임포트
import { settlementApi, SettlementPeriodRequest } from '@/service/SettlementAPI';
import {
    transformSettlementList,
    filterSettlementsByStatus,
    calculateFilteredPagination,
    recalculateFilteredSummary
} from '@/service/SettlementTransformer';

const SettlementPage = () => {
    const theme = useTheme();

    // ===== 상태 관리 =====
    const [allSettlementData, setAllSettlementData] = useState<SettlementItem[]>([]); // 전체 데이터 저장
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // 정산 현황 필터 상태
    const [settlementFilters, setSettlementFilters] = useState<SettlementFilters>({
        paymentFilter: '전체',
        settlementFilter: '전체',
        periodFilter: '결제일 기준',
        startDate: '',
        endDate: ''
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(0); // 백엔드는 0부터 시작
    const pageSize = 10;

    // 매출 분석 필터 상태 (더미데이터용 - 추후 API 연동 예정)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    // ===== 필터링된 데이터 계산 (useMemo 사용) =====
    const filteredData = useMemo(() => {
        console.log('🔍 필터 적용 중:', {
            전체데이터수: allSettlementData.length,
            상태필터: settlementFilters.settlementFilter,
            현재페이지: currentPage
        });

        // 1. 상태 필터 적용
        const statusFiltered = filterSettlementsByStatus(allSettlementData, settlementFilters.settlementFilter);

        // 2. 페이지네이션 계산
        const paginationResult = calculateFilteredPagination(statusFiltered, currentPage, pageSize);

        // 3. 요약 정보 재계산
        const summary = recalculateFilteredSummary(statusFiltered);

        console.log('🔍 필터 결과:', {
            상태필터적용후: statusFiltered.length,
            현재페이지데이터: paginationResult.items.length,
            총페이지수: paginationResult.totalPages,
            요약정보: summary
        });

        return {
            items: paginationResult.items,
            totalElements: paginationResult.totalElements,
            totalPages: paginationResult.totalPages,
            summary
        };
    }, [allSettlementData, settlementFilters.settlementFilter, currentPage]);

    // ===== API 호출 함수 =====

    /**
     * 정산 리스트 조회 (전체 데이터를 한 번에 로드)
     */
    const fetchAllSettlementData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 전체 데이터를 로드하기 위해 큰 페이지 크기로 요청
            const largePageSize = 1000; // 충분히 큰 값
            let allData: SettlementItem[] = [];
            let currentApiPage = 0;
            let hasMore = true;

            while (hasMore) {
                let response;

                // 필터 조건이 있으면 기간별 조회, 없으면 전체 조회
                if (settlementFilters.startDate || settlementFilters.endDate) {
                    const periodRequest: SettlementPeriodRequest = {
                        startDate: settlementFilters.startDate || new Date().toISOString().split('T')[0],
                        endDate: settlementFilters.endDate || new Date().toISOString().split('T')[0]
                    };
                    response = await settlementApi.getSettlementListByPeriod(periodRequest, currentApiPage, largePageSize);
                } else {
                    response = await settlementApi.getSettlementList(currentApiPage, largePageSize);
                }

                const transformedData = transformSettlementList(response);
                allData = [...allData, ...transformedData.items];

                // 더 가져올 데이터가 있는지 확인
                hasMore = transformedData.pagination.hasNext;
                currentApiPage++;

                // 안전장치: 무한 루프 방지
                if (currentApiPage > 10) {
                    console.warn('⚠️ API 호출 횟수 제한 도달');
                    break;
                }
            }

            console.log('📊 전체 데이터 로드 완료:', {
                총데이터수: allData.length,
                API호출횟수: currentApiPage
            });

            setAllSettlementData(allData);
            setCurrentPage(0); // 첫 페이지로 리셋

        } catch (error: any) {
            console.error('정산 데이터 조회 오류:', error);
            setError('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarMessage('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [settlementFilters.startDate, settlementFilters.endDate]);

    // ===== 초기 데이터 로딩 및 날짜 필터 변경 감지 =====
    useEffect(() => {
        fetchAllSettlementData();
    }, [fetchAllSettlementData]);

    // ===== 더미 데이터 생성 함수들 (매출 분석용 - 추후 API 연동 예정) =====

    // 🎯 년도별 월별 매출 데이터 생성 함수
    const generateYearlyDataFromSettlement = useMemo((): YearlyMonthData[] => {
        const yearlyMap = new Map<number, Map<number, number>>();

        // 전체 정산 데이터를 기반으로 년도별/월별 매출 집계
        allSettlementData.forEach(item => {
            const date = new Date(item.orderDate);
            const year = date.getFullYear();
            const month = date.getMonth();

            if (!yearlyMap.has(year)) {
                yearlyMap.set(year, new Map());
            }

            const monthlyMap = yearlyMap.get(year)!;
            const currentAmount = monthlyMap.get(month) || 0;
            monthlyMap.set(month, currentAmount + item.settlementAmount);
        });

        // Map을 배열로 변환
        const result: YearlyMonthData[] = [];
        yearlyMap.forEach((monthlyMap, year) => {
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const monthName = `${month + 1}월`;
                const amount = Math.floor((monthlyMap.get(month) || 0) / 1000); // 천원 단위로 변환
                monthlyData.push({ month: monthName, amount });
            }
            result.push({ year, monthlyData });
        });

        return result.sort((a, b) => a.year - b.year);
    }, [allSettlementData]);

    // 🔧 상품별 매출 데이터 생성 함수
    const generateProductSalesData = useMemo((): ProductSalesData[] => {
        const productMap = new Map<string, { totalAmount: number; salesCount: number }>();

        // viewMode에 따른 정확한 필터링
        const filteredDataForChart = allSettlementData.filter(item => {
            const date = new Date(item.orderDate);
            const itemYear = date.getFullYear();
            const itemMonth = date.getMonth() + 1;

            if (viewMode === 'monthly') {
                return itemYear === selectedYear && itemMonth === selectedMonth;
            } else {
                return itemYear === selectedYear;
            }
        });

        // 각 상품별로 매출 총액과 판매 횟수 집계
        filteredDataForChart.forEach(item => {
            const current = productMap.get(item.productName) || { totalAmount: 0, salesCount: 0 };
            productMap.set(item.productName, {
                totalAmount: current.totalAmount + item.settlementAmount,
                salesCount: current.salesCount + 1
            });
        });

        // 색상 배열
        const colors = [
            '#e8984b', '#48bb78', '#3182ce', '#ed8936',
            '#9f7aea', '#38b2ac', '#f56565', '#805ad5',
            '#4fd1c7', '#f093fb', '#63b3ed', '#68d391'
        ];

        // Map을 배열로 변환
        const productArray = Array.from(productMap.entries()).map(([productName, data], index) => ({
            productName,
            amount: data.totalAmount,
            percentage: 0, // 나중에 계산
            color: colors[index % colors.length],
            salesCount: data.salesCount,
            totalSales: 0 // 나중에 계산
        }));

        // 매출액 기준으로 정렬
        productArray.sort((a, b) => b.amount - a.amount);

        // 총 매출액 계산 및 퍼센티지 설정
        const totalAmount = productArray.reduce((sum, item) => sum + item.amount, 0);

        return productArray.map(item => ({
            ...item,
            percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
            totalSales: totalAmount
        }));
    }, [allSettlementData, selectedYear, selectedMonth, viewMode]);

    // ===== 이벤트 핸들러 =====

    // 정산 현황 필터 변경 핸들러
    const handleSettlementFiltersChange = (newFilters: Partial<SettlementFilters>) => {
        console.log('📝 필터 변경:', newFilters);
        setSettlementFilters(prev => ({ ...prev, ...newFilters }));

        // 상태 필터 변경 시에는 첫 페이지로 이동
        if (newFilters.settlementFilter !== undefined) {
            setCurrentPage(0);
        }

        // 날짜 필터 변경 시에는 전체 데이터 다시 로드 (useEffect에서 처리됨)
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        console.log('📄 페이지 변경:', currentPage + 1, '->', page);
        setCurrentPage(page - 1); // 프론트엔드는 1부터, 백엔드는 0부터 시작
    };

    // 매출 분석 핸들러들 (더미데이터용)
    const handleYearChange = (year: number) => {
        console.log('🔄 년도 변경:', year);
        setSelectedYear(year);
    };

    const handleMonthChange = (month: number) => {
        console.log('🔄 월 변경:', month);
        setSelectedMonth(month);
    };

    const handleViewModeChange = (mode: 'monthly' | 'yearly') => {
        console.log('🔄 보기 모드 변경:', mode);
        setViewMode(mode);
    };

    // 스낵바 닫기
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // ===== 로딩 상태 =====
    if (loading && allSettlementData.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        정산 데이터를 불러오는 중입니다...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // ===== 에러 상태 =====
    if (error && allSettlementData.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* 정산 현황 섹션 */}
            <Box sx={{ mb: 6 }}>
                <SettlementTable
                    data={filteredData.items}
                    filters={settlementFilters}
                    onFiltersChange={handleSettlementFiltersChange}
                    totalCount={filteredData.totalElements}
                    currentPage={currentPage + 1} // 프론트엔드는 1부터 시작
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    loading={loading}
                    summary={filteredData.summary}
                />
            </Box>

            {/* 이번달 정산 현황 (수정된 버전 - 단순화) */}
            <MonthlySettlementStatus />

            {/* 월별 영수증 조회 및 다운로드 (신규 추가) */}
            <MonthlyReceiptManager />

            {/* 매출 분석 섹션 - 전체 너비 사용 (더미데이터 - 추후 API 연동 예정) */}
            <Box sx={{ mb: 6 }}>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: theme.palette.text.primary
                    }}
                >
                    매출 분석 (준비 중)
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    매출 분석 기능은 현재 더미 데이터로 표시되며, 추후 매출 분석 API와 연동될 예정입니다.
                </Alert>

                <SalesChart
                    data={[]}
                    title="매출 분석"
                    yearlyData={generateYearlyDataFromSettlement}
                    productData={generateProductSalesData}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    viewMode={viewMode}
                    onYearChange={handleYearChange}
                    onMonthChange={handleMonthChange}
                    onViewModeChange={handleViewModeChange}
                />
            </Box>

            {/* 매출 성장 인사이트 섹션 (더미데이터 - 추후 API 연동 예정) */}
            <SalesInsight
                productData={generateProductSalesData}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                viewMode={viewMode}
                allSettlementData={allSettlementData} // 전체 데이터 전달
            />

            {/* 스낵바 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarMessage.includes('성공') || snackbarMessage.includes('다운로드') ? 'success' : 'error'}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SettlementPage;