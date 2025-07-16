// src/components/BuyerOrderTracking/components/ShippingDetailViewEnhanced.tsx

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
import { useBuyerShipmentDetail } from "../../../hooks/useBuyerOrders";
import type { TrackingDetail } from "@/types/buyerOrder.types";
interface ShippingDetailViewEnhancedProps {
  setDetailView: (view: string | null) => void;
  orderNumber?: string; // selectedOrder에서 전달받을 주문번호
}

const ShippingDetailViewEnhanced: React.FC<ShippingDetailViewEnhancedProps> = ({
  setDetailView,
  orderNumber = "20241225001", // 기본값 (테스트용)
}) => {
  // API 연동 훅
  const { shipmentDetail, loading, error, refetch } =
    useBuyerShipmentDetail(orderNumber);

  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
          onClick={() => setDetailView(null)}
          sx={{ mb: 3 }}
        >
          뒤로가기
        </Button>

        <Alert severity="error" sx={{ mb: 3 }}>
          배송 정보를 불러오는데 실패했습니다: {error}
        </Alert>

        <Button variant="outlined" onClick={refetch}>
          다시 시도
        </Button>
      </Box>
    );
  }

  // 데이터가 없는 경우
  if (!shipmentDetail) {
    return (
      <Box>
        <Button
          startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
          onClick={() => setDetailView(null)}
          sx={{ mb: 3 }}
        >
          뒤로가기
        </Button>

        <Alert severity="warning">배송 정보를 찾을 수 없습니다.</Alert>
      </Box>
    );
  }

  // 배송 완료 여부 확인
  const isDelivered = shipmentDetail.deliveredAt !== null;
  const deliveryStatusText = isDelivered
    ? "도착 완료"
    : shipmentDetail.deliveryStatus;

  // 배송 완료 날짜 포맷팅
  const formatDeliveryDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  };

  // 배송 추적 테이블 데이터 포맷팅
  const formatTrackingTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}월 ${day}, ${year} ${hours}:${minutes}`;
  };

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

      {/* 배송 상태 헤더 */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: "#f5f5f5", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          {isDelivered
            ? `${formatDeliveryDate(shipmentDetail.deliveredAt)} ${deliveryStatusText}`
            : deliveryStatusText}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isDelivered
            ? "고객님이 주문하신 상품이 배송완료 되었습니다."
            : "상품이 배송 중입니다."}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* 배송 정보 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LocalShipping />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                배송
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

        {/* 수령인 정보 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>받는사람:</strong>{" "}
              {shipmentDetail.recipientInfo.recipientName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>받는주소:</strong>{" "}
              {shipmentDetail.recipientInfo.shippingAddress}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>배송요청사항:</strong>{" "}
              {shipmentDetail.recipientInfo.deliveryNote || "요청사항 없음"}
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

      {/* 배송 추적 테이블 */}
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
            {shipmentDetail.trackingDetails &&
            shipmentDetail.trackingDetails.length > 0 ? (
              // 실제 배송 추적 데이터가 있는 경우
              shipmentDetail.trackingDetails
                .sort(
                  (a: TrackingDetail, b: TrackingDetail) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((tracking: TrackingDetail, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      {formatTrackingTimestamp(tracking.timestamp)}
                    </TableCell>
                    <TableCell>{tracking.location}</TableCell>
                    <TableCell>{tracking.status}</TableCell>
                  </TableRow>
                ))
            ) : (
              // 배송 추적 데이터가 없는 경우 기본 데이터 표시
              <>
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
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ShippingDetailViewEnhanced;
