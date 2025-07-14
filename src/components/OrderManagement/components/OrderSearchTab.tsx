// src/components/OrderManagement/components/OrderSearchTab.tsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid2 as Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sync as SyncIcon,
  Clear as ClearIcon,
  Tune as TuneIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import OrderListTable from "./OrderListTable";
import type {
  SellerOrderListResponse,
  OrderStatus,
  SearchCondition,
} from "@/types/sellerOrder.types";

interface OrderSearchTabProps {
  // 검색 상태
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  searchType: string;
  onSearchTypeChange: (value: string) => void;
  statusFilter: OrderStatus | "ALL";
  onStatusFilterChange: (value: OrderStatus | "ALL") => void;

  // 액션
  onSearch: () => void;
  onReset: () => void;
  onSync: () => void;

  // 테이블 데이터
  data: SellerOrderListResponse;
  loading: boolean;
  syncLoading: boolean;

  // 테이블 이벤트
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetailView: (orderNumber: string) => void;
  onStatusChange: (orderNumber: string, currentStatus: OrderStatus) => void;
  onDeleteOrder: (orderNumber: string) => void;
}

/**
 * 검색 조건 옵션 - 프로토타입과 동일
 */
const SEARCH_CONDITIONS: {
  value: SearchCondition;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "orderNumber", label: "주문번호", icon: "🔢" },
  { value: "buyerName", label: "구매자명", icon: "👤" },
  { value: "productName", label: "상품명", icon: "📦" },
];

/**
 * 주문 상태 옵션 - 프로토타입과 동일
 */
const STATUS_OPTIONS: {
  value: OrderStatus | "ALL";
  label: string;
  color?: string;
}[] = [
  { value: "ALL", label: "전체 상태", color: BRAND_COLORS.TEXT_SECONDARY },
  {
    value: "PAYMENT_COMPLETED",
    label: "결제완료",
    color: BRAND_COLORS.PRIMARY,
  },
  { value: "PREPARING", label: "상품준비중", color: "#f57c00" },
  { value: "READY_FOR_SHIPMENT", label: "배송준비완료", color: "#1976d2" },
  { value: "IN_DELIVERY", label: "배송중", color: "#9c27b0" },
  { value: "DELIVERED", label: "배송완료", color: "#4caf50" },
  { value: "CANCELLED", label: "주문취소", color: "#f44336" },
  { value: "REFUNDED", label: "환불완료", color: "#f44336" },
];

/**
 * 기간 필터 옵션
 */
const DATE_RANGE_OPTIONS = [
  { value: "today", label: "오늘" },
  { value: "7days", label: "최근 7일" },
  { value: "30days", label: "최근 30일" },
  { value: "90days", label: "최근 90일" },
  { value: "custom", label: "직접 선택" },
];

/**
 * 주문 검색 탭 컴포넌트 - 프로토타입 완전 복원
 * - 고급 검색 필터
 * - 기간별 필터
 * - 상태별 필터
 * - 실시간 검색 결과
 */
const OrderSearchTab: React.FC<OrderSearchTabProps> = ({
  // 검색 상태
  searchKeyword,
  onSearchKeywordChange,
  searchType,
  onSearchTypeChange,
  statusFilter,
  onStatusFilterChange,

  // 액션
  onSearch,
  onReset,
  onSync,

  // 테이블 데이터
  data,
  loading,
  syncLoading,

  // 테이블 이벤트
  onPageChange,
  onRowsPerPageChange,
  onDetailView,
  onStatusChange,
  onDeleteOrder,
}) => {
  // ===== 로컬 상태 =====
  const [dateRange, setDateRange] = useState<string>("30days");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string>("basic");

  // ===== 검색 핸들러 =====
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  const handleClearSearch = () => {
    onSearchKeywordChange("");
  };

  const handleAdvancedSearch = () => {
    // 고급 검색 로직 실행
    onSearch();
  };

  const handleQuickStatusFilter = (status: OrderStatus | "ALL") => {
    onStatusFilterChange(status);
    onSearch();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box>
        {/* 검색 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, color: BRAND_COLORS.TEXT_PRIMARY }}
          >
            주문 검색 및 필터링
          </Typography>
          <Typography variant="body2" color="text.secondary">
            다양한 조건으로 원하는 주문을 빠르게 찾아보세요.
          </Typography>
        </Box>

        {/* 빠른 상태 필터 */}
        <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: BRAND_COLORS.TEXT_PRIMARY }}
            >
              빠른 상태 필터
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {STATUS_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handleQuickStatusFilter(option.value)}
                  variant={
                    statusFilter === option.value ? "filled" : "outlined"
                  }
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor:
                        statusFilter === option.value
                          ? option.color
                          : `${option.color}20`,
                    },
                    backgroundColor:
                      statusFilter === option.value
                        ? option.color
                        : "transparent",
                    borderColor: option.color,
                    color:
                      statusFilter === option.value ? "white" : option.color,
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* 기본 검색 필터 */}
        <Accordion
          expanded={expandedFilter === "basic"}
          onChange={() =>
            setExpandedFilter(expandedFilter === "basic" ? "" : "basic")
          }
          sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SearchIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                기본 검색
              </Typography>
              {searchKeyword && (
                <Chip
                  label={`"${searchKeyword}"`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3} alignItems="center">
              <Grid xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>검색 조건</InputLabel>
                  <Select
                    value={searchType}
                    onChange={(e) => onSearchTypeChange(e.target.value)}
                    label="검색 조건"
                  >
                    {SEARCH_CONDITIONS.map((condition) => (
                      <MenuItem key={condition.value} value={condition.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>{condition.icon}</span>
                          {condition.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  placeholder="검색어를 입력하세요"
                  value={searchKeyword}
                  onChange={(e) => onSearchKeywordChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchKeyword && (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={handleClearSearch}
                          sx={{ minWidth: "auto", p: 0.5 }}
                        >
                          <ClearIcon sx={{ fontSize: 18 }} />
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: BRAND_COLORS.PRIMARY,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: BRAND_COLORS.PRIMARY,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid xs={12} sm={3}>
                <Stack direction="row" spacing={1}>
                  <PrimaryButton
                    fullWidth
                    startIcon={
                      loading ? <CircularProgress size={16} /> : <SearchIcon />
                    }
                    onClick={onSearch}
                    disabled={loading}
                  >
                    {loading ? "검색중..." : "검색"}
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={onReset}
                    disabled={loading}
                    sx={{ minWidth: "auto", px: 2 }}
                  >
                    <ClearIcon />
                  </SecondaryButton>
                </Stack>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 고급 검색 필터 */}
        <Accordion
          expanded={expandedFilter === "advanced"}
          onChange={() =>
            setExpandedFilter(expandedFilter === "advanced" ? "" : "advanced")
          }
          sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TuneIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                고급 필터
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* 기간 필터 */}
              <Grid xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  주문일 기간
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <ToggleButtonGroup
                    value={dateRange}
                    exclusive
                    onChange={(_, value) => value && setDateRange(value)}
                    size="small"
                    sx={{
                      "& .MuiToggleButton-root": {
                        border: `1px solid ${BRAND_COLORS.BORDER}`,
                        "&.Mui-selected": {
                          backgroundColor: BRAND_COLORS.PRIMARY,
                          color: "white",
                          "&:hover": {
                            backgroundColor: BRAND_COLORS.PRIMARY_HOVER,
                          },
                        },
                      },
                    }}
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <ToggleButton key={option.value} value={option.value}>
                        {option.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {dateRange === "custom" && (
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <DatePicker
                        label="시작일"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <DatePicker
                        label="종료일"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>

              {/* 주문 상태 필터 */}
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>주문 상태</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      onStatusFilterChange(
                        e.target.value as OrderStatus | "ALL"
                      )
                    }
                    label="주문 상태"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: option.color,
                            }}
                          />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 고급 검색 실행 */}
              <Grid xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <SecondaryButton onClick={onReset}>
                    필터 초기화
                  </SecondaryButton>
                  <PrimaryButton
                    startIcon={
                      loading ? <CircularProgress size={16} /> : <FilterIcon />
                    }
                    onClick={handleAdvancedSearch}
                    disabled={loading}
                  >
                    {loading ? "필터링 중..." : "필터 적용"}
                  </PrimaryButton>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 검색 결과 헤더 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
            >
              검색 결과
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                총 <strong>{data.totalElements.toLocaleString()}</strong>건의
                주문을 찾았습니다
              </Typography>
              {statusFilter !== "ALL" && (
                <Chip
                  label={`상태: ${STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: BRAND_COLORS.PRIMARY,
                    color: BRAND_COLORS.PRIMARY,
                  }}
                />
              )}
              {searchKeyword && (
                <Chip
                  label={`검색어: "${searchKeyword}"`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: BRAND_COLORS.PRIMARY,
                    color: BRAND_COLORS.PRIMARY,
                  }}
                />
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              syncLoading ? <CircularProgress size={16} /> : <SyncIcon />
            }
            onClick={onSync}
            disabled={syncLoading}
            sx={{
              borderColor: BRAND_COLORS.PRIMARY,
              color: BRAND_COLORS.PRIMARY,
              "&:hover": {
                borderColor: BRAND_COLORS.PRIMARY_HOVER,
                backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
              },
            }}
          >
            {syncLoading ? "동기화 중..." : "상태 동기화"}
          </Button>
        </Box>

        {/* 검색 결과가 없을 때 안내 */}
        {data.totalElements === 0 && !loading && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              border: `1px solid ${BRAND_COLORS.BORDER}`,
              backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                검색 결과가 없습니다
              </Typography>
              <Typography variant="body2">
                다른 검색 조건을 시도해보시거나 필터를 초기화해보세요.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* 검색 결과 테이블 */}
        <OrderListTable
          data={data}
          loading={loading}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          onDetailView={onDetailView}
          onStatusChange={onStatusChange}
          onDeleteOrder={onDeleteOrder}
        />

        {/* 검색 통계 */}
        {data.totalElements > 0 && (
          <Card sx={{ mt: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                }}
              >
                검색 결과 요약
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: BRAND_COLORS.PRIMARY }}
                    >
                      {data.totalElements.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 주문 수
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#4caf50" }}
                    >
                      {
                        data.orders.filter(
                          (order) => order.orderStatus === "DELIVERED"
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      배송완료
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#f57c00" }}
                    >
                      {
                        data.orders.filter(
                          (order) => order.orderStatus === "PREPARING"
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      준비중
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#1976d2" }}
                    >
                      {
                        data.orders.filter(
                          (order) => order.orderStatus === "IN_DELIVERY"
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      배송중
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default OrderSearchTab;
