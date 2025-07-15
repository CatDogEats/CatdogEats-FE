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
    downloadBlob,
    generateCsvFileName
} from '@/service/SettlementTransformer';

const SettlementPage = () => {
    const theme = useTheme();

    // ===== 상태 관리 =====
    const [settlementData, setSettlementData] = useState<SettlementItem[]>([]);
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
    const [totalElements, setTotalElements] = useState(0);
    const [summary, setSummary] = useState<any>(null);

    // 매출 분석 필터 상태 (더미데이터용 - 추후 API 연동 예정)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    // ===== API 호출 함수 =====

    /**
     * 정산 리스트 조회 (필터 조건에 따라 전체 또는 기간별 조회)
     */
    const fetchSettlementData = useCallback(async (page: number = 0) => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // 필터 조건이 있으면 기간별 조회, 없으면 전체 조회
            if (settlementFilters.startDate || settlementFilters.endDate) {
                const periodRequest: SettlementPeriodRequest = {
                    startDate: settlementFilters.startDate || new Date().toISOString().split('T')[0],
                    endDate: settlementFilters.endDate || new Date().toISOString().split('T')[0]
                };
                response = await settlementApi.getSettlementListByPeriod(periodRequest, page, 10);
            } else {
                response = await settlementApi.getSettlementList(page, 10);
            }

            const transformedData = transformSettlementList(response);

            console.log('🔍 API 응답 디버깅:', response);
            console.log('🔍 변환된 데이터:', transformedData);

            setSettlementData(transformedData.items);
            setTotalElements(transformedData.pagination.totalElements);
            setCurrentPage(page);
            setSummary(transformedData.summary);

            console.log('🔍 Summary 데이터 설정:', transformedData.summary);

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
     * CSV 다운로드 함수
     */
    const handleDownloadReport = useCallback(async () => {
        try {
            const currentMonth = new Date();
            const targetMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

            const blob = await settlementApi.downloadMonthlySettlementCsv(targetMonth);
            const fileName = generateCsvFileName(targetMonth);
            downloadBlob(blob, fileName);

            setSnackbarMessage('정산내역 CSV 파일이 다운로드되었습니다.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('CSV 다운로드 오류:', error);
            setSnackbarMessage('CSV 다운로드 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    }, []);

    // ===== 초기 데이터 로딩 =====
    useEffect(() => {
        fetchSettlementData(0);
    }, [fetchSettlementData]);

    // ===== 더미 데이터 생성 함수들 (매출 분석용 - 추후 API 연동 예정) =====

    // 🎯 년도별 월별 매출 데이터 생성 함수
    const generateYearlyDataFromSettlement = useMemo((): YearlyMonthData[] => {
        const yearlyMap = new Map<number, Map<number, number>>();

        // 정산 데이터를 기반으로 년도별/월별 매출 집계
        settlementData.forEach(item => {
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
    }, [settlementData]);

    // 🔧 상품별 매출 데이터 생성 함수
    const generateProductSalesData = useMemo((): ProductSalesData[] => {
        const productMap = new Map<string, { totalAmount: number; salesCount: number }>();

        // viewMode에 따른 정확한 필터링
        const filteredData = settlementData.filter(item => {
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
        filteredData.forEach(item => {
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
    }, [settlementData, selectedYear, selectedMonth, viewMode]);

    // ===== 이벤트 핸들러 =====

    // 정산 현황 필터 변경 핸들러
    const handleSettlementFiltersChange = (newFilters: Partial<SettlementFilters>) => {
        setSettlementFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        fetchSettlementData(page - 1); // 프론트엔드는 1부터, 백엔드는 0부터 시작
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
    if (loading && settlementData.length === 0) {
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
    if (error && settlementData.length === 0) {
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
                    data={settlementData}
                    filters={settlementFilters}
                    onFiltersChange={handleSettlementFiltersChange}
                    totalCount={totalElements}
                    currentPage={currentPage + 1} // 프론트엔드는 1부터 시작
                    pageSize={10}
                    onPageChange={handlePageChange}
                    loading={loading}
                    onDownloadReport={handleDownloadReport}
                    summary={summary}
                />
            </Box>

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
                allSettlementData={settlementData}
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