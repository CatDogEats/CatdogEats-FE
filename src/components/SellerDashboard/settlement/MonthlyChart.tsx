// src/components/SellerDashboard/settlement/components/MonthlyChart.tsx
import React from 'react';
import {
    Box,
    Typography,
    useTheme,
    IconButton,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';

// settlement.types.ts의 SalesData 타입과 일치하도록 
interface MonthlyChartData {
    month: string;
    amount: number;
    originalAmount?: number; // 실제 금액 (툴팁용) - 선택적 속성으로 변경
    orderCount?: number; // 주문수 - 선택적 속성으로 변경
    totalQuantity?: number; // 판매수량 - 선택적 속성으로 변경
}

interface MonthlyChartProps {
    data: MonthlyChartData[];
    selectedYear?: number;
    onYearChange?: (year: number) => void;
    availableYears?: number[];
    loading?: boolean;
    yearTotalAmount?: number; // 년도 총 매출
    yearTotalQuantity?: number; // 년도 총 판매수량
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({
                                                       data,
                                                       selectedYear = new Date().getFullYear(),
                                                       onYearChange,
                                                       availableYears = [2022, 2023, 2024, 2025],
                                                       loading = false,
                                                       yearTotalAmount = 0,
                                                       yearTotalQuantity = 0
                                                   }) => {
    const theme = useTheme();

    const handleYearChange = (event: SelectChangeEvent) => {
        const year = parseInt(event.target.value);
        onYearChange?.(year);
    };

    const handlePrevYear = () => {
        const prevYear = selectedYear - 1;
        if (availableYears.includes(prevYear)) {
            onYearChange?.(prevYear);
        }
    };

    const handleNextYear = () => {
        const nextYear = selectedYear + 1;
        if (availableYears.includes(nextYear)) {
            onYearChange?.(nextYear);
        }
    };

    // : 금액 포맷팅 함수 (일반적인 표시용)
    const formatAmount = (amount: number): string => {
        if (amount >= 100000000) {
            return `${Math.floor(amount / 100000000)}억원`;
        } else if (amount >= 10000) {
            return `${Math.floor(amount / 10000)}만원`;
        } else if (amount >= 1000) {
            return `${Math.floor(amount / 1000)}천원`;
        } else {
            return `${amount}원`;
        }
    };

    const formatBarAmount = (amount: number): string => {
        // amount가 이미 천원 단위로 변환된 값이므로
        if (amount >= 10000) {  // 1천만원 이상 (천원단위로는 10000 이상)
            return `${Math.round(amount / 10000)}억원`;
        } else if (amount >= 1000) {  // 100만원 이상 (천원단위로는 1000 이상)
            return `${Math.round(amount / 10)}만원`;  // 3022 → 302만원
        } else if (amount >= 1) {  // 1천원 이상
            return `${amount}천원`;
        } else {
            return '';
        }
    };

    // 수량 포맷팅 함수
    const formatQuantity = (quantity: number): string => {
        if (quantity >= 10000) {
            return `${Math.floor(quantity / 10000)}만개`;
        } else if (quantity >= 1000) {
            return `${Math.floor(quantity / 1000)}천개`;
        } else {
            return `${quantity}개`;
        }
    };

    // 🔧 추가: 안전한 데이터 접근을 위한 헬퍼 함수들
    const getOriginalAmount = (item: MonthlyChartData): number => {
        return item.originalAmount ?? item.amount;
    };

    const getOrderCount = (item: MonthlyChartData): number => {
        return item.orderCount ?? 0;
    };

    const getTotalQuantity = (item: MonthlyChartData): number => {
        return item.totalQuantity ?? 0;
    };

    // : 로딩 상태 - 고정 높이 적용
    if (loading) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 헤더 영역 유지 */}
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
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >

                    </Typography>
                </Box>

                {/* 로딩 영역 고정 높이 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 600, // 고정 높이
                    flexDirection: 'column',
                    color: theme.palette.text.secondary
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: `3px solid ${theme.palette.grey[200]}`,
                        borderTop: `3px solid ${theme.palette.primary.main}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px'
                    }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        매출 데이터를 불러오는 중...
                    </Typography>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </Box>
            </Box>
        );
    }

    //  데이터 상태 - 고정 높이 적용
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 헤더 영역 유지 */}
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
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <span
                            className="material-icons"
                            style={{
                                fontSize: '20px',
                                color: theme.palette.primary.main
                            }}
                        >
                            trending_up
                        </span>
                        기간별 매출 분석
                    </Typography>

                    {/* 년도 선택 필터 유지 */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <IconButton
                            size="small"
                            onClick={handlePrevYear}
                            disabled={!availableYears.includes(selectedYear - 1)}
                            sx={{
                                color: theme.palette.text.secondary,
                                border: `1px solid ${theme.palette.grey[300]}`,
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main
                                }
                            }}
                        >
                            <span className="material-icons">chevron_left</span>
                        </IconButton>

                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                                value={selectedYear.toString()}
                                onChange={handleYearChange}
                                sx={{
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: theme.palette.text.primary
                                    }
                                }}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}년
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <IconButton
                            size="small"
                            onClick={handleNextYear}
                            disabled={!availableYears.includes(selectedYear + 1)}
                            sx={{
                                color: theme.palette.text.secondary,
                                border: `1px solid ${theme.palette.grey[300]}`,
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main
                                }
                            }}
                        >
                            <span className="material-icons">chevron_right</span>
                        </IconButton>
                    </Box>
                </Box>

                {/* 빈 상태 영역 고정 높이 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 600, // 고정 높이
                    flexDirection: 'column',
                    color: theme.palette.text.secondary
                }}>
                    <span
                        className="material-icons"
                        style={{
                            fontSize: '64px',
                            color: theme.palette.grey[200],
                            marginBottom: '16px'
                        }}
                    >
                        trending_up
                    </span>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {selectedYear}년 매출 데이터가 없습니다.
                    </Typography>
                    <Typography variant="body2">
                        다른 년도를 선택해보세요.
                    </Typography>
                </Box>
            </Box>
        );
    }

    const maxAmount = Math.max(...data.map(item => item.amount));

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 - 년도 선택 */}
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
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >


                </Typography>

                {/* 년도 선택 필터 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <IconButton
                        size="small"
                        onClick={handlePrevYear}
                        disabled={!availableYears.includes(selectedYear - 1)}
                        sx={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.grey[300]}`,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        <span className="material-icons">chevron_left</span>
                    </IconButton>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                            value={selectedYear.toString()}
                            onChange={handleYearChange}
                            sx={{
                                '& .MuiSelect-select': {
                                    py: 1,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: theme.palette.text.primary
                                }
                            }}
                        >
                            {availableYears.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}년
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton
                        size="small"
                        onClick={handleNextYear}
                        disabled={!availableYears.includes(selectedYear + 1)}
                        sx={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.grey[300]}`,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        <span className="material-icons">chevron_right</span>
                    </IconButton>
                </Box>
            </Box>

            {/* 선택된 년도 정보 및 총계 */}
            <Box sx={{
                px: 3,
                py: 2,
                backgroundColor: 'rgba(232, 152, 48, 0.05)',
                borderBottom: `1px solid rgba(232, 152, 48, 0.1)`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem'
                    }}
                >
                    <span
                        className="material-icons"
                        style={{
                            fontSize: '16px',
                            color: theme.palette.primary.main
                        }}
                    >
                        calendar_month
                    </span>
                    선택된 기간: {selectedYear}년 전체
                </Typography>

                {/* 년도 총계 정보 */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                            총 매출액
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {formatAmount(yearTotalAmount)}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                            총 판매수량
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                            {formatQuantity(yearTotalQuantity)}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 차트 영역 고정 높이 */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-between',
                gap: 1.5,
                height: 400, // 고정 높이
                px: 3,
                py: 2,
                backgroundColor: theme.palette.background.paper
            }}>



                {data.map((item, index) => {
                    const height = maxAmount > 0 ? (item.amount / maxAmount) * 300 : 0;

                    //  : 안전한 데이터 접근
                    const originalAmount = getOriginalAmount(item);
                    const orderCount = getOrderCount(item);
                    const totalQuantity = getTotalQuantity(item);

                    return (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                gap: 1,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                '&:hover': {
                                    '& .chart-bar': {
                                        transform: 'scaleY(1.05)',
                                        backgroundColor: theme.palette.primary.dark,
                                        boxShadow: '0 4px 12px rgba(232, 152, 48, 0.4)'
                                    },
                                    '& .chart-amount': {
                                        color: theme.palette.primary.dark,
                                        transform: 'scale(1.1)'
                                    },
                                    '& .hover-tooltip': {
                                        opacity: 1,
                                        visibility: 'visible'
                                    }
                                }
                            }}
                            title={`${item.month}: ${formatAmount(originalAmount)} / 주문 ${orderCount}건 / 판매 ${totalQuantity}개`}
                        >
                            {/* 호버 툴팁 */}
                            <Box
                                className="hover-tooltip"
                                sx={{
                                    position: 'absolute',
                                    top: -80,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: 2,
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    opacity: 0,
                                    visibility: 'hidden',
                                    transition: 'all 0.3s ease',
                                    zIndex: 10,
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        border: '4px solid transparent',
                                        borderTopColor: 'rgba(0,0,0,0.8)'
                                    }
                                }}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
                                        {formatAmount(originalAmount)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
                                        주문 {orderCount}건 / 판매 {totalQuantity}개
                                    </Typography>
                                </Box>
                            </Box>

                            {/*  막대 위 금액 표시 */}
                            <Typography
                                className="chart-amount"
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    minHeight: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    mb: 0.5
                                }}
                            >
                                {formatBarAmount(item.amount)}
                            </Typography>

                            {/* 🔧 제거: 주문수 표시 삭제 (호버 툴팁에서만 표시) */}

                            {/* 바 차트 */}
                            <Box
                                className="chart-bar"
                                sx={{
                                    width: '100%',
                                    maxWidth: 32,
                                    height: `${Math.max(height, 8)}px`,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    boxShadow: '0 2px 6px rgba(232, 152, 48, 0.2)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '30%',
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                                        borderRadius: '4px 4px 0 0'
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '20%',
                                        background: 'linear-gradient(0deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
                                        borderRadius: '0 0 4px 4px'
                                    }
                                }}
                            />

                            {/* 월 표시 */}
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    minHeight: '16px',
                                    mt: 0.5
                                }}
                            >
                                {item.month}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default MonthlyChart;