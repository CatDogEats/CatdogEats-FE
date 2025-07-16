// src/components/SellerDashboard/settlement/components/MonthlyReceiptManager.tsx
import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Button,
    useTheme,
    Card,
    CardContent,
    SelectChangeEvent,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import MonthlyReceiptModal from './MonthlyReceiptModal';
import { settlementApi } from '@/service/settlement/SettlementAPI.ts';
import { downloadBlob, generateCsvFileName } from '@/service/settlement/SettlementTransformer.ts';

const MonthlyReceiptManager: React.FC = () => {
    const theme = useTheme();

    // 상태 관리
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [modalOpen, setModalOpen] = useState(false);
    const [downloadingCsv, setDownloadingCsv] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // 년도 옵션 생성 (2020 ~ 현재년도)
    const generateYearOptions = (): number[] => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = 2020; year <= currentYear; year++) {
            years.push(year);
        }
        return years.reverse(); // 최신년도부터 표시
    };

    // 월 옵션 생성 (1 ~ 12월)
    const generateMonthOptions = (): number[] => {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    };

    // 현재 선택된 년월을 YYYY-MM 형식으로 변환
    const getTargetMonth = (): string => {
        return `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
    };

    // 년도 변경 핸들러
    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setSelectedYear(event.target.value as number);
    };

    // 월 변경 핸들러
    const handleMonthChange = (event: SelectChangeEvent<number>) => {
        setSelectedMonth(event.target.value as number);
    };

    // 미리보기 모달 열기
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    // 미리보기 모달 닫기
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    // CSV 다운로드
    const handleDownloadCsv = useCallback(async () => {
        try {
            setDownloadingCsv(true);
            const targetMonth = getTargetMonth();

            const blob = await settlementApi.downloadMonthlySettlementCsv(targetMonth);
            const fileName = generateCsvFileName(targetMonth);
            downloadBlob(blob, fileName);

            setSnackbarMessage(`${selectedYear}년 ${selectedMonth}월 정산내역 CSV 파일이 다운로드되었습니다.`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

        } catch (error: any) {
            console.error('CSV 다운로드 오류:', error);

            let errorMessage = 'CSV 다운로드 중 오류가 발생했습니다.';
            if (error.response?.status === 404) {
                errorMessage = `${selectedYear}년 ${selectedMonth}월 정산 데이터가 없습니다.`;
            } else if (error.response?.status === 500) {
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }

            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setDownloadingCsv(false);
        }
    }, [selectedYear, selectedMonth]);

    // 스낵바 닫기
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // 선택된 월 레이블 생성
    const getSelectedMonthLabel = (): string => {
        return `${selectedYear}년 ${selectedMonth}월`;
    };

    // 현재 월과 동일한지 확인
    const isCurrentMonth = (): boolean => {
        const now = new Date();
        return selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
    };

    const yearOptions = generateYearOptions();
    const monthOptions = generateMonthOptions();

    return (
        <>
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: `1px solid ${theme.palette.grey[200]}`,
                mb: 3
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '20px', color: theme.palette.primary.main }}>
                            receipt_long
                        </span>
                        월별 정산내역 조회 및 다운로드
                    </Typography>

                    {/* 년월 선택 */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, minWidth: 'fit-content' }}>
                            조회 기간:
                        </Typography>

                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                                value={selectedYear}
                                onChange={handleYearChange}
                                sx={{
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }
                                }}
                            >
                                {yearOptions.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}년
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 80 }}>
                            <Select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                sx={{
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }
                                }}
                            >
                                {monthOptions.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month}월
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {isCurrentMonth() && (
                            <Box sx={{
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: 'rgba(232, 152, 48, 0.1)',
                                borderRadius: 1,
                                border: `1px solid rgba(232, 152, 48, 0.3)`
                            }}>
                                <Typography variant="caption" sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}>
                                    이번 달
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* 선택된 기간 표시 */}
                    <Box sx={{
                        p: 2,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        mb: 3
                    }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                            선택된 조회 기간
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {getSelectedMonthLabel()} 정산내역
                        </Typography>
                    </Box>

                    {/* 액션 버튼들 */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleOpenModal}
                            sx={{
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 3,
                                minWidth: 160,
                                '&:hover': {
                                    borderColor: theme.palette.primary.dark,
                                    backgroundColor: 'rgba(232, 152, 48, 0.04)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 8px rgba(232, 152, 48, 0.2)'
                                }
                            }}
                            startIcon={
                                <span className="material-icons" style={{ fontSize: '18px' }}>
                                    preview
                                </span>
                            }
                        >
                            미리보기
                        </Button>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleDownloadCsv}
                            disabled={downloadingCsv}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 3,
                                minWidth: 160,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 16px rgba(232, 152, 48, 0.3)'
                                },
                                '&:disabled': {
                                    backgroundColor: theme.palette.grey[300]
                                }
                            }}
                            startIcon={
                                downloadingCsv ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <span className="material-icons" style={{ fontSize: '18px' }}>
                                        file_download
                                    </span>
                                )
                            }
                        >
                            {downloadingCsv ? '다운로드 중...' : 'CSV 다운로드'}
                        </Button>
                    </Box>

                    {/* 안내 메시지 */}
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: 'rgba(49, 130, 206, 0.05)',
                        borderRadius: 2,
                        border: `1px solid rgba(49, 130, 206, 0.2)`
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1
                            }}
                        >
                            <span className="material-icons" style={{
                                fontSize: '16px',
                                color: '#3182ce',
                                marginTop: '2px'
                            }}>
                                info
                            </span>
                            <Box>
                                <strong>이용 안내:</strong><br/>
                                • <strong>미리보기:</strong> 선택한 월의 정산 내역을 표 형태로 확인할 수 있습니다.<br/>
                                • <strong>CSV 다운로드:</strong> 선택한 월의 전체 정산 내역을 엑셀에서 열 수 있는 파일로 저장합니다.<br/>
                                • 정산 데이터는 배송완료 후 7일이 경과한 주문만 포함됩니다.
                            </Box>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* 월별 영수증 모달 */}
            <MonthlyReceiptModal
                open={modalOpen}
                onClose={handleCloseModal}
                targetMonth={getTargetMonth()}
            />

            {/* 스낵바 (성공/실패 메시지) */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MonthlyReceiptManager;