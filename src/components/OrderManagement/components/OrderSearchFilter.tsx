// src/components/OrderManagement/components/OrderSearchFilter.tsx

import React, { useState } from "react";
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
import type {
  OrderStatus,
  ORDER_STATUS_LABELS,
} from "@/types/sellerOrder.types";

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

/**
 * 주문 검색/필터/동기화 컴포넌트
 * 기존 프로젝트 Material-UI 패턴 준수
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
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Grid container spacing={2} alignItems="flex-end">
        {/* 검색 조건 선택 */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>검색조건</InputLabel>
            <Select
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value)}
              label="검색조건"
              sx={{
                borderRadius: 1,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ef9942",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ef9942",
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
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
              endAdornment: searchKeyword && (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={handleClearSearch}
                    sx={{
                      minWidth: "auto",
                      p: 0.5,
                      borderRadius: "50%",
                      color: "#9ca3af",
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": {
                  borderColor: "#e5e7eb",
                },
                "&:hover fieldset": {
                  borderColor: "#ef9942",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ef9942",
                },
              },
            }}
          />
        </Grid>

        {/* 주문 상태 필터 */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>주문상태</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as OrderStatus | "ALL")
              }
              label="주문상태"
              sx={{
                borderRadius: 1,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ef9942",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ef9942",
                },
              }}
            >
              <MenuItem value="ALL">전체</MenuItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                <MenuItem key={status} value={status}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 검색 버튼 */}
        <Grid item xs={12} sm={6} md={1.5}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearch}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} /> : <SearchIcon />
            }
            sx={{
              height: "40px",
              textTransform: "none",
              borderRadius: 1,
              bgcolor: "#ef9942",
              "&:hover": { bgcolor: "#e08830" },
            }}
          >
            검색
          </Button>
        </Grid>

        {/* 초기화 버튼 */}
        <Grid item xs={12} sm={6} md={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onReset}
            disabled={loading}
            startIcon={<ClearIcon />}
            sx={{
              height: "40px",
              textTransform: "none",
              borderRadius: 1,
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#ef9942",
                color: "#ef9942",
              },
            }}
          >
            초기화
          </Button>
        </Grid>

        {/* 주문 상태 동기화 버튼 */}
        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSync}
            disabled={syncLoading || loading}
            startIcon={
              syncLoading ? <CircularProgress size={16} /> : <SyncIcon />
            }
            sx={{
              height: "40px",
              textTransform: "none",
              borderRadius: 1,
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              "&:disabled": {
                bgcolor: "#9ca3af",
                color: "white",
              },
            }}
          >
            {syncLoading ? "동기화 중..." : "주문 상태 업데이트"}
          </Button>
        </Grid>
      </Grid>

      {/* 동기화 상태 안내 */}
      {syncLoading && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#f0f9ff", borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="primary">
              물류 서버와 배송 상태를 동기화하고 있습니다...
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default OrderSearchFilter;
