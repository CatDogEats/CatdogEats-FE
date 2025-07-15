// src/components/SellerDashboard/settlement/components/MonthlyReceiptModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Pagination,
    Stack,
    useTheme,
    Divider
} from '@mui/material';
import { settlementApi } from '@/service/settlement/SettlementAPI.ts';
import { transformSettlementItem, downloadBlob, generateCsvFileName } from '@/service/settlement/SettlementTransformer.ts';
import { SettlementItem } from '@/components/SellerDashboard/settlement/types/settlement.types';
import TableSkeleton from './TableSkeleton';

interface MonthlyReceiptModalProps {
    open: boolean;
    onClose: () => void;
    targetMonth: string; // YYYY-MM 형식
}

interface MonthlyReceiptData {
    targetMonth: string;
    vendorName: string;
    businessNumber: string;
    items: SettlementItem[];
    totalElements: number;
    totalPages: number;
    summary?: {
        totalCount: number;
        totalMonthlyAmount: number; // 🔧 수정: totalAmount → totalMonthlyAmount
        completedCount: number;
        completedAmount: number;
        inProgressCount: number;
        inProgressAmount: number;
    };
}

const MonthlyReceiptModal: React.FC<MonthlyReceiptModalProps> = ({
                                                                     open,
                                                                     onClose,
                                                                     targetMonth
                                                                 }) => {
    const theme = useTheme();
    const [receiptData, setReceiptData] = useState<MonthlyReceiptData | null>(null);
    const [loading, setLoading] = useState(false); // 🔧 초기 로딩
    const [pageLoading, setPageLoading] = useState(false); // 🔧 페이지 변경 로딩
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [downloadingCsv, setDownloadingCsv] = useState(false);

    const pageSize = 20; // 모달에서는 20개씩 표시

    // 🔧 테이블 컬럼 정의 - 배송완료일, 정산생성일 추가
    const tableColumns = ['주문번호', '상품명', '주문금액', '수수료', '정산금액', '주문일', '배송완료일', '정산생성일', '상태'];

    // 월별 영수증 데이터 조회
    const fetchReceiptData = useCallback(async (page: number = 1, isPageChange: boolean = false) => {
        if (!targetMonth || !open) return;

        try {
            // 🔧 로딩 상태 분리: 초기 로딩과 페이지 변경 로딩 구분
            if (isPageChange) {
                setPageLoading(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await settlementApi.getMonthlySettlementReceipt(
                targetMonth,
                page - 1, // 백엔드는 0부터 시작
                pageSize
            );

            // 백엔드 응답을 프론트엔드 형태로 변환
            const transformedItems = response.items.content.map(transformSettlementItem);

            const newReceiptData: MonthlyReceiptData = {
                targetMonth: response.targetMonth,
                vendorName: response.vendorName,
                businessNumber: response.businessNumber,
                items: transformedItems,
                totalElements: response.items.totalElements,
                totalPages: response.items.totalPages,
                summary: response.summary ? {
                    totalCount: response.summary.totalCount,
                    totalMonthlyAmount: response.summary.totalMonthlyAmount, // 🔧 올바른 필드 매핑
                    completedCount: response.summary.completedCount,
                    completedAmount: response.summary.completedAmount,
                    inProgressCount: response.summary.inProgressCount,
                    inProgressAmount: response.summary.inProgressAmount
                } : undefined
            };

            setReceiptData(newReceiptData);

        } catch (error: any) {
            console.error('월별 영수증 데이터 조회 오류:', error);
            setError('월별 영수증 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    }, [targetMonth, open, pageSize]);

    // CSV 다운로드
    const handleDownloadCsv = useCallback(async () => {
        if (!targetMonth) return;

        try {
            setDownloadingCsv(true);
            const blob = await settlementApi.downloadMonthlySettlementCsv(targetMonth);
            const fileName = generateCsvFileName(targetMonth, receiptData?.vendorName);
            downloadBlob(blob, fileName);
        } catch (error) {
            console.error('CSV 다운로드 오류:', error);
            setError('CSV 다운로드 중 오류가 발생했습니다.');
        } finally {
            setDownloadingCsv(false);
        }
    }, [targetMonth, receiptData?.vendorName]);

    // 페이지 변경 - 🔧 스크롤 이벤트 제거
    const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
        setCurrentPage(newPage);
        fetchReceiptData(newPage, true); // 페이지 변경임을 표시
        // 🔧 스크롤 이벤트 제거 - 사용자 스크롤 위치 유지
    };

    // 상태별 Chip 속성
    const getStatusChipProps = (status: SettlementItem['status']) => {
        switch (status) {
            case '처리중':
                return { color: 'info' as const, label: '처리중' };
            case '정산완료':
                return { color: 'success' as const, label: '정산완료' };
            default:
                return { color: 'default' as const, label: status };
        }
    };

    // 모달이 열릴 때마다 데이터 조회
    useEffect(() => {
        if (open && targetMonth) {
            setCurrentPage(1);
            fetchReceiptData(1, false); // 초기 로딩
        }
    }, [open, targetMonth, fetchReceiptData]);

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!open) {
            setReceiptData(null);
            setError(null);
            setCurrentPage(1);
            setPageLoading(false);
        }
    }, [open]);

    // 월 표시 포맷팅
    const formatMonthLabel = (monthStr: string): string => {
        const [year, month] = monthStr.split('-');
        return `${year}년 ${parseInt(month)}월`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl" // 🔧 lg → xl로 변경 (컬럼 증가에 따른 너비 확장)
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <span className="material-icons" style={{ fontSize: '24px', color: theme.palette.primary.main }}>
                        receipt_long
                    </span>
                    <Typography variant="h6" fontWeight="bold">
                        {formatMonthLabel(targetMonth)} 정산내역 영수증
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'grey.500' }}
                >
                    <span className="material-icons">close</span>
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {/* 🔧 초기 로딩 상태 - 전체 화면 로딩 */}
                {loading && !receiptData && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress size={40} sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                영수증 데이터를 불러오는 중...
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* 에러 상태 */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* 🔧 데이터가 있거나 페이지 로딩 중일 때 영수증 표시 */}
                {!loading && (receiptData || pageLoading) && (
                    <>
                        {/* 영수증 헤더 정보 - 🔧 페이지 로딩 중에도 유지 */}
                        {receiptData && (
                            <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {receiptData.vendorName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    사업자 등록번호: {receiptData.businessNumber}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    발행일: {new Date().toLocaleDateString('ko-KR')}
                                </Typography>
                            </Box>
                        )}

                        {/* 요약 정보 - 🔧 페이지 로딩 중에도 유지 */}
                        {receiptData?.summary && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    정산 요약
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 3,
                                    flexWrap: 'wrap',
                                    p: 2,
                                    backgroundColor: 'rgba(232, 152, 48, 0.05)',
                                    borderRadius: 2,
                                    border: `1px solid rgba(232, 152, 48, 0.2)`
                                }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">총 건수</Typography>
                                        <Typography variant="h6" fontWeight="bold">
                                            {receiptData.summary.totalCount.toLocaleString()}건
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">총 정산금액</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            ₩{receiptData.summary.totalMonthlyAmount.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">정산완료</Typography>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#48bb78' }}>
                                            ₩{receiptData.summary.completedAmount.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">처리중</Typography>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#ed8936' }}>
                                            ₩{receiptData.summary.inProgressAmount.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* 정산 내역 테이블 */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            상세 내역
                        </Typography>

                        {/* 🔧 페이지 로딩 중일 때 스켈레톤 표시 */}
                        {pageLoading ? (
                            <TableSkeleton
                                columns={tableColumns}
                                rowCount={pageSize}
                                showHeader={true}
                            />
                        ) : (
                            <TableContainer
                                component={Paper}
                                sx={{
                                    mb: 3,
                                    maxHeight: 400,
                                    border: `1px solid ${theme.palette.grey[200]}`
                                }}
                            >
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {tableColumns.map((column, index) => (
                                                <TableCell
                                                    key={index}
                                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.grey[100] }}
                                                >
                                                    {column}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {receiptData && receiptData.items.length > 0 ? (
                                            receiptData.items.map((item, index) => {
                                                const chipProps = getStatusChipProps(item.status);
                                                return (
                                                    <TableRow
                                                        key={`${item.id}-${index}`}
                                                        sx={{
                                                            '&:nth-of-type(odd)': {
                                                                backgroundColor: theme.palette.background.default
                                                            }
                                                        }}
                                                    >
                                                        <TableCell sx={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {item.id}
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            maxWidth: 150,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '0.875rem'
                                                        }}
                                                                   title={item.productName}
                                                        >
                                                            {item.productName}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.875rem' }}>
                                                            ₩{item.orderAmount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                                            ₩{item.commission.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                            color: 'primary.main'
                                                        }}>
                                                            ₩{item.settlementAmount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                                            {item.orderDate}
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            color: item.deliveryDate === '배송대기'
                                                                ? theme.palette.warning.main
                                                                : theme.palette.text.secondary,
                                                            fontSize: '0.875rem',
                                                            fontWeight: item.deliveryDate === '배송대기' ? 500 : 400
                                                        }}>
                                                            {item.deliveryDate}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                                            {item.settlementDate}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={chipProps.label}
                                                                color={chipProps.color}
                                                                size="small"
                                                                sx={{ fontSize: '0.75rem' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}> {/* 🔧 colSpan 7 → 9로 변경 */}
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatMonthLabel(targetMonth)} 정산 내역이 없습니다.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* 페이지네이션 - 🔧 페이지 로딩 중에도 유지 */}
                        {receiptData && receiptData.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Stack spacing={2}>
                                    <Pagination
                                        count={receiptData.totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="medium"
                                        showFirstButton
                                        showLastButton
                                        disabled={pageLoading} // 🔧 페이지 로딩 중 비활성화
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                                    >
                                        {currentPage} / {receiptData.totalPages} 페이지
                                        (총 {receiptData.totalElements}건)
                                        {pageLoading && (
                                            <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                                                <CircularProgress size={12} />
                                            </Box>
                                        )}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </>
                )}

                {/* 데이터가 없는 경우 */}
                {!loading && !pageLoading && !receiptData && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            {formatMonthLabel(targetMonth)} 정산 데이터를 불러오지 못했습니다.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: 'grey.600',
                        borderColor: 'grey.300',
                        minWidth: 100
                    }}
                >
                    닫기
                </Button>
                <Button
                    onClick={handleDownloadCsv}
                    variant="contained"
                    disabled={downloadingCsv || !receiptData || receiptData.items.length === 0}
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
                        minWidth: 140
                    }}
                    startIcon={
                        downloadingCsv ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <span className="material-icons" style={{ fontSize: '18px' }}>
                                file_download
                            </span>
                        )
                    }
                >
                    {downloadingCsv ? '다운로드 중...' : 'CSV 다운로드'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MonthlyReceiptModal;