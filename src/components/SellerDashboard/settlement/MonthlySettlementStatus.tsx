// src/components/SellerDashboard/settlement/components/MonthlySettlementStatus.tsx
import { Box, Typography, useTheme, CircularProgress, Alert, Card, CardContent, Grid } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { settlementApi } from '@/service/SettlementAPI';
import { transformMonthlyStatus } from '@/service/SettlementTransformer';

// Props 인터페이스에서 onDownloadReport 제거
interface MonthlySettlementStatusProps {
    // onDownloadReport 제거됨
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

const MonthlySettlementStatus = ({}: MonthlySettlementStatusProps) => {
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
                minHeight: '120px'
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
        totalMonthlyAmount
    } = monthlyData;

    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={3}>
                {/* 이번달 정산 현황 카드 */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{
                        borderRadius: 3,
                        border: `1px solid rgba(232, 152, 48, 0.2)`,
                        background: 'linear-gradient(135deg, rgba(232, 152, 48, 0.05) 0%, rgba(232, 152, 48, 0.1) 100%)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(232, 152, 48, 0.2)'
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '1.125rem'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '20px', color: theme.palette.primary.main }}>
                                    calendar_month
                                </span>
                                이번달 정산 현황 ({new Date().getMonth() + 1}월)
                            </Typography>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.875rem',
                                        mb: 1
                                    }}
                                >
                                    이번달 총 정산금액
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.primary.main,
                                        mb: 0.5,
                                        fontSize: { xs: '1.75rem', sm: '2rem' }
                                    }}
                                >
                                    ₩{totalMonthlyAmount.toLocaleString()}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    총 {totalCount}건
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 정산 프로세스 안내 카드 */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '1.125rem'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '20px', color: theme.palette.primary.main }}>
                                    info
                                </span>
                                정산 프로세스 안내
                            </Typography>

                            <Box sx={{ space: 1.5 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    mb: 1.5
                                }}>
                                    <Box sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#ed8936',
                                        mt: 0.75,
                                        flexShrink: 0
                                    }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        <strong style={{ color: theme.palette.text.primary }}>처리중:</strong> 배송완료 후 7일 경과 시 정산 확정
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    mb: 1.5
                                }}>
                                    <Box sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#48bb78',
                                        mt: 0.75,
                                        flexShrink: 0
                                    }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        <strong style={{ color: theme.palette.text.primary }}>정산완료:</strong> 매월 1일 자동 정산 처리
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: `1px solid ${theme.palette.grey[200]}`
                                }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.75rem',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        💡 배송완료 후 7일이 지난 주문만 정산 대상입니다.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MonthlySettlementStatus;