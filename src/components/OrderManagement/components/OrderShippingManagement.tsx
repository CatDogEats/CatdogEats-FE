// src/components/OrderManagement/components/OrderShippingManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import OrderSearchFilter from "./OrderSearchFilter";
import OrderListTable from "./OrderListTable";
import { useSellerOrderManagement } from "@/hooks/useSellerOrders";
import type {
  OrderStatus,
  ShipmentSyncResponse,
} from "@/types/sellerOrder.types";

/**
 * 주문 배송 관리 메인 컴포넌트
 * 판매자가 주문을 조회하고 관리할 수 있는 통합 인터페이스 제공
 */
const OrderShippingManagement: React.FC = () => {
  // ===== 검색/필터 상태 =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState("orderNumber");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // ===== 페이지네이션 상태 =====
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdAt,desc");

  // ===== UI 상태 =====
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");

  // ===== 데이터 및 액션 훅 사용 =====
  const {
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    actionLoading,
    actionError,
    syncShipmentStatus,
  } = useSellerOrderManagement(page, sort);

  // ===== 에러 처리 =====
  useEffect(() => {
    if (ordersError) {
      showSnackbar(ordersError.message, "error");
    }
  }, [ordersError]);

  useEffect(() => {
    if (actionError) {
      showSnackbar(actionError.message, "error");
    }
  }, [actionError]);

  // ===== 스낵바 표시 헬퍼 =====
  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  // ===== 검색/필터 핸들러들 =====
  const handleSearch = useCallback(() => {
    // 실제 구현에서는 검색 조건을 API에 전달
    // 현재는 단순히 새로고침
    setPage(0); // 검색 시 첫 페이지로 이동
    refreshOrders();
    showSnackbar("검색을 실행했습니다.", "info");
  }, [refreshOrders]);

  const handleReset = useCallback(() => {
    setSearchKeyword("");
    setSearchType("orderNumber");
    setStatusFilter("ALL");
    setPage(0);
    refreshOrders();
    showSnackbar("검색 조건을 초기화했습니다.", "info");
  }, [refreshOrders]);

  // ===== 동기화 핸들러 =====
  const handleSync = useCallback(async () => {
    try {
      const result = await syncShipmentStatus();

      if (result) {
        const {
          totalCheckedOrders,
          updatedOrders,
          failedOrders,
        }: ShipmentSyncResponse = result;

        // 동기화 결과 메시지 생성
        let message = `총 ${totalCheckedOrders}건 확인`;

        if (updatedOrders > 0) {
          message += `, ${updatedOrders}건 배송완료로 업데이트됨`;
        }

        if (failedOrders > 0) {
          message += `, ${failedOrders}건 실패`;
        }

        showSnackbar(message, updatedOrders > 0 ? "success" : "info");

        // 동기화 후 목록 새로고침은 useSellerOrderManagement에서 자동 처리됨
      }
    } catch (error) {
      showSnackbar("동기화 중 오류가 발생했습니다.", "error");
    }
  }, [syncShipmentStatus, showSnackbar]);

  // ===== 테이블 핸들러들 =====
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback(
    (rowsPerPage: number) => {
      // 실제 구현에서는 rowsPerPage 상태를 추가하고 API에 전달
      setPage(0);
      refreshOrders();
    },
    [refreshOrders]
  );

  const handleDetailView = useCallback(
    (orderNumber: string) => {
      // TODO: 상세보기 모달 열기
      showSnackbar(`${orderNumber} 상세보기 - 모달 구현 예정`, "info");
    },
    [showSnackbar]
  );

  const handleStatusChange = useCallback(
    (orderNumber: string, currentStatus: OrderStatus) => {
      // TODO: 상태변경 모달 열기
      showSnackbar(
        `${orderNumber} 상태변경 (현재: ${currentStatus}) - 모달 구현 예정`,
        "info"
      );
    },
    [showSnackbar]
  );

  const handleTrackingRegister = useCallback(
    (orderNumber: string) => {
      // TODO: 운송장등록 모달 열기
      showSnackbar(`${orderNumber} 운송장등록 - 모달 구현 예정`, "info");
    },
    [showSnackbar]
  );

  // ===== 스낵바 닫기 =====
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 페이지 제목 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          주문 배송 관리
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
          판매자 주문 관리 및 배송 처리
        </Typography>
      </Box>

      {/* 검색/필터 영역 */}
      <OrderSearchFilter
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleReset}
        onSync={handleSync}
        loading={ordersLoading}
        syncLoading={actionLoading}
      />

      {/* 주문 목록 테이블 */}
      <OrderListTable
        data={orders}
        loading={ordersLoading}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDetailView={handleDetailView}
        onStatusChange={handleStatusChange}
        onTrackingRegister={handleTrackingRegister}
      />

      {/* 전역 로딩 스피너 (필요시) */}
      {actionLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              p: 3,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2">처리 중...</Typography>
          </Box>
        </Box>
      )}

      {/* 스낵바 알림 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderShippingManagement;
