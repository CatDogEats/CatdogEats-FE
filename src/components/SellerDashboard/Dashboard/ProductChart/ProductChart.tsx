// src/components/SellerDashboard/Dashboard/ProductChart/ProductChart.tsx

import React, { useState } from "react";
import { Box, Card, Typography, IconButton, Chip } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ProductChartData } from "./types";

interface ProductChartProps {
    title?: string;
    period?: string;
    totalProducts?: string;
    changeRate?: string;
    data?: ProductChartData[];
    loading?: boolean;
    itemsPerPage?: number; // 페이지당 상품 수
}

// 금액 포맷 함수
const formatAmount = (amount: number) => {
    if (amount === 0) return "0";
    if (amount >= 10000000) return `${Math.round(amount / 10000000)}천만`;
    if (amount >= 1000000) return `${Math.round(amount / 1000000)}백만`;
    if (amount >= 10000) return `${Math.round(amount / 10000)}만`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}천`;
    return amount.toString();
};

// 상품명을 짧게 자르는 함수
const truncateProductName = (name: string, maxLength: number = 6) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

// 커스텀 툴팁
const CustomTooltip = ({ active, payload}: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Box
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #ef9942",
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    maxWidth: 220,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", mb: 0.5 }}>
                    {data.productName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#ef9942", fontWeight: 700, mb: 0.3 }}>
                    매출: ₩{data.totalSales.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", fontWeight: 600, mb: 0.3 }}>
                    판매량: {data.totalQuantity}개
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                    매출 비중: {data.percentage}%
                </Typography>
            </Box>
        );
    }
    return null;
};

// X축 라벨 커스텀 (상품명)
const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="middle"
                fill="#A59A8E"
                fontSize="11"
            >
                {truncateProductName(payload.value)}
            </text>
        </g>
    );
};

export const ProductChart: React.FC<ProductChartProps> = ({
                                                              title = "월간 상품 매출 순위 (TOP 10)",
                                                              period = "이번 달",
                                                              totalProducts = "0개",
                                                              data = [],
                                                              loading = false,
                                                              itemsPerPage = 5 // 기본 5개씩 표시
                                                          }) => {
    const [currentPage, setCurrentPage] = useState(0);



    // 페이징 계산
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    // 차트용 데이터 변환
    const chartData = currentData.map(item => ({
        ...item,
        value: item.totalSales,
        displayName: truncateProductName(item.productName, 8)
    }));

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: 3,
                    border: "1px solid #F3EADD",
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="#A59A8E">
                        {period}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        color: "#A59A8E"
                    }}
                >
                    <Typography>차트 데이터를 불러오는 중...</Typography>
                </Box>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                borderRadius: 3,
                border: "1px solid #F3EADD",
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
            }}
        >
            {/* 헤더 */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                    {title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="#A59A8E">
                        {period}
                    </Typography>
                    {totalPages > 1 && (
                        <Chip
                            label={`${currentPage + 1}/${totalPages}`}
                            size="small"
                            sx={{
                                backgroundColor: "#F3EADD",
                                color: "#ef9942",
                                fontSize: "0.75rem",
                                height: 24
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* 통계 정보 */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    mb: 2,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2a27" }}>
                    {totalProducts}
                </Typography>

            </Box>

            {/* 페이징 정보 */}
            {data.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="caption" sx={{ color: "#A59A8E" }}>
                        {startIndex + 1}-{Math.min(endIndex, data.length)}위 / 전체 {data.length}개 상품
                    </Typography>

                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                size="small"
                                sx={{
                                    color: currentPage === 0 ? "#ccc" : "#ef9942",
                                    "&:disabled": { color: "#ccc" }
                                }}
                            >
                                <ChevronLeft fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                size="small"
                                sx={{
                                    color: currentPage === totalPages - 1 ? "#ccc" : "#ef9942",
                                    "&:disabled": { color: "#ccc" }
                                }}
                            >
                                <ChevronRight fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            )}

            {/* 차트 */}
            <Box sx={{ flex: 1, minHeight: 180 }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 40,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="displayName"
                                axisLine={false}
                                tickLine={false}
                                tick={<CustomXAxisTick />}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                    fill: "#A59A8E"
                                }}
                                tickFormatter={formatAmount}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            color: "#A59A8E"
                        }}
                    >
                        <Typography sx={{ fontSize: "0.875rem" }}>
                            상품 데이터가 없습니다
                        </Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};