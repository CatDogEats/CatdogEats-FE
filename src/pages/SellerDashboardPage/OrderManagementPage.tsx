// src/pages/SellerDashboardPage/OrderManagementPage.tsx

import React from "react";
import { Box } from "@mui/material";
import { OrderShippingManagement } from "@/components/OrderManagement";

/**
 * 판매자 주문/배송 관리 페이지
 * Frontend-prototype 디자인을 완전히 복원한 탭 기반 주문 관리 인터페이스
 *
 * 포함 기능:
 * - 주문 현황 대시보드 (통계 및 긴급 작업 표시)
 * - 출고 지연 요청 관리 (긴급 처리가 필요한 주문)
 * - 주문 현황별 관리 (전체 주문 목록 및 상태별 관리)
 * - 주문 검색 및 필터링 (다양한 조건으로 주문 검색)
 * - 상태 변경 및 운송장 등록 (주문 상태 업데이트)
 * - 배송 상태 동기화 (물류 서버와 실시간 동기화)
 *
 * 백엔드 API 연동:
 * - GET /v1/sellers/orders/list - 주문 목록 조회
 * - GET /v1/sellers/orders/{order-number} - 주문 상세 조회
 * - POST /v1/sellers/orders/status - 주문 상태 변경
 * - POST /v1/sellers/orders/tracking-number - 운송장 등록
 * - POST /v1/sellers/orders/sync - 배송 상태 동기화
 * - DELETE /v1/sellers/orders - 주문 삭제
 */
const OrderManagementPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <OrderShippingManagement />
    </Box>
  );
};

export default OrderManagementPage;
