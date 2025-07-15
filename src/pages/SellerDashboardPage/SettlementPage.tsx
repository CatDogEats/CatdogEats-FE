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
import MonthlySettlementStatus from '@/components/SellerDashboard/settlement/MonthlySettlementStatus';
import MonthlyReceiptManager from '@/components/SellerDashboard/settlement/MonthlyReceiptManager';

// 타입 임포트
import {
    SettlementFilters,
    SettlementItem,
    ProductSalesData,
    YearlyMonthData
} from '@/components/SellerDashboard/settlement/types/settlement.types';

// API 임포트
import { settlementApi, SettlementPeriodRequest } from '@/service/SettlementAPI';
import {
    transformSettlementList,
    filterSettlementsByStatus,
    calculateFilteredPagination,
    recalculateFilteredSummary
} from '@/service/SettlementTransformer';

// 🔧 수정: 매출 분석 API 임포트
import {
    salesAnalyticsApi,
    transformMonthlyDataForChart,
    transformProductDataForChart,
    createProductSalesParams,
    PeriodSalesAnalyticsResponse,
    ProductSalesAnalyticsResponse
} from '@/service/SalesAnalyticsAPI';

const SettlementPage = () => {
    const theme = useTheme();

    // ===== 상태 관리 =====
    const [allSettlementData, setAllSettlementData] = useState<SettlementItem[]>([]);
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
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    // 매출 분석 상태
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    // 매출 분석 데이터 상태
    const [periodSalesData, setPeriodSalesData] = useState<PeriodSalesAnalyticsResponse | null>(null);
    const [productSalesData, setProductSalesData] = useState<ProductSalesAnalyticsResponse | null>(null);
    const [salesAnalyticsLoading, setSalesAnalyticsLoading] = useState(false);
    const [salesAnalyticsError, setSalesAnalyticsError] = useState<string | null>(null);

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
            const largePageSize = 1000;
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

                hasMore = transformedData.pagination.hasNext;
                currentApiPage++;

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
            setCurrentPage(0);

        } catch (error: any) {
            console.error('정산 데이터 조회 오류:', error);
            setError('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarMessage('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [settlementFilters.startDate, settlementFilters.endDate]);

    /**
     * 🔧 수정: 기간별 매출 분석 데이터 조회
     */
    const fetchPeriodSalesAnalytics = useCallback(async (year: number) => {
        try {
            setSalesAnalyticsLoading(true);
            setSalesAnalyticsError(null);

            const response = await salesAnalyticsApi.getPeriodSalesAnalytics(year);
            setPeriodSalesData(response);

            console.log('📈 기간별 매출 분석 데이터 로드:', {
                year,
                yearTotalAmount: response.yearTotalAmount,
                yearTotalQuantity: response.yearTotalQuantity,
                monthlyDataCount: response.monthlyData.length
            });

        } catch (error: any) {
            console.error('기간별 매출 분석 조회 오류:', error);
            setSalesAnalyticsError('매출 분석 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarMessage('매출 분석 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setSalesAnalyticsLoading(false);
        }
    }, []);

    /**
     * 🔧 수정: 상품별 매출 분석 데이터 조회 (올바른 파라미터로 API 호출)
     */
    const fetchProductSalesAnalytics = useCallback(async (year: number, month: number | undefined, currentViewMode: 'monthly' | 'yearly') => {
        try {
            setSalesAnalyticsLoading(true);
            setSalesAnalyticsError(null);

            // 🔧 수정: 올바른 파라미터 생성
            const params = createProductSalesParams(year, month, currentViewMode, 0, 30);

            console.log('📊 상품별 매출 분석 요청:', {
                params,
                year,
                month,
                viewMode: currentViewMode
            });

            const response = await salesAnalyticsApi.getProductSalesAnalytics(params);
            setProductSalesData(response);

            console.log('📊 상품별 매출 분석 데이터 로드:', {
                type: response.type,
                year: response.year,
                month: response.month,
                totalAmount: response.totalAmount,
                productCount: response.products.totalElements,
                actualProductCount: response.products.content.length
            });

        } catch (error: any) {
            console.error('상품별 매출 분석 조회 오류:', error);
            setSalesAnalyticsError('상품별 매출 분석 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarMessage('상품별 매출 분석 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setSalesAnalyticsLoading(false);
        }
    }, []);

    // ===== useEffect - 초기 데이터 로딩 =====
    useEffect(() => {
        fetchAllSettlementData();
    }, [fetchAllSettlementData]);

    useEffect(() => {
        fetchPeriodSalesAnalytics(selectedYear);
    }, [selectedYear, fetchPeriodSalesAnalytics]);

    // 🔧 수정: viewMode 변경 시 즉시 API 호출
    useEffect(() => {
        console.log('📊 상품별 매출 분석 파라미터 변경 감지:', {
            selectedYear,
            selectedMonth,
            viewMode
        });

        fetchProductSalesAnalytics(
            selectedYear,
            viewMode === 'monthly' ? selectedMonth : undefined,
            viewMode
        );
    }, [selectedYear, selectedMonth, viewMode, fetchProductSalesAnalytics]);

    // ===== 차트용 데이터 변환 =====
    const monthlyChartData = useMemo(() => {
        if (!periodSalesData) return [];
        return transformMonthlyDataForChart(periodSalesData.monthlyData);
    }, [periodSalesData]);

    const productChartData = useMemo((): ProductSalesData[] => {
        if (!productSalesData) return [];
        return transformProductDataForChart(productSalesData.products.content);
    }, [productSalesData]);

    // 🔧 수정: YearlyMonthData 타입에 맞게 변환
    const yearlyDataForChart = useMemo((): YearlyMonthData[] => {
        if (!periodSalesData) return [];
        return [{
            year: periodSalesData.year,
            monthlyData: monthlyChartData
        }];
    }, [periodSalesData, monthlyChartData]);

    // 사용 가능한 년도 목록 (2020년부터 현재년도까지)
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = 2020; year <= currentYear; year++) {
            years.push(year);
        }
        return years.reverse(); // 최신년도부터 표시
    }, []);

    // ===== 이벤트 핸들러 =====

    // 정산 현황 필터 변경 핸들러
    const handleSettlementFiltersChange = (newFilters: Partial<SettlementFilters>) => {
        console.log('📝 필터 변경:', newFilters);
        setSettlementFilters(prev => ({ ...prev, ...newFilters }));

        if (newFilters.settlementFilter !== undefined) {
            setCurrentPage(0);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        console.log('📄 페이지 변경:', currentPage + 1, '->', page);
        setCurrentPage(page - 1);
    };

    // 매출 분석 핸들러들
    const handleYearChange = (year: number) => {
        console.log('🔄 년도 변경:', year);
        setSelectedYear(year);
    };

    const handleMonthChange = (month: number) => {
        console.log('🔄 월 변경:', month);
        setSelectedMonth(month);
    };

    // 🔧 수정: viewMode 변경 시 디버깅 로그 추가
    const handleViewModeChange = (mode: 'monthly' | 'yearly') => {
        console.log('🔄 보기 모드 변경:', viewMode, '->', mode);
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
                    currentPage={currentPage + 1}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    loading={loading}
                    summary={filteredData.summary}
                />
            </Box>

            {/* 이번달 정산 현황 */}
            <MonthlySettlementStatus />

            {/* 월별 영수증 조회 및 다운로드 */}
            <MonthlyReceiptManager />

            {/* 매출 분석 섹션 */}
            <Box sx={{ mb: 6 }}>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: theme.palette.text.primary
                    }}
                >
                    매출 분석
                </Typography>

                {/* 매출 분석 에러 상태 */}
                {salesAnalyticsError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {salesAnalyticsError}
                    </Alert>
                )}

                {/* 🔧 수정: 올바른 데이터 타입으로 전달 */}
                <SalesChart
                    data={monthlyChartData} // 🔧 수정: 빈 배열 대신 실제 데이터 전달
                    title="매출 분석"
                    yearlyData={yearlyDataForChart}
                    productData={productChartData}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    viewMode={viewMode}
                    onYearChange={handleYearChange}
                    onMonthChange={handleMonthChange}
                    onViewModeChange={handleViewModeChange}
                    // 🔧 수정: 매출 분석 전용 props 추가
                    loading={salesAnalyticsLoading}
                    yearTotalAmount={periodSalesData?.yearTotalAmount}
                    yearTotalQuantity={periodSalesData?.yearTotalQuantity}
                    availableYears={availableYears}
                />
            </Box>



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