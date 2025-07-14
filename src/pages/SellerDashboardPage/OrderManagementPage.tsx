// src/pages/SellerDashboardPage/OrderManagementPage.tsx

import React from "react";
import { Box, Container } from "@mui/material";
import { OrderShippingManagement } from "@/components/OrderManagement";

/**
 * 판매자 주문/배송 관리 페이지 - 프로토타입 완전 복원
 *
 * 주요 기능:
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
        py: 0, // 페이지 패딩 제거 (컴포넌트 내부에서 처리)
      }}
    >
      {/* 전체 컨테이너 - 반응형 최대 너비 설정 */}
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 0,
        }}
      >
        {/* 메인 주문 관리 컴포넌트 */}
        <OrderShippingManagement />
      </Container>

      {/* 배경 그라데이션 효과 (프로토타입 스타일) */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: `linear-gradient(180deg, #ef994208 0%, transparent 100%)`,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* 사이드 장식 요소 (프로토타입 스타일) */}
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          right: 0,
          width: "4px",
          height: "200px",
          background: `linear-gradient(90deg, transparent 0%, #ef9942 100%)`,
          transform: "translateY(-50%)",
          zIndex: -1,
          pointerEvents: "none",
          opacity: 0.3,
        }}
      />

      <Box
        sx={{
          position: "fixed",
          top: "30%",
          left: 0,
          width: "4px",
          height: "150px",
          background: `linear-gradient(90deg, #ef9942 0%, transparent 100%)`,
          transform: "translateY(-50%)",
          zIndex: -1,
          pointerEvents: "none",
          opacity: 0.2,
        }}
      />

      {/* 페이지 하단 그라데이션 */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100px",
          background: `linear-gradient(0deg, #f7f5f240 0%, transparent 100%)`,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export default OrderManagementPage;
