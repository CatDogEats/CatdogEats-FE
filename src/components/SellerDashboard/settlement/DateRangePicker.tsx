// src/components/SellerDashboard/settlement/components/DateRangePicker.tsx
import {
    Box,
    Typography,
    Button,
    IconButton,
    Popover,
    Grid,
    Divider,
    useTheme
} from '@mui/material';
import { useState } from 'react';

// 날짜 유틸리티 함수들 (시간대 문제 해결)
const formatDate = (date: Date): string => {
    // 로컬 시간대를 기준으로 YYYY-MM-DD 형식 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // YYYY-MM-DD 형식의 문자열을 로컬 날짜로 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;

    // 로컬 시간대로 Date 객체 생성 (UTC 변환 방지)
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

export interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onDateChange: (startDate: string, endDate: string) => void;
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

const DateRangePicker = ({
                             startDate,
                             endDate,
                             onDateChange,
                             open,
                             anchorEl,
                             onClose
                         }: DateRangePickerProps) => {
    const theme = useTheme();
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const currentDate = new Date(startDate);

        while (days.length < 42) { // 6주 표시
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date): boolean => {
        return date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear();
    };

    const isSelected = (date: Date): boolean => {
        const dateStr = formatDate(date);
        return dateStr === tempStartDate || dateStr === tempEndDate;
    };

    const isInRange = (date: Date): boolean => {
        if (!tempStartDate || !tempEndDate) return false;
        const start = parseDate(tempStartDate);
        const end = parseDate(tempEndDate);
        if (!start || !end) return false;
        return date >= start && date <= end;
    };

    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);

        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            setTempStartDate(dateStr);
            setTempEndDate('');
        } else if (tempStartDate && !tempEndDate) {
            const start = parseDate(tempStartDate);
            if (start && date >= start) {
                setTempEndDate(dateStr);
            } else {
                setTempStartDate(dateStr);
                setTempEndDate('');
            }
        }
    };

    const handleApply = () => {
        console.log('📅 DateRangePicker - 적용 전:', { tempStartDate, tempEndDate });
        onDateChange(tempStartDate, tempEndDate);
        console.log('📅 DateRangePicker - 적용 후 전달:', { startDate: tempStartDate, endDate: tempEndDate });
        onClose();
    };

    const handleReset = () => {
        setTempStartDate('');
        setTempEndDate('');
    };

    const handleQuickSelect = (days: number) => {
        const end = new Date();
        const start = addDays(end, -days);

        const startDateStr = formatDate(start);
        const endDateStr = formatDate(end);

        console.log('📅 빠른 선택:', { days, start, end, startDateStr, endDateStr });

        setTempStartDate(startDateStr);
        setTempEndDate(endDateStr);
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(addMonths(currentMonth, direction));
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            PaperProps={{
                sx: {
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    minWidth: 320,
                    maxWidth: 400
                }
            }}
        >
            <Box>
                {/* 빠른 선택 버튼들 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        빠른 선택
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {[
                            { label: '오늘', days: 0 },
                            { label: '7일', days: 7 },
                            { label: '30일', days: 30 },
                            { label: '90일', days: 90 }
                        ].map((item) => (
                            <Button
                                key={item.label}
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickSelect(item.days)}
                                sx={{
                                    minWidth: 'auto',
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.75rem',
                                    borderColor: theme.palette.grey[300],
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 월 네비게이션 */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <IconButton
                        onClick={() => navigateMonth(-1)}
                        size="small"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        <span className="material-icons">chevron_left</span>
                    </IconButton>

                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                    </Typography>

                    <IconButton
                        onClick={() => navigateMonth(1)}
                        size="small"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        <span className="material-icons">chevron_right</span>
                    </IconButton>
                </Box>

                {/* 요일 헤더 */}
                <Grid container spacing={0} sx={{ mb: 1 }}>
                    {weekDays.map((day) => (
                        <Grid size={12/7} key={day}>
                            <Box sx={{
                                textAlign: 'center',
                                py: 1,
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {day}
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* 날짜 그리드 */}
                <Grid container spacing={0}>
                    {daysInMonth.map((date, index) => {
                        const isCurrentMonthDate = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        const isSelectedDate = isSelected(date);
                        const isInRangeDate = isInRange(date);

                        return (
                            <Grid size={12/7} key={index}>
                                <Button
                                    onClick={() => handleDateClick(date)}
                                    sx={{
                                        width: '100%',
                                        height: 36,
                                        minWidth: 'auto',
                                        p: 0,
                                        borderRadius: 1,
                                        fontSize: '0.75rem',
                                        fontWeight: isSelectedDate ? 600 : 400,
                                        color: !isCurrentMonthDate
                                            ? theme.palette.text.disabled
                                            : isSelectedDate
                                                ? 'white'
                                                : isTodayDate
                                                    ? theme.palette.primary.main
                                                    : theme.palette.text.primary,
                                        backgroundColor: isSelectedDate
                                            ? theme.palette.primary.main
                                            : isInRangeDate
                                                ? 'rgba(232, 152, 48, 0.1)'
                                                : 'transparent',
                                        border: isTodayDate && !isSelectedDate
                                            ? `1px solid ${theme.palette.primary.main}`
                                            : 'none',
                                        '&:hover': {
                                            backgroundColor: isSelectedDate
                                                ? theme.palette.primary.dark
                                                : 'rgba(232, 152, 48, 0.1)'
                                        }
                                    }}
                                >
                                    {date.getDate()}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* 선택된 날짜 표시 */}
                {(tempStartDate || tempEndDate) && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            선택된 기간
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {tempStartDate || '시작일'} ~ {tempEndDate || '종료일'}
                        </Typography>
                    </Box>
                )}

                {/* 액션 버튼들 */}
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 3,
                    justifyContent: 'flex-end'
                }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleReset}
                        sx={{
                            borderColor: theme.palette.grey[300],
                            color: theme.palette.text.secondary
                        }}
                    >
                        초기화
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleApply}
                        disabled={!tempStartDate}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        적용
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
};

export default DateRangePicker;