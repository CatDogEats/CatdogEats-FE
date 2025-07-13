// src/pages/SellerDashboardPage/OrderManagementPage.tsx

import React from "react";
import { Box } from "@mui/material";
import { OrderShippingManagement } from "@/components/OrderManagement";

/**
 * 판매자 주문/배송 관리 페이지
 * Frontend-prototype 디자인을 완전히 복원한 탭 기반 주문 관리 인터페이스
 *
 * 포함 기능:
 * - 주문 현황 대시보드
 * - 출고 지연 요청 관리
 * - 주문 현황별 관리
 * - 주문 검색 및 필터링
 * - 상태 변경 및 운송장 등록
 * - 배송 상태 동기화
 */
const OrderManagementPage: React.FC = () => {
  return (
    <Box>
      <OrderShippingManagement />
    </Box>
  );
};

export default OrderManagementPage;
