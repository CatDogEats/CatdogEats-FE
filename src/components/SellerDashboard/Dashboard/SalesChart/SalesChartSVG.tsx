// src/components/SellerDashboard/Dashboard/SalesChart/SalesChartSVG.tsx

import React from "react";
import { ChartSalesData } from "./types";

interface SalesChartSVGProps {
    data?: ChartSalesData[];
}

export const SalesChartSVG: React.FC<SalesChartSVGProps> = ({ data = [] }) => {
    // 데이터가 없으면 기본 차트 표시
    if (!data.length) {
        return (
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                style={{ position: "absolute", top: 0, left: 0 }}
            >
                <defs>
                    <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ef9942", stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: "#ef9942", stopOpacity: 0.05 }} />
                    </linearGradient>
                </defs>
                {/* 기본 플랫 라인 */}
                <path
                    d="M20 160 L380 160"
                    stroke="#ef9942"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M20 160 L380 160 L380 180 L20 180 Z"
                    fill="url(#salesGradient)"
                />
            </svg>
        );
    }

    // 데이터 정규화 (최대값 기준으로 0-100 사이 값으로 변환)
    const maxAmount = Math.max(...data.map(item => item.amount));
    const minAmount = Math.min(...data.map(item => item.amount));

    // 차트 영역 설정
    const chartWidth = 360; // 좌우 여백 20씩
    const chartHeight = 120; // 상하 여백
    const pointSpacing = chartWidth / (data.length - 1);

    // 데이터 포인트 생성
    const points = data.map((item, index) => {
        const x = 20 + (index * pointSpacing);

        // Y 좌표 계산 (상단이 0, 하단이 180인 SVG 좌표계)
        let y;
        if (maxAmount === minAmount) {
            // 모든 값이 같으면 중간에 배치
            y = 100;
        } else {
            // 정규화: 높은 값일수록 위쪽(낮은 Y값)에 배치
            const normalized = (item.amount - minAmount) / (maxAmount - minAmount);
            y = 160 - (normalized * chartHeight); // 160에서 40까지의 범위
        }

        return { x, y, amount: item.amount };
    });

    // SVG Path 생성 (곡선)
    const createSmoothPath = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return "";

        let path = `M${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];

            // 부드러운 곡선을 위한 제어점 계산
            const controlPointX = prev.x + (curr.x - prev.x) * 0.5;

            path += ` Q${controlPointX} ${prev.y} ${curr.x} ${curr.y}`;
        }

        return path;
    };

    const linePath = createSmoothPath(points);

    // 그라데이션 채우기를 위한 Path (아래쪽 닫힌 영역)
    const fillPath = linePath + ` L${points[points.length - 1].x} 180 L${points[0].x} 180 Z`;

    // 금액을 간단하게 표시하는 함수 (천원, 만원 단위)
    const formatAmount = (amount: number) => {
        if (amount === 0) return "0";
        if (amount >= 10000000) return `${Math.round(amount / 10000000)}천만`;
        if (amount >= 1000000) return `${Math.round(amount / 1000000)}백만`;
        if (amount >= 10000) return `${Math.round(amount / 10000)}만`;
        if (amount >= 1000) return `${Math.round(amount / 1000)}천`;
        return amount.toString();
    };

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 200"
            style={{ position: "absolute", top: 0, left: 0 }}
        >
            <defs>
                <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#ef9942", stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: "#ef9942", stopOpacity: 0.05 }} />
                </linearGradient>
            </defs>

            {/* 그라데이션 채우기 */}
            <path
                d={fillPath}
                fill="url(#salesGradient)"
            />

            {/* 메인 라인 */}
            <path
                d={linePath}
                stroke="#ef9942"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* 데이터 포인트 및 금액 표시 */}
            {points.map((point, index) => {
                const showLabel = point.amount > 0; // 0원이 아닐 때만 라벨 표시
                const labelY = point.y - 15; // 포인트 위쪽에 라벨 배치

                return (
                    <g key={index}>
                        {/* 포인트 원 */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={showLabel ? "5" : "3"}
                            fill="#ef9942"
                            stroke="#ffffff"
                            strokeWidth="2"
                        />

                        {/* 금액 라벨 (0원이 아닐 때만) */}
                        {showLabel && (
                            <>
                                {/* 라벨 배경 */}
                                <rect
                                    x={point.x - 20}
                                    y={labelY - 8}
                                    width="40"
                                    height="16"
                                    rx="8"
                                    fill="#ef9942"
                                    fillOpacity="0.9"
                                />

                                {/* 금액 텍스트 */}
                                <text
                                    x={point.x}
                                    y={labelY + 3}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#ffffff"
                                    fontWeight="600"
                                >
                                    ₩{formatAmount(point.amount)}
                                </text>
                            </>
                        )}

                        {/* 호버 영역 (상세 정보) */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                        >
                            <title>
                                {data[index]?.displayDate} - ₩{point.amount.toLocaleString()}
                            </title>
                        </circle>
                    </g>
                );
            })}

            {/* 매출이 있는 날의 수직 가이드 라인 (선택사항) */}
            {points.map((point, index) => {
                if (point.amount > 0) {
                    return (
                        <line
                            key={`guide-${index}`}
                            x1={point.x}
                            y1={point.y}
                            x2={point.x}
                            y2="175"
                            stroke="#ef9942"
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            strokeDasharray="2,2"
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
};