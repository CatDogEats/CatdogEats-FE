// src/components/Account/ShippingDetailView.tsx
"use client";

import React from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Typography,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
} from "@mui/material";
import { useBuyerShipmentDetail } from "@/hooks/useBuyerOrders";

interface ShippingDetailViewProps {
  setDetailView: (view: string | null) => void;
  orderNumber: string;
}

const ShippingDetailView: React.FC<ShippingDetailViewProps> = ({
  setDetailView,
  orderNumber,
}) => {
  // ✅ 모든 훅을 맨 처음에 호출
  const { shipmentDetail, loading, error } =
    useBuyerShipmentDetail(orderNumber);

  // ✅ 단일 return문에서 조건부 렌더링
  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => setDetailView(null)} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      ) : !shipmentDetail ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">배송 정보를 찾을 수 없습니다.</Alert>
          <Button onClick={() => setDetailView(null)} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      ) : (
        <Box>
          {/* 배송 상태 헤더 */}
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            배송 추적
          </Typography>

          {/* 배송 상태 정보 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              배송 상태: {shipmentDetail.deliveryStatus}
            </Typography>
            {shipmentDetail.deliveredAt && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                배송완료일: {shipmentDetail.deliveredAt.split("T")[0]}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>운송장번호:</strong> {shipmentDetail.trackingNumber}
            </Typography>
            <Typography variant="body2">
              <strong>택배사:</strong> {shipmentDetail.courier}
            </Typography>
          </Paper>

          {/* 배송 정보 Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* 운송 정보 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  운송 정보
                </Typography>
                <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>운송장번호:</strong> {shipmentDetail.trackingNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>택배사:</strong> {shipmentDetail.courier}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>배송상태:</strong> {shipmentDetail.deliveryStatus}
                  </Typography>
                  {shipmentDetail.shippedAt && (
                    <Typography variant="body2">
                      <strong>발송일:</strong>{" "}
                      {shipmentDetail.shippedAt.split("T")[0]}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* 수령인 정보 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  수령인 정보
                </Typography>
                <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>받는사람:</strong>{" "}
                    {shipmentDetail.recipientInfo.recipientName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>받는주소:</strong>{" "}
                    {shipmentDetail.recipientInfo.shippingAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>연락처:</strong>{" "}
                    {shipmentDetail.recipientInfo.recipientPhone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>배송요청사항:</strong>{" "}
                    {shipmentDetail.recipientInfo.deliveryNote ||
                      "요청사항 없음"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* 배송 추적 테이블 */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            배송 추적 내역
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>시간</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>현재위치</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>배송상태</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상세내용</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipmentDetail.trackingDetails &&
                shipmentDetail.trackingDetails.length > 0 ? (
                  shipmentDetail.trackingDetails.map(
                    (detail: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(detail.timestamp).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>{detail.location}</TableCell>
                        <TableCell>
                          <Chip
                            label={detail.status}
                            size="small"
                            color={
                              detail.status.includes("완료")
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>{detail.description}</TableCell>
                      </TableRow>
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        배송 추적 정보가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 돌아가기 버튼 */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setDetailView(null)}
            >
              주문목록 돌아가기
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShippingDetailView;
