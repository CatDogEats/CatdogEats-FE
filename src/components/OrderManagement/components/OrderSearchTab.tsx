// src/components/OrderManagement/components/OrderSearchTab.tsx

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sync as SyncIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { BRAND_COLORS } from "@/components/SellerDashboard/SellerInfo";
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
 * 검색 조건 옵션
 */
const SEARCH_CONDITIONS: { value: SearchCondition; label: string }[] = [
  { value: "orderNumber", label: "주문번호" },
  { value: "buyerName", label: "구매자명" },
  { value: "productName", label: "상품명" },
];

/**
 * 주문 상태 옵션
 */
const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체 상태" },
  { value: "PAYMENT_COMPLETED", label: "결제완료" },
  { value: "PREPARING", label: "상품준비중" },
  { value: "READY_FOR_SHIPMENT", label: "배송준비완료" },
  { value: "IN_DELIVERY", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCELLED", label: "주문취소" },
  { value: "REFUNDED", label: "환불완료" },
];

/**
 * 주문 검색 탭 컴포넌트
 * Frontend-prototype 브랜드 스타일 적용한 검색 인터페이스
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
  // ===== 지역 상태 =====
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // ===== 이벤트 핸들러 =====
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 검색 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: BRAND_COLORS.TEXT_PRIMARY,
          }}
        >
          주문 검색 및 필터링
        </Typography>

        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={onSync}
          disabled={syncLoading}
          sx={{
            color: BRAND_COLORS.PRIMARY,
            borderColor: BRAND_COLORS.PRIMARY,
            "&:hover": {
              backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
              borderColor: BRAND_COLORS.PRIMARY,
            },
          }}
        >
          {syncLoading ? <CircularProgress size={16} /> : "동기화"}
        </Button>
      </Box>

      {/* 검색 폼 */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: `1px solid ${BRAND_COLORS.BORDER}`,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="end">
          {/* 검색 조건 선택 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={searchType}
                onChange={(e) => onSearchTypeChange(e.target.value)}
                label="검색 조건"
              >
                {SEARCH_CONDITIONS.map((condition) => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
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
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: BRAND_COLORS.TEXT_SECONDARY }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* 상태 필터 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>주문 상태</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  onStatusFilterChange(e.target.value as OrderStatus | "ALL")
                }
                label="주문 상태"
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 액션 버튼들 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                disabled={loading}
                sx={{
                  backgroundColor: BRAND_COLORS.PRIMARY,
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.PRIMARY}dd`,
                  },
                  flex: 1,
                }}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  "검색"
                )}
              </Button>

              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onReset}
                disabled={loading}
                sx={{
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  borderColor: BRAND_COLORS.BORDER,
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.TEXT_SECONDARY}10`,
                    borderColor: BRAND_COLORS.TEXT_SECONDARY,
                  },
                }}
              >
                초기화
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* 고급 검색 옵션 (미래 확장용) */}
        {showAdvancedSearch && (
          <>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="시작 날짜"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="종료 날짜"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="최소 금액"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">원</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="최대 금액"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">원</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* 고급 검색 토글 버튼 */}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            sx={{
              color: BRAND_COLORS.PRIMARY,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          >
            {showAdvancedSearch ? "간단 검색" : "고급 검색 옵션"}
          </Button>
        </Box>
      </Paper>

      {/* 검색 결과 요약 */}
      {data.totalElements > 0 && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" icon={<FilterIcon />}>
            <Typography variant="body2">
              총 <strong>{data.totalElements}건</strong>의 주문을 찾았습니다.
              {statusFilter !== "ALL" && (
                <>
                  {" "}
                  (상태:{" "}
                  <strong>
                    {
                      STATUS_OPTIONS.find((s) => s.value === statusFilter)
                        ?.label
                    }
                  </strong>
                  )
                </>
              )}
            </Typography>
          </Alert>
        </Box>
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
    </Box>
  );
};

export default OrderSearchTab;
