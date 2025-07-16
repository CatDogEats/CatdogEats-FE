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
import { settlementApi, SettlementPeriodRequest } from '@/service/settlement/SettlementAPI.ts';
import {
    transformSettlementList,
    filterSettlementsByStatus,
    recalculateFilteredSummary
} from '@/service/settlement/SettlementTransformer.ts';

// 매출 분석 API 임포트
import {
    salesAnalyticsApi,
    transformMonthlyDataForChart,
    transformProductDataForChart,
    createProductSalesParams,
    PeriodSalesAnalyticsResponse,
    ProductSalesAnalyticsResponse
} from '@/service/settlement/SalesAnalyticsAPI.ts';

// 🆕 새로운 인터페이스: 페이지별 데이터 관리
interface SettlementPageData {
    items: SettlementItem[];
    summary: any; // SettlementTransformer에서 반환하는 summary 타입 사용
    totalElements: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// 🆕 데이터 캐시 관리
interface SettlementCache {
    [key: string]: {
        data: SettlementPageData;
        timestamp: number;
        filters: SettlementFilters;
    };
}

const SettlementPage = () => {
    const theme = useTheme();

    // ===== 🔧 수정된 상태 관리 =====

    // 기본 상태
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // 🆕 페이지별 데이터 상태 (전체 데이터 로드 방식 제거)
    const [pageData, setPageData] = useState<SettlementPageData>({
        items: [],
        summary: {
            totalCount: 0,
            totalSettlementAmount: 0,
            completedAmount: 0,
            inProgressAmount: 0,
            completionRate: 0
        },
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        hasNext: false,
        hasPrevious: false
    });

    // 🆕 캐시 관리 (필터링 성능 최적화)
    const [dataCache, setDataCache] = useState<SettlementCache>({});

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
    const pageSize = 20; // 🔧 페이지 크기 증가 (10 → 20)

    // 매출 분석 상태 (기존 유지)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    // 매출 분석 데이터 상태 (기존 유지)
    const [periodSalesData, setPeriodSalesData] = useState<PeriodSalesAnalyticsResponse | null>(null);
    const [productSalesData, setProductSalesData] = useState<ProductSalesAnalyticsResponse | null>(null);
    const [salesAnalyticsLoading, setSalesAnalyticsLoading] = useState(false);
    const [salesAnalyticsError, setSalesAnalyticsError] = useState<string | null>(null);

    // ===== 🆕 유틸리티 함수 =====

    /**
     * 캐시 키 생성
     */
    const generateCacheKey = useCallback((filters: SettlementFilters, page: number): string => {
        return `${filters.settlementFilter}_${filters.startDate}_${filters.endDate}_${page}`;
    }, []);

    /**
     * 캐시에서 데이터 조회 (5분 유효)
     */
    const getCachedData = useCallback((cacheKey: string): SettlementPageData | null => {
        const cached = dataCache[cacheKey];
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000; // 5분
        if (isExpired) {
            // 만료된 캐시 제거
            setDataCache(prev => {
                const newCache = { ...prev };
                delete newCache[cacheKey];
                return newCache;
            });
            return null;
        }

        return cached.data;
    }, [dataCache]);

    /**
     * 캐시에 데이터 저장
     */
    const setCachedData = useCallback((
        cacheKey: string,
        data: SettlementPageData,
        filters: SettlementFilters
    ) => {
        setDataCache(prev => ({
            ...prev,
            [cacheKey]: {
                data,
                timestamp: Date.now(),
                filters
            }
        }));
    }, []);

    // ===== 🆕 API 호출 함수 (최적화) =====

    /**
     * 🆕 페이지별 정산 데이터 조회 (캐시 활용)
     */
    const fetchSettlementPage = useCallback(async (
        page: number = 0,
        filters: SettlementFilters,
        useCache: boolean = true
    ) => {
        try {
            // 캐시 확인
            const cacheKey = generateCacheKey(filters, page);
            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) {
                    console.log('📦 캐시에서 데이터 로드:', cacheKey);
                    setPageData(cachedData);
                    return;
                }
            }

            setLoading(true);
            setError(null);

            console.log('🌐 API 호출:', {
                page: page + 1,
                size: pageSize,
                filters
            });

            let response;

            // 필터 조건에 따라 API 호출
            if (filters.startDate || filters.endDate) {
                const periodRequest: SettlementPeriodRequest = {
                    startDate: filters.startDate || new Date().toISOString().split('T')[0],
                    endDate: filters.endDate || new Date().toISOString().split('T')[0]
                };
                response = await settlementApi.getSettlementListByPeriod(periodRequest, page, pageSize);
            } else {
                response = await settlementApi.getSettlementList(page, pageSize);
            }

            // 데이터 변환
            const transformedData = transformSettlementList(response);

            // 🆕 클라이언트 사이드 필터링 적용 (상태 필터)
            let filteredItems = transformedData.items;
            let adjustedSummary = transformedData.summary; // 기존 transformer에서 가져온 summary 사용

            if (filters.settlementFilter !== '전체') {
                filteredItems = filterSettlementsByStatus(transformedData.items, filters.settlementFilter);

                // 필터링된 데이터의 요약 정보는 transformer 함수 사용
                adjustedSummary = recalculateFilteredSummary(filteredItems);
            }

            const newPageData: SettlementPageData = {
                items: filteredItems,
                summary: adjustedSummary,
                totalElements: transformedData.pagination.totalElements,
                totalPages: transformedData.pagination.totalPages,
                currentPage: page,
                hasNext: transformedData.pagination.hasNext,
                hasPrevious: transformedData.pagination.hasPrevious
            };

            // 상태 업데이트
            setPageData(newPageData);

            // 캐시 저장
            setCachedData(cacheKey, newPageData, filters);

            console.log('✅ 페이지 데이터 로드 완료:', {
                items: filteredItems.length,
                totalElements: newPageData.totalElements,
                page: page + 1,
                totalPages: newPageData.totalPages
            });

        } catch (error: any) {
            console.error('정산 데이터 조회 오류:', error);
            setError('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarMessage('정산 데이터를 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [generateCacheKey, getCachedData, setCachedData, pageSize]);

    // ===== 🔧 매출 분석 API 호출 (기존 유지) =====

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

    const fetchProductSalesAnalytics = useCallback(async (year: number, month: number | undefined, currentViewMode: 'monthly' | 'yearly') => {
        try {
            setSalesAnalyticsLoading(true);
            setSalesAnalyticsError(null);

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

    // ===== 🔧 useEffect 훅 최적화 =====

    // 초기 데이터 로딩
    useEffect(() => {
        fetchSettlementPage(0, settlementFilters, false); // 초기 로딩은 캐시 사용 안함
    }, []); // 의존성 배열 최소화

    // 필터 변경 시 첫 페이지로 리셋
    useEffect(() => {
        console.log('🔄 필터 변경 감지:', settlementFilters);
        setCurrentPage(0);
        fetchSettlementPage(0, settlementFilters, false); // 필터 변경 시 캐시 무시
    }, [settlementFilters.settlementFilter, settlementFilters.startDate, settlementFilters.endDate]);

    // 페이지 변경 시 데이터 로딩
    useEffect(() => {
        if (currentPage > 0) { // 초기 로딩 시 중복 호출 방지
            fetchSettlementPage(currentPage, settlementFilters, true); // 페이지 변경 시 캐시 활용
        }
    }, [currentPage]);

    // 매출 분석 데이터 로딩 (기존 유지)
    useEffect(() => {
        fetchPeriodSalesAnalytics(selectedYear);
    }, [selectedYear, fetchPeriodSalesAnalytics]);

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

    // ===== 차트용 데이터 변환 (기존 유지) =====
    const monthlyChartData = useMemo(() => {
        if (!periodSalesData) return [];
        return transformMonthlyDataForChart(periodSalesData.monthlyData);
    }, [periodSalesData]);

    const productChartData = useMemo((): ProductSalesData[] => {
        if (!productSalesData) return [];
        return transformProductDataForChart(productSalesData.products.content);
    }, [productSalesData]);

    const yearlyDataForChart = useMemo((): YearlyMonthData[] => {
        if (!periodSalesData) return [];
        return [{
            year: periodSalesData.year,
            monthlyData: monthlyChartData
        }];
    }, [periodSalesData, monthlyChartData]);

    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = 2020; year <= currentYear; year++) {
            years.push(year);
        }
        return years.reverse();
    }, []);

    // ===== 🔧 이벤트 핸들러 최적화 =====

    const handleSettlementFiltersChange = useCallback((newFilters: Partial<SettlementFilters>) => {
        console.log('📝 필터 변경:', newFilters);
        setSettlementFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        console.log('📄 페이지 변경:', currentPage + 1, '->', page);
        setCurrentPage(page - 1);
    }, [currentPage]);

    const handleYearChange = useCallback((year: number) => {
        console.log('🔄 년도 변경:', year);
        setSelectedYear(year);
    }, []);

    const handleMonthChange = useCallback((month: number) => {
        console.log('🔄 월 변경:', month);
        setSelectedMonth(month);
    }, []);

    const handleViewModeChange = useCallback((mode: 'monthly' | 'yearly') => {
        console.log('🔄 보기 모드 변경:', viewMode, '->', mode);
        setViewMode(mode);
    }, [viewMode]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    // ===== 로딩 상태 (간소화) =====
    if (loading && pageData.items.length === 0) {
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
    if (error && pageData.items.length === 0) {
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
                    data={pageData.items}
                    filters={settlementFilters}
                    onFiltersChange={handleSettlementFiltersChange}
                    totalCount={pageData.totalElements}
                    currentPage={currentPage + 1}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    loading={loading}
                    summary={pageData.summary}
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

                <SalesChart
                    data={monthlyChartData}
                    title="매출 분석"
                    yearlyData={yearlyDataForChart}
                    productData={productChartData}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    viewMode={viewMode}
                    onYearChange={handleYearChange}
                    onMonthChange={handleMonthChange}
                    onViewModeChange={handleViewModeChange}
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