// src/components/SellerDashboard/settlement/components/MonthlySettlementStatus.tsx
import { Box, Typography, Button, useTheme, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { settlementApi } from '@/service/SettlementAPI';
import { transformMonthlyStatus } from '@/service/SettlementTransformer';

interface MonthlySettlementStatusProps {
    onDownloadReport: () => void;
}

interface MonthlyStatusData {
    totalCount: number;
    totalMonthlyAmount: number;
    completedCount: number;
    completedAmount: number;
    inProgressCount: number;
    inProgressAmount: number;
    completionRate: number;
}

const MonthlySettlementStatus = ({ onDownloadReport }: MonthlySettlementStatusProps) => {
    const theme = useTheme();

    // 상태 관리
    const [monthlyData, setMonthlyData] = useState<MonthlyStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 이번달 정산 현황 조회
    const fetchMonthlyStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await settlementApi.getMonthlySettlementStatus();
            const transformedData = transformMonthlyStatus(response);
            setMonthlyData(transformedData);

        } catch (error: any) {
            console.error('월별 정산 현황 조회 오류:', error);
            setError('월별 정산 현황을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 데이터 로딩
    useEffect(() => {
        fetchMonthlyStatus();
    }, [fetchMonthlyStatus]);

    // 로딩 상태
    if (loading) {
        return (
            <Box sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        이번달 정산 현황을 불러오는 중...
                    </Typography>
                </Box>
            </Box>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <Box sx={{ mb: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="outlined"
                    onClick={fetchMonthlyStatus}
                    sx={{ mt: 1 }}
                >
                    다시 시도
                </Button>
            </Box>
        );
    }

    // 데이터가 없는 경우
    if (!monthlyData) {
        return (
            <Box sx={{ mb: 3 }}>
                <Alert severity="info">
                    이번달 정산 데이터가 없습니다.
                </Alert>
            </Box>
        );
    }

    const {
        totalCount,
        totalMonthlyAmount,
        completedCount,
        completedAmount,
        inProgressCount,
        inProgressAmount,
        completionRate
    } = monthlyData;

    // 정산 확정 금액 (완료 + 처리중)
    const confirmedAmount = completedAmount + inProgressAmount;

    // 각 상태별 건수 계산
    const statusCounts = {
        confirmed: completedCount + inProgressCount,
        completed: completedCount,
        processing: inProgressCount
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{
                backgroundColor: 'rgba(232, 152, 48, 0.08)',
                p: 3,
                borderRadius: 2,
                border: `1px solid rgba(232, 152, 48, 0.2)`,
                mb: 2
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '20px', color: theme.palette.primary.main }}>
                        calendar_month
                    </span>
                    이번달 정산 현황 ({new Date().getMonth() + 1}월)
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {/* 이번달 총 정산금액 */}
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                이번달 총 정산금액
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.primary.main
                                }}
                            >
                                ₩{totalMonthlyAmount.toLocaleString()}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.75rem'
                                }}
                            >
                                총 {totalCount}건
                            </Typography>
                        </Box>

                        {/* 정산 확정 금액 */}
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '14px', color: '#48bb78' }}>
                                    verified
                                </span>
                                정산 확정 금액
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: '#48bb78'
                                }}
                            >
                                ₩{confirmedAmount.toLocaleString()}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#48bb78',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}
                            >
                                {statusCounts.confirmed}건 (완료 {statusCounts.completed}건 + 처리중 {statusCounts.processing}건)
                            </Typography>
                        </Box>
                    </Box>

                    {/* 이번달 정산내역 영수증 다운로드 버튼 */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onDownloadReport}
                        sx={{
                            borderRadius: 6,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        startIcon={
                            <span className="material-icons" style={{ fontSize: '18px' }}>
                                receipt
                            </span>
                        }
                    >
                        이번달 정산내역 영수증
                    </Button>
                </Box>

                {/* 정산 확정률 표시 */}
                <Box sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid rgba(232, 152, 48, 0.2)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            정산 확정률:
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main
                            }}
                        >
                            {completionRate.toFixed(1)}%
                        </Typography>
                    </Box>

                    {/* 프로그레스 바 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                        <Box sx={{
                            flex: 1,
                            height: 8,
                            backgroundColor: theme.palette.grey[200],
                            borderRadius: 4,
                            overflow: 'hidden'
                        }}>
                            <Box
                                sx={{
                                    width: `${completionRate}%`,
                                    height: '100%',
                                    backgroundColor: '#48bb78',
                                    borderRadius: 4,
                                    transition: 'width 0.3s ease'
                                }}
                            />
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem',
                                minWidth: 'fit-content'
                            }}
                        >
                            {statusCounts.confirmed}/{totalCount}건
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 정산 프로세스 안내 */}
            <Box sx={{
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                border: `1px solid ${theme.palette.grey[200]}`
            }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '16px', color: theme.palette.primary.main }}>
                        info
                    </span>
                    정산 프로세스 안내
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                    }}
                >
                    • <strong>처리중:</strong> 주문 후 7일 경과 - 정산 확정됨<br/>
                    • <strong>정산완료:</strong> 매월 1일 자동 정산 처리됨<br/>
                    • 현재 시스템에서는 배송완료 후 7일이 지난 주문만 정산 대상입니다.
                </Typography>
            </Box>
        </Box>
    );
};

export default MonthlySettlementStatus;