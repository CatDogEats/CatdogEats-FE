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
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import type {
  SellerOrderListResponse,
  SellerOrderSummary,
  OrderStatus,
} from "@/types/sellerOrder.types";

interface OrderListTableProps {
  data: SellerOrderListResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetailView: (orderNumber: string) => void;
  onStatusChange: (orderNumber: string, currentStatus: OrderStatus) => void;
  onDeleteOrder: (orderNumber: string) => void;
}

// 주문 상태별 Chip 스타일
const getStatusChipProps = (status: OrderStatus) => {
  switch (status) {
    case "PAYMENT_COMPLETED":
      return {
        label: "결제완료",
        sx: {
          backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
          color: BRAND_COLORS.PRIMARY,
          fontWeight: 500,
        },
      };
    case "PREPARING":
      return {
        label: "상품준비중",
        sx: {
          backgroundColor: "#fff3e0",
          color: "#f57c00",
          fontWeight: 500,
        },
      };
    case "READY_FOR_SHIPMENT":
      return {
        label: "배송준비완료",
        sx: {
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          fontWeight: 500,
        },
      };
    case "IN_DELIVERY":
      return {
        label: "배송중",
        sx: {
          backgroundColor: "#f3e5f5",
          color: "#9c27b0",
          fontWeight: 500,
        },
      };
    case "DELIVERED":
      return {
        label: "배송완료",
        sx: {
          backgroundColor: "#e8f5e8",
          color: "#2e7d32",
          fontWeight: 500,
        },
      };
    case "CANCELLED":
      return {
        label: "주문취소",
        sx: {
          backgroundColor: "#ffebee",
          color: "#d32f2f",
          fontWeight: 500,
        },
      };
    default:
      return {
        label: status,
        sx: {
          backgroundColor: "#f5f5f5",
          color: "#757575",
          fontWeight: 500,
        },
      };
  }
};

// 상태 변경 가능 여부 확인
const canChangeStatus = (status: OrderStatus): boolean => {
  return ["PAYMENT_COMPLETED", "PREPARING", "READY_FOR_SHIPMENT"].includes(
    status
  );
};

/**
 * 주문 목록 테이블 컴포넌트
 * Frontend-prototype 브랜드 스타일 적용 + 삭제 버튼 추가
 */
const OrderListTable: React.FC<OrderListTableProps> = ({
  data,
  loading,
  onPageChange,
  onRowsPerPageChange,
  onDetailView,
  onStatusChange,
  onDeleteOrder,
}) => {
  // 로딩 중이거나 데이터가 없는 경우
  if (loading) {
    return (
      <Paper
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        }}
      >
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color={BRAND_COLORS.TEXT_SECONDARY}>
            주문 목록을 불러오는 중...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <Paper
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        }}
      >
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color={BRAND_COLORS.TEXT_SECONDARY}>
            등록된 주문이 없습니다.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${BRAND_COLORS.BORDER}`,
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: BRAND_COLORS.SECONDARY }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                주문번호
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                주문일
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                고객명
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                상품정보
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                주문금액
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                주문상태
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
              >
                배송정보
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  textAlign: "center",
                }}
              >
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.orders.map((order) => {
              const firstProduct = order.orderItems[0];
              const additionalCount = order.orderItems.length - 1;
              const statusChipProps = getStatusChipProps(order.orderStatus);

              return (
                <TableRow key={order.orderNumber} hover>
                  {/* 주문번호 */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: BRAND_COLORS.PRIMARY,
                        cursor: "pointer",
                      }}
                      onClick={() => onDetailView(order.orderNumber)}
                    >
                      {order.orderNumber}
                    </Typography>
                  </TableCell>

                  {/* 주문일 */}
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.orderDate).toLocaleDateString("ko-KR")}
                    </Typography>
                  </TableCell>

                  {/* 고객명 */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.maskedBuyerName}
                    </Typography>
                  </TableCell>

                  {/* 상품정보 */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={firstProduct.productImage}
                        alt={firstProduct.productName}
                        sx={{ width: 40, height: 40, borderRadius: 1 }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            lineHeight: 1.2,
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={firstProduct.productName}
                        >
                          {firstProduct.productName}
                        </Typography>
                        {additionalCount > 0 && (
                          <Typography
                            variant="caption"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                          >
                            외 {additionalCount}건
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* 주문금액 */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.orderSummary.totalAmount.toLocaleString()}원
                    </Typography>
                  </TableCell>

                  {/* 주문상태 */}
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusChipProps.label}
                      sx={{
                        borderRadius: 2,
                        ...statusChipProps.sx,
                      }}
                    />
                  </TableCell>

                  {/* 배송정보 */}
                  <TableCell>
                    {order.shipmentInfo.isShipped ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.shipmentInfo.courier}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          {order.shipmentInfo.trackingNumber}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        운송장 미등록
                      </Typography>
                    )}
                  </TableCell>

                  {/* 관리 버튼들 */}
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* 상세보기 버튼 (항상 표시) */}
                      <PrimaryButton
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        onClick={() => onDetailView(order.orderNumber)}
                        sx={{
                          minWidth: 80,
                          height: 32,
                          fontSize: "0.75rem",
                        }}
                      >
                        상세보기
                      </PrimaryButton>

                      {/* 상태변경 버튼 (변경 가능한 상태일 때만) */}
                      {canChangeStatus(order.orderStatus) && (
                        <SecondaryButton
                          size="small"
                          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                          onClick={() =>
                            onStatusChange(order.orderNumber, order.orderStatus)
                          }
                          sx={{
                            minWidth: 80,
                            height: 32,
                            fontSize: "0.75rem",
                          }}
                        >
                          상태변경
                        </SecondaryButton>
                      )}

                      {/* 삭제 버튼 (배송완료/취소된 주문만) */}
                      {(order.orderStatus === "DELIVERED" ||
                        order.orderStatus === "CANCELLED") && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                          onClick={() => onDeleteOrder(order.orderNumber)}
                          sx={{
                            minWidth: 60,
                            height: 32,
                            fontSize: "0.75rem",
                            borderRadius: 2,
                            textTransform: "none",
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={data.totalElements}
        rowsPerPage={data.pageSize}
        page={data.currentPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(parseInt(event.target.value, 10))
        }
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) =>
          `${count}개 중 ${from}-${to}`
        }
        sx={{
          borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          "& .MuiTablePagination-toolbar": {
            paddingRight: 2,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              color: BRAND_COLORS.TEXT_SECONDARY,
            },
        }}
      />
    </Paper>
  );
};

export default OrderListTable;
