// src/components/OrderManagement/components/OrderListTable.tsx

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Button,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import type {
  SellerOrderListResponse,
  SellerOrderSummary,
  OrderStatus,
} from "@/types/sellerOrder.types";
import { ORDER_STATUS_LABELS } from "@/types/sellerOrder.types";

interface OrderListTableProps {
  data: SellerOrderListResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetailView: (orderNumber: string) => void;
  onStatusChange: (orderNumber: string, currentStatus: OrderStatus) => void;
  onTrackingRegister: (orderNumber: string) => void;
}

/**
 * 주문 목록 테이블 컴포넌트
 * 기존 프로젝트 Material-UI 패턴 준수
 */
const OrderListTable: React.FC<OrderListTableProps> = ({
  data,
  loading,
  onPageChange,
  onRowsPerPageChange,
  onDetailView,
  onStatusChange,
  onTrackingRegister,
}) => {
  // 로딩 중이거나 데이터가 없는 경우
  if (loading) {
    return (
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            주문 목록을 불러오는 중...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            등록된 주문이 없습니다.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // 주문 상태별 Chip 색상 결정
  const getStatusChipProps = (status: OrderStatus) => {
    switch (status) {
      case "PAYMENT_COMPLETED":
        return { color: "info" as const, variant: "filled" as const };
      case "PREPARING":
        return { color: "warning" as const, variant: "filled" as const };
      case "READY_FOR_SHIPMENT":
        return { color: "primary" as const, variant: "filled" as const };
      case "IN_DELIVERY":
        return { color: "secondary" as const, variant: "filled" as const };
      case "DELIVERED":
        return { color: "success" as const, variant: "filled" as const };
      case "CANCELLED":
        return { color: "error" as const, variant: "filled" as const };
      default:
        return { color: "default" as const, variant: "filled" as const };
    }
  };

  // 상태 변경 가능 여부 확인
  const canChangeStatus = (status: OrderStatus): boolean => {
    return ["PAYMENT_COMPLETED", "PREPARING", "READY_FOR_SHIPMENT"].includes(
      status
    );
  };

  // 운송장 등록 가능 여부 확인
  const canRegisterTracking = (
    status: OrderStatus,
    shipmentInfo: any
  ): boolean => {
    return status === "READY_FOR_SHIPMENT" && !shipmentInfo.trackingNumber;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  // 행당 개수 변경 핸들러
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                주문번호
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                주문일시
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                구매자
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                주문상품
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                주문금액
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                주문상태
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                배송정보
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#f9fafb",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.orders.map((order: SellerOrderSummary) => (
              <TableRow key={order.orderNumber}>
                {/* 주문번호 */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.orderNumber}
                  </Typography>
                </TableCell>

                {/* 주문일시 */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.orderDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </TableCell>

                {/* 구매자 */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                      {order.maskedBuyerName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {order.maskedBuyerName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* 주문상품 */}
                <TableCell>
                  <Box>
                    {order.orderItems.slice(0, 2).map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {item.productName}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {" "}
                          × {item.quantity}
                        </Typography>
                      </Typography>
                    ))}
                    {order.orderItems.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        외 {order.orderItems.length - 2}개
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* 주문금액 */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.orderSummary.totalAmount.toLocaleString()}원
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({order.orderSummary.itemCount}개)
                  </Typography>
                </TableCell>

                {/* 주문상태 */}
                <TableCell>
                  <Chip
                    label={ORDER_STATUS_LABELS[order.orderStatus]}
                    size="small"
                    {...getStatusChipProps(order.orderStatus)}
                  />
                </TableCell>

                {/* 배송정보 */}
                <TableCell>
                  {order.shipmentInfo.trackingNumber ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.shipmentInfo.courier}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.shipmentInfo.trackingNumber}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      운송장 미등록
                    </Typography>
                  )}
                </TableCell>

                {/* 관리 버튼들 */}
                <TableCell>
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                  >
                    {/* 상세보기 버튼 */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onDetailView(order.orderNumber)}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        height: "32px",
                        minWidth: "80px",
                      }}
                    >
                      상세보기
                    </Button>

                    {/* 상태변경 버튼 */}
                    {canChangeStatus(order.orderStatus) && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() =>
                          onStatusChange(order.orderNumber, order.orderStatus)
                        }
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          height: "32px",
                          minWidth: "80px",
                        }}
                      >
                        상태변경
                      </Button>
                    )}

                    {/* 운송장등록 버튼 */}
                    {canRegisterTracking(
                      order.orderStatus,
                      order.shipmentInfo
                    ) && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShippingIcon />}
                        onClick={() => onTrackingRegister(order.orderNumber)}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          height: "32px",
                          minWidth: "90px",
                          bgcolor: "#ef9942",
                          "&:hover": { bgcolor: "#e08830" },
                        }}
                      >
                        운송장등록
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <TablePagination
        component="div"
        count={data.totalElements}
        page={data.currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={data.pageSize}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) =>
          `${count}개 중 ${from}-${to}`
        }
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
};

export default OrderListTable;
