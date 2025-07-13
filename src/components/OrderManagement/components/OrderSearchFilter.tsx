// src/components/OrderManagement/components/OrderSearchFilter.tsx

import React from "react";
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import type { OrderStatus } from "@/types/sellerOrder.types";

interface OrderSearchFilterProps {
  // 검색 관련
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  searchType: string;
  onSearchTypeChange: (type: string) => void;

  // 필터 관련
  statusFilter: OrderStatus | "ALL";
  onStatusFilterChange: (status: OrderStatus | "ALL") => void;

  // 액션 관련
  onSearch: () => void;
  onReset: () => void;
  onSync: () => void;

  // 상태 관련
  loading?: boolean;
  syncLoading?: boolean;
}

// 검색 조건 옵션
const SEARCH_TYPE_OPTIONS = [
  { value: "orderNumber", label: "주문번호" },
  { value: "buyerName", label: "구매자명" },
  { value: "productName", label: "상품명" },
];

// 주문 상태 라벨
const ORDER_STATUS_LABELS = {
  ALL: "전체",
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  READY_FOR_SHIPMENT: "배송준비완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "주문취소",
} as const;

// 기간별 빠른 필터 옵션
const DATE_RANGES = [
  { value: "today", label: "오늘" },
  { value: "7days", label: "7일" },
  { value: "30days", label: "30일" },
  { value: "90days", label: "90일" },
];

/**
 * 주문 검색/필터/동기화 컴포넌트
 * Frontend-prototype 브랜드 스타일 완전 적용
 */
const OrderSearchFilter: React.FC<OrderSearchFilterProps> = ({
  searchKeyword,
  onSearchKeywordChange,
  searchType,
  onSearchTypeChange,
  statusFilter,
  onStatusFilterChange,
  onSearch,
  onReset,
  onSync,
  loading = false,
  syncLoading = false,
}) => {
  // 엔터키 입력 시 검색
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    onSearchKeywordChange("");
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${BRAND_COLORS.BORDER}`,
        backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
      }}
    >
      {/* 제목 */}
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: BRAND_COLORS.TEXT_PRIMARY,
        }}
      >
        주문 검색 및 필터
      </Typography>

      {/* 기간별 빠른 필터 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            fontWeight: 500,
            color: BRAND_COLORS.TEXT_PRIMARY,
          }}
        >
          기간별 조회
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {DATE_RANGES.map((range) => (
            <Button
              key={range.value}
              variant="outlined"
              size="small"
              onClick={() => {
                // TODO: 기간별 필터 로직 구현
                console.log("Date range filter:", range.value);
              }}
              sx={{
                borderColor: BRAND_COLORS.BORDER,
                color: BRAND_COLORS.TEXT_SECONDARY,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  borderColor: BRAND_COLORS.PRIMARY,
                  backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  color: BRAND_COLORS.PRIMARY,
                },
              }}
            >
              {range.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 검색 조건 */}
      <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
        {/* 검색 조건 선택 */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>검색조건</InputLabel>
            <Select
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value)}
              label="검색조건"
              sx={{
                borderRadius: 2,
                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.BORDER,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.PRIMARY,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.PRIMARY,
                },
              }}
            >
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 검색어 입력 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색어를 입력하세요"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: BRAND_COLORS.TEXT_SECONDARY }} />
                </InputAdornment>
              ),
              endAdornment: searchKeyword && (
                <InputAdornment position="end">
                  <Button
                    onClick={handleClearSearch}
                    sx={{
                      minWidth: "auto",
                      p: 0.5,
                      color: BRAND_COLORS.TEXT_SECONDARY,
                    }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                "& fieldset": {
                  borderColor: BRAND_COLORS.BORDER,
                },
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

        {/* 주문 상태 필터 */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>주문상태</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as OrderStatus | "ALL")
              }
              label="주문상태"
              sx={{
                borderRadius: 2,
                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.BORDER,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.PRIMARY,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND_COLORS.PRIMARY,
                },
              }}
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                <MenuItem key={status} value={status}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 검색 버튼 */}
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <PrimaryButton
            fullWidth
            onClick={onSearch}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SearchIcon />
              )
            }
            sx={{
              height: "40px",
              borderRadius: 2,
            }}
          >
            검색
          </PrimaryButton>
        </Grid>

        {/* 초기화 버튼 */}
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <SecondaryButton
            fullWidth
            onClick={onReset}
            disabled={loading}
            startIcon={<ClearIcon />}
            sx={{
              height: "40px",
              borderRadius: 2,
            }}
          >
            초기화
          </SecondaryButton>
        </Grid>

        {/* 배송 상태 동기화 버튼 */}
        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSync}
            disabled={syncLoading || loading}
            startIcon={
              syncLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SyncIcon />
              )
            }
            sx={{
              height: "40px",
              borderRadius: 2,
              backgroundColor: "#2196f3",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#1976d2",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            동기화
          </Button>
        </Grid>
      </Grid>

      {/* 안내 메시지 */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
        >
          💡 동기화 버튼을 클릭하면 물류서버에서 최신 배송 상태를 가져옵니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default OrderSearchFilter;
