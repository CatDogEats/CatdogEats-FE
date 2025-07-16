// src/components/SellerDashboard/settlement/SalesChart.tsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    useTheme,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';

// 컴포넌트 임포트
import MonthlyChart from './MonthlyChart';
import ProductChart from './ProductChart';
import { SalesChartProps } from './types/settlement.types';

// 확장된 Props 타입
interface EnhancedSalesChartProps extends SalesChartProps {
    yearlyData?: YearlyMonthData[];
    productData?: ProductSalesData[];
    selectedYear?: number;
    selectedMonth?: number;
    viewMode?: 'monthly' | 'yearly';
    onYearChange?: (year: number) => void;
    onMonthChange?: (month: number) => void;
    onViewModeChange?: (mode: 'monthly' | 'yearly') => void;
    loading?: boolean; // 로딩 상태 추가
    yearTotalAmount?: number; // 년도 총 매출 추가
    yearTotalQuantity?: number; // 년도 총 판매수량 추가
    availableYears?: number[]; // 사용 가능한 년도 목록 추가
}

interface YearlyMonthData {
    year: number;
    monthlyData: { month: string; amount: number; originalAmount?: number; orderCount?: number; totalQuantity?: number; }[];
}

interface ProductSalesData {
    productName: string;
    amount: number;
    percentage: number;
    color: string;
    salesCount: number;
    productId?: string;
}

const SalesChart: React.FC<EnhancedSalesChartProps> = ({
                                                           data,
                                                           title = "매출 분석",
                                                           yearlyData = [],
                                                           productData = [],
                                                           selectedYear = new Date().getFullYear(),
                                                           selectedMonth = new Date().getMonth() + 1,
                                                           viewMode = 'monthly',
                                                           onYearChange,
                                                           onMonthChange,
                                                           onViewModeChange,
                                                           loading = false,
                                                           yearTotalAmount = 0,
                                                           yearTotalQuantity = 0,
                                                           availableYears = [2022, 2023, 2024, 2025]
                                                       }) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    // 현재 선택된 년도의 월별 데이터
    const currentYearData = yearlyData.find(item => item.year === selectedYear)?.monthlyData || data;

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

   

    // 상품별 매출 총합 계산
    const totalProductSales = productData.reduce((sum, item) => sum + item.amount, 0);

    const getPeriodLabel = () => {
        if (viewMode === 'yearly') {
            return `${selectedYear}년 전체`;
        } else {
            return `${selectedYear}년 ${selectedMonth}월`;
        }
    };

    return (
        <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${theme.palette.grey[200]}`,
            overflow: 'hidden'
        }}>
            <CardContent sx={{ p: 0 }}>
                {/* 헤더 */}
                <Box sx={{
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.grey[200]}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary
                        }}
                    >
                        {title}
                    </Typography>

                    {/* 로딩 상태 표시 */}
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">
                                데이터 로딩 중...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* 탭 */}
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 3
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                px: 3,
                                py: 2
                            }
                        }}
                    >
                        <Tab
                            label="기간별 매출"
                            icon={
                                <span
                                    className="material-icons"
                                    style={{ fontSize: '20px' }}
                                >
                                    trending_up
                                </span>
                            }
                            iconPosition="start"
                        />
                        <Tab
                            label="상품별 매출"
                            icon={
                                <span
                                    className="material-icons"
                                    style={{ fontSize: '20px' }}
                                >
                                    inventory
                                </span>
                            }
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* 차트 영역 */}
                <Box sx={{ minHeight: 500 }}>
                    {tabValue === 0 ? (
                        <MonthlyChart
                            data={currentYearData}
                            selectedYear={selectedYear}
                            onYearChange={onYearChange}
                            availableYears={availableYears}
                            loading={loading}
                            yearTotalAmount={yearTotalAmount}
                            yearTotalQuantity={yearTotalQuantity}
                        />
                    ) : (
                        <ProductChart
                            data={productData}
                            selectedYear={selectedYear}
                            selectedMonth={selectedMonth}
                            viewMode={viewMode}
                            onYearChange={onYearChange}
                            onMonthChange={onMonthChange}
                            onViewModeChange={onViewModeChange}
                            availableYears={availableYears}
                            availableMonths={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                            loading={loading}
                        />
                    )}
                </Box>

                {/* : 요약 정보 - 성장률 표시 제거 */}
                <Box sx={{
                    p: 3,
                    backgroundColor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.grey[200]}`
                }}>
                    {tabValue === 0 ? (
                        // : 기간별 매출 요약 - 성장률 제거
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 700,
                                    mb: 1
                                }}
                            >
                                ₩{(yearTotalAmount || 0).toLocaleString()}
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {selectedYear}년 총 매출
                                </Typography>
                                {yearTotalQuantity && yearTotalQuantity > 0 && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: theme.palette.secondary.main,
                                        gap: 0.5
                                    }}>
                                        <span className="material-icons">
                                            inventory
                                        </span>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {yearTotalQuantity.toLocaleString()}개 판매
                                        </Typography>
                                    </Box>
                                )}
                                {/* 🔧 제거: 성장률 표시 완전 제거 */}
                            </Box>
                        </Box>
                    ) : (
                        // 상품별 매출 요약
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 700,
                                    mb: 1
                                }}
                            >
                                ₩{totalProductSales.toLocaleString()}
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {getPeriodLabel()} 상품별 총 매출
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: theme.palette.text.secondary,
                                    gap: 0.5
                                }}>
                                    <span className="material-icons">
                                        inventory_2
                                    </span>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {productData.length}개 상품
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default SalesChart;