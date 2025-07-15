// src/pages/OrderPaymentPage/OrderPaymentPage.tsx
"use client";

import type React from "react";
import {
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Schedule, NavigateNext } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

// 메인 컴포넌트 import
import { OrderPaymentManagement } from "@/components/OrderPayment";

// 테마 import
import { theme } from "@/theme";

/**
 * 주문/결제 페이지 - 단순한 컨테이너
 *
 * 주요 역할:
 * - 페이지 레이아웃 제공 (Container, Breadcrumbs, Header)
 * - 테마 제공자 역할
 * - OrderPaymentManagement 컴포넌트에 모든 비즈니스 로직 위임
 *
 * 비즈니스 로직은 OrderPaymentManagement에서 처리:
 * - 상태 관리 (petInfo, shippingInfo, coupons 등)
 * - API 호출 (반려동물, 주소, 쿠폰, 주문 생성)
 * - 이벤트 핸들러 (폼 변경, 모달 관리 등)
 * - 주문 생성 및 결제 플로우
 */
const OrderPaymentPage: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{ flexGrow: 1, backgroundColor: "#fcfaf8", minHeight: "100vh" }}
      >
        <Container maxWidth="md" style={{ paddingTop: 40, paddingBottom: 40 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link
              href="#"
              color="#97784e"
              sx={{
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#e89830" },
              }}
            >
              Shop
            </Link>
            <Typography color="#1b150e" sx={{ fontSize: "0.875rem" }}>
              주문/결제
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              style={{ fontWeight: "bold" }}
            >
              주문/결제
            </Typography>
            <Chip
              icon={<Schedule />}
              label="예상 소요시간: 2 ~ 3일"
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* 메인 컴포넌트 - 모든 비즈니스 로직은 여기서 처리 */}
          <OrderPaymentManagement />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OrderPaymentPage;
