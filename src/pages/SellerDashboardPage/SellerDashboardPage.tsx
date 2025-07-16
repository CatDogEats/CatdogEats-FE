// src/pages/SellerDashboardPage/SellerDashboardPage.tsx

import React, { useState, useEffect } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { StatCards } from "@/components/SellerDashboard/Dashboard/StatCards/StatCards";
import { SalesChart } from "@/components/SellerDashboard/Dashboard/SalesChart/SalesChart";
import { ProductChart } from "@/components/SellerDashboard/Dashboard/ProductChart/ProductChart";
import { DemandForecastPanel } from "@/components/SellerDashboard/Dashboard/DemandForecastPanel/DemandForecastPanel";
import { OrderRecommendationPanel } from "@/components/SellerDashboard/Dashboard/OrderRecommendationPanel/OrderRecommendationPanel";

// API 및 타입 import
import {
    sellerDashboardApi,
    transformToStatCards,
    transformToSalesChart,
    transformToProductChart,
    transformToDemandForecast,
    SellerDashboardResponse,
    StatCardData,
    ChartSalesData,
    ProductChartData,
    DemandForecastItem
} from "@/service/SellerDashboardAPI";

const SellerDashboardDashboardPage: React.FC = () => {
    // 상태 관리
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 상태
    const [statCardsData, setStatCardsData] = useState<StatCardData[]>([]);
    const [salesChartData, setSalesChartData] = useState<ChartSalesData[]>([]);
    const [productChartData, setProductChartData] = useState<ProductChartData[]>([]);
    const [demandForecastData, setDemandForecastData] = useState<DemandForecastItem[]>([]);

    // 추가 통계 데이터
    const [totalWeeklySales, setTotalWeeklySales] = useState<string>("₩0");
    const [salesGrowthRate, setSalesGrowthRate] = useState<string>("0%");
    const [totalProductsSold, setTotalProductsSold] = useState<string>("0개");
    const [productChangeRate, setProductChangeRate] = useState<string>("0%");

    // 데이터 로드 함수
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response: SellerDashboardResponse = await sellerDashboardApi.getDashboardData();

            // 1. 통계 카드 데이터 변환
            const statCards = transformToStatCards(response.todayStats);
            setStatCardsData(statCards);

            // 2. 주간 매출 차트 데이터 변환
            const salesChart = transformToSalesChart(response.weeklySales);
            setSalesChartData(salesChart);

            // 주간 매출 총합 및 성장률 계산
            const totalSales = response.weeklySales.reduce((sum, item) => sum + item.dailySales, 0);
            setTotalWeeklySales(`₩${totalSales.toLocaleString()}`);

            // 간단한 성장률 계산 (이번 주 vs 저번 주 비교 - 실제로는 더 정교한 계산 필요)
            const thisWeekSales = response.weeklySales.slice(-3).reduce((sum, item) => sum + item.dailySales, 0);
            const lastWeekSales = response.weeklySales.slice(0, 4).reduce((sum, item) => sum + item.dailySales, 0);
            const growthRate = lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales * 100) : 0;
            setSalesGrowthRate(`${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`);

            // 3. 상품 차트 데이터 변환
            const productChart = transformToProductChart(response.productRanking);
            setProductChartData(productChart);

            // 상품 총 판매량 계산
            const totalQuantity = response.productRanking.reduce((sum, item) => sum + item.totalQuantity, 0);
            setTotalProductsSold(`${totalQuantity.toLocaleString()}개`);

            // 임시 변화율 (실제로는 이전 기간과의 비교 데이터가 필요)
            setProductChangeRate("-5%");

            // 4. 수요 예측 데이터 변환
            const demandForecast = transformToDemandForecast(response.demandForecasts);
            setDemandForecastData(demandForecast);

        } catch (err) {
            console.error("대시보드 데이터 로드 실패:", err);
            setError("대시보드 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadDashboardData();
    }, []);

    // 새로고침 함수 (필요시 사용)
    const handleRefresh = () => {
        loadDashboardData();
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* 페이지 제목 */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#2d2a27",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        mb: 1,
                    }}
                >
                    대시보드
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: "#5c5752", fontSize: "1rem" }}
                >
                    판매 현황을 실시간으로 확인하고 분석을 받아보세요.
                </Typography>
            </Box>

            {/* 에러 표시 */}
            {error && (
                <Box sx={{ mb: 3 }}>
                    <Alert
                        severity="error"
                        action={
                            <Typography
                                onClick={handleRefresh}
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.875rem'
                                }}
                            >
                                다시 시도
                            </Typography>
                        }
                    >
                        {error}
                    </Alert>
                </Box>
            )}

            {/* 1행: 통계 카드 영역 */}
            <Box sx={{ mb: 3 }}>
                <StatCards data={statCardsData} loading={loading} />
            </Box>

            {/* 2행과 3행 컨테이너 */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                {/* 2행: 차트 영역 */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: 350
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <SalesChart
                            data={salesChartData}
                            totalSales={totalWeeklySales}
                            growthRate={salesGrowthRate}
                            loading={loading}
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ProductChart
                            data={productChartData}
                            totalProducts={totalProductsSold}
                            changeRate={productChangeRate}
                            loading={loading}
                        />
                    </Box>
                </Box>

                {/* 3행: 수요 예측 영역 */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: 350
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <DemandForecastPanel data={demandForecastData} loading={loading} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <OrderRecommendationPanel data={demandForecastData} loading={loading} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default SellerDashboardDashboardPage;