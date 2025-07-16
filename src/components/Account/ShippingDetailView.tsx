// src/components/Account/ShippingDetailView.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ChevronRight, LocalShipping } from "@mui/icons-material";
import { useBuyerShipmentDetail } from "@/hooks/useBuyerOrders";

interface ShippingDetailViewProps {
  setDetailView: (view: string | null) => void;
  orderNumber: string;
}

const ShippingDetailView: React.FC<ShippingDetailViewProps> = ({
  setDetailView,
  orderNumber,
}) => {
  // API 연동
  const { shipmentDetail, loading, error } =
    useBuyerShipmentDetail(orderNumber);

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => setDetailView(null)}>돌아가기</Button>
      </Box>
    );
  }

  // 데이터 없음
  if (!shipmentDetail) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">배송 정보를 찾을 수 없습니다.</Alert>
        <Button onClick={() => setDetailView(null)}>돌아가기</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
        onClick={() => setDetailView(null)}
        sx={{ mb: 3 }}
      >
        뒤로가기
      </Button>

      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        배송조회
      </Typography>

      <Paper sx={{ p: 4, mb: 4, bgcolor: "#f5f5f5", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          {shipmentDetail.deliveryDate} {/* 예: "2025-05-29(목)" */}{" "}
          {shipmentDetail.deliveryStatus}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          고객님이 주문하신 상품이 {shipmentDetail.deliveryStatus} 되었습니다.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LocalShipping />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                배송
              </Typography>
              <Typography variant="body2" color="text.secondary">
                택배사: {shipmentDetail.courier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                송장번호: {shipmentDetail.trackingNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📞 배송업무 중 연락을 받을 수 없습니다.
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>받는사람:</strong> 홍길동
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>받는주소:</strong> 서울특별시 서초구 반포대로 45 4층
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>배송요청사항:</strong> 세대: 기타 (택배함)
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "success.main", fontWeight: 600 }}
            >
              <strong>상품수령방법:</strong> 고객요청
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>시간</strong>
              </TableCell>
              <TableCell>
                <strong>현재위치</strong>
              </TableCell>
              <TableCell>
                <strong>배송상태</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>5월 29, 2025 03:45</TableCell>
              <TableCell>일산5</TableCell>
              <TableCell>배송완료</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5월 29, 2025 02:32</TableCell>
              <TableCell>일산5</TableCell>
              <TableCell>배송출발</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5월 29, 2025 02:04</TableCell>
              <TableCell>일산5</TableCell>
              <TableCell>캠프도착</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5월 29, 2025 00:04</TableCell>
              <TableCell>고양HUB</TableCell>
              <TableCell>캠프상차</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5월 28, 2025 23:58</TableCell>
              <TableCell>고양HUB</TableCell>
              <TableCell>집하</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ShippingDetailView;
