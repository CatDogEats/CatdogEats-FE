// src/components/SellerDashboard/Dashboard/SalesChart/SalesChart.tsx

import React from "react";
import { Box, Card, Typography } from "@mui/material";
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ChartSalesData } from "./types";

interface SalesChartProps {
    title?: string;
    period?: string;
    totalSales?: string;
    growthRate?: string;
    data?: ChartSalesData[];
    loading?: boolean;
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

// 툴팁 커스텀 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <Box
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #ef9942",
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                    {label}요일
                </Typography>
                <Typography variant="body2" sx={{ color: "#ef9942", fontWeight: 700 }}>
                    ₩{value.toLocaleString()}
                </Typography>
            </Box>
        );
    }
    return null;
};

// Y축 라벨 포맷
const formatYAxisLabel = (value: number) => {
    return formatAmount(value);
};

export const SalesChart: React.FC<SalesChartProps> = ({
                                                          title = "주간 매출 동향",
                                                          period = "이번 주",
                                                          totalSales = "₩0",
                                                          growthRate = "0%",
                                                          data = [],
                                                          loading = false
                                                      }) => {
    const growthColor = growthRate.startsWith('+') ? "#6FCF97" :
        growthRate.startsWith('-') ? "#EB5757" : "#A59A8E";

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
                    alignItems: "baseline",
                    gap: 1,
                    mb: 3,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2a27" }}>
                    {totalSales}
                </Typography>
                <Typography sx={{ color: growthColor, fontWeight: 500 }}>
                    {growthRate}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef9942" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef9942" stopOpacity={0.05}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: "#A59A8E"
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 11,
                                fill: "#A59A8E"
                            }}
                            tickFormatter={formatYAxisLabel}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#ef9942"
                            strokeWidth={3}
                            fill="url(#salesGradient)"
                            dot={{
                                fill: "#ef9942",
                                strokeWidth: 2,
                                stroke: "#fff",
                                r: 4
                            }}
                            activeDot={{
                                r: 6,
                                fill: "#ef9942",
                                stroke: "#fff",
                                strokeWidth: 2
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
};