// src/pages/OrderPaymentPage/OrderPaymentPage.tsx
"use client";

import type React from "react";
import { Container, Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

// 메인 컴포넌트 import
import { OrderPaymentManagement } from "@/components/OrderPayment";

// 테마 import
import { theme } from "@/theme";

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
          </Box>

          {/* 메인 컴포넌트 - 모든 비즈니스 로직은 여기서 처리 */}
          <OrderPaymentManagement />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OrderPaymentPage;
