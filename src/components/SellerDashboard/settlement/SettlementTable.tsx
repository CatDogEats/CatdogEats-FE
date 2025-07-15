// src/components/SellerDashboard/settlement/SettlementTable.tsx
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    useTheme,
    TextField,
    InputAdornment,
    IconButton,
    Pagination,
    Stack,
    TableFooter,
    CircularProgress
} from '@mui/material';
import { useState } from 'react';
import { SettlementTableProps, SettlementFilters, SettlementItem } from './types/settlement.types.ts';

// 컴포넌트 임포트
import DateRangePicker from './DateRangePicker';
import SettlementSummary from './SettlementSummary';
import MonthlySettlementStatus from './MonthlySettlementStatus';

interface SettlementTablePropsExtended extends SettlementTableProps {
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    loading?: boolean;
    onDownloadReport?: () => void;
    summary?: {
        totalCount: number;
        totalSettlementAmount: number;
        completedAmount: number;
        inProgressAmount: number;
        completionRate: number;
    };
}

const SettlementTable = ({
                             data,
                             filters,
                             onFiltersChange,
                             totalCount = 0,
                             currentPage = 1,
                             pageSize = 10,
                             onPageChange,
                             loading = false,
                             onDownloadReport,
                             summary
                         }: SettlementTablePropsExtended) => {
    const theme = useTheme();
    const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null);
    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');

    // ===== 이벤트 핸들러 =====

    const handleFilterChange = (filterKey: keyof SettlementFilters) =>
        (event: SelectChangeEvent) => {
            onFiltersChange({
                [filterKey]: event.target.value
            });
        };

    const handleDatePickerOpen = (event: React.MouseEvent<HTMLElement>) => {
        setDatePickerAnchor(event.currentTarget);
    };

    const handleDatePickerClose = () => {
        setDatePickerAnchor(null);
    };

    const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        onFiltersChange({
            startDate: newStartDate,
            endDate: newEndDate
        });
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
        onPageChange?.(newPage);
    };

    const getDateRangeLabel = (): string => {
        if (!startDate && !endDate) return '기간 선택';
        if (startDate && endDate) {
            const formatShortDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            };
            return `${formatShortDate(startDate)} ~ ${formatShortDate(endDate)}`;
        }
        if (startDate) {
            const formatShortDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            };
            return `${formatShortDate(startDate)} ~`;
        }
        return '기간 선택';
    };

    // 총 페이지 계산
    const totalPages = Math.ceil(totalCount / pageSize);

    // 현재 페이지 정산금액 계산
    const currentPageSettlementAmount = data.reduce((sum, item) => sum + item.settlementAmount, 0);

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

    // 날짜 표시 형식 (배송대기 처리 포함)
    const formatDateDisplay = (dateString: string): string => {
        if (!dateString || dateString === '배송대기') return dateString;
        return dateString; // 이미 YYYY-MM-DD 형식으로 변환되어 있음
    };

    return (
        <Box>
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: theme.palette.text.primary
                }}
            >
                정산 현황
            </Typography>

            {/* 필터 섹션 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    value={getDateRangeLabel()}
                    onClick={handleDatePickerOpen}
                    placeholder="기간 선택"
                    sx={{
                        minWidth: 250,
                        maxWidth: 300,
                        cursor: 'pointer',
                        '& .MuiInputBase-input': {
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <span
                                    className="material-icons"
                                    style={{
                                        fontSize: '18px',
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    date_range
                                </span>
                            </InputAdornment>
                        ),
                        endAdornment: startDate || endDate ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDateRangeChange('', '');
                                    }}
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    <span className="material-icons" style={{ fontSize: '16px' }}>
                                        close
                                    </span>
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filters.settlementFilter}
                        onChange={handleFilterChange('settlementFilter')}
                        displayEmpty
                    >
                        <MenuItem value="전체">전체 상태</MenuItem>
                        <MenuItem value="처리중">처리중</MenuItem>
                        <MenuItem value="정산완료">정산완료</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* 날짜 범위 선택 팝오버 */}
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateRangeChange}
                open={Boolean(datePickerAnchor)}
                anchorEl={datePickerAnchor}
                onClose={handleDatePickerClose}
            />

            {/* 결과 요약 */}
            <Box sx={{ mb: 2 }}>
                {(startDate || endDate || filters.settlementFilter !== '전체') ? (
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '16px', color: theme.palette.primary.main }}>
                            filter_alt
                        </span>
                        필터 적용됨:
                        {(startDate || endDate) && ` 기간(${getDateRangeLabel()})`}
                        {filters.settlementFilter !== '전체' && ` 상태(${filters.settlementFilter})`}
                        {' '} - 총 {totalCount}건
                    </Typography>
                ) : (
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        총 {totalCount}건의 정산 내역
                    </Typography>
                )}
            </Box>

            {/* 로딩 상태 */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* 정산 테이블 */}
            {!loading && (
                <TableContainer
                    component={Paper}
                    sx={{
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: `1px solid ${theme.palette.grey[200]}`,
                        overflowX: 'auto' // 가로 스크롤 추가 (컬럼이 많아진 경우 대비)
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 120 }}>
                                    주문번호
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 200 }}>
                                    상품명
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 100 }}>
                                    주문금액
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 80 }}>
                                    수수료
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 100 }}>
                                    정산금액
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 110 }}>
                                    주문일
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 110 }}>
                                    배송완료일
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 110 }}>
                                    정산생성일
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, minWidth: 80 }}>
                                    상태
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((item, index) => {
                                    const chipProps = getStatusChipProps(item.status);
                                    return (
                                        <TableRow
                                            key={`${item.id}-${index}`}
                                            sx={{
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: theme.palette.background.default
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(232, 152, 48, 0.05)'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{
                                                fontFamily: 'monospace',
                                                fontWeight: 500,
                                                color: theme.palette.text.primary,
                                                fontSize: '0.875rem'
                                            }}>
                                                {item.id}
                                            </TableCell>
                                            <TableCell sx={{
                                                fontWeight: 500,
                                                color: theme.palette.text.primary,
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                                       title={item.productName} // 전체 상품명을 툴팁으로 표시
                                            >
                                                {item.productName}
                                            </TableCell>
                                            <TableCell sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text.primary,
                                                fontSize: '0.875rem'
                                            }}>
                                                ₩{item.orderAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: '0.875rem'
                                            }}>
                                                ₩{item.commission.toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{
                                                fontWeight: 600,
                                                color: theme.palette.primary.main,
                                                fontSize: '0.875rem'
                                            }}>
                                                ₩{item.settlementAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formatDateDisplay(item.orderDate)}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: item.deliveryDate === '배송대기'
                                                    ? theme.palette.warning.main
                                                    : theme.palette.text.secondary,
                                                fontSize: '0.875rem',
                                                fontWeight: item.deliveryDate === '배송대기' ? 500 : 400
                                            }}>
                                                {formatDateDisplay(item.deliveryDate)}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formatDateDisplay(item.settlementDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={chipProps.label}
                                                    color={chipProps.color}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500,
                                                        minWidth: 70,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: theme.palette.text.secondary }}
                                        >
                                            {(startDate || endDate || filters.settlementFilter !== '전체')
                                                ? '선택한 조건에 해당하는 정산 내역이 없습니다.'
                                                : '정산 내역이 없습니다.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {/* 테이블 푸터 */}
                        {data.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        sx={{
                                            backgroundColor: theme.palette.grey[50],
                                            borderTop: `1px solid ${theme.palette.grey[200]}`
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            py: 1,
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)}번째 항목 (전체 {totalCount}개 중)
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                현재 페이지 정산금액:
                                                <span style={{ color: theme.palette.primary.main, marginLeft: '8px' }}>
                                                    ₩{currentPageSettlementAmount.toLocaleString()}
                                                </span>
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </TableContainer>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Stack spacing={2}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                },
                                '& .MuiPaginationItem-page.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark
                                    }
                                }
                            }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                color: theme.palette.text.secondary
                            }}
                        >
                            {currentPage} / {totalPages} 페이지
                        </Typography>
                    </Stack>
                </Box>
            )}

            {/* 전체/선택기간 정산 금액 요약 */}
            {!loading && summary && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme.palette.grey[100],
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.grey[200]}`,
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3
                }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                mb: 0.5
                            }}
                        >
                            {(startDate || endDate || filters.settlementFilter !== '전체') ? '필터 적용 총 정산 금액' : '전체 정산 금액'}:
                            <span style={{ color: theme.palette.primary.main, marginLeft: '8px' }}>
                                ₩{summary.totalSettlementAmount.toLocaleString()}
                            </span>
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            {(startDate || endDate || filters.settlementFilter !== '전체') ? (
                                `필터 조건: ${(startDate || endDate) ? `기간(${startDate || '시작일'} ~ ${endDate || '종료일'})` : ''}${filters.settlementFilter !== '전체' ? ` 상태(${filters.settlementFilter})` : ''} (${totalCount}건)`
                            ) : (
                                `전체 ${totalCount}건의 정산 내역`
                            )}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* 이번달 정산 현황 */}
            {onDownloadReport && (
                <MonthlySettlementStatus
                    onDownloadReport={onDownloadReport}
                />
            )}

            {/* 정산 분석 요약 */}
            {!loading && summary && (
                <SettlementSummary
                    data={{
                        totalAmount: summary.totalSettlementAmount,
                        completedAmount: summary.completedAmount,
                        pendingAmount: summary.inProgressAmount,
                        totalCount: summary.totalCount,
                        completedCount: Math.round(summary.totalCount * (summary.completionRate / 100)),
                        pendingCount: summary.totalCount - Math.round(summary.totalCount * (summary.completionRate / 100)),
                        completionRate: summary.completionRate
                    }}
                    dateRangeLabel={(startDate || endDate) ? getDateRangeLabel() : undefined}
                />
            )}
        </Box>
    );
};

export default SettlementTable;