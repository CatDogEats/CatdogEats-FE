// src/components/OrderManagement/components/OrderListTable.tsx

import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { BRAND_COLORS } from "@/components/SellerDashboard/SellerInfo";
import type {
  SellerOrderListResponse,
  SellerOrderItem,
  OrderStatus,
} from "@/types/sellerOrder.types";
import { ORDER_STATUS_INFO_MAP } from "@/types/sellerOrder.types";

interface OrderListTableProps {
  data: SellerOrderListResponse;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetailView: (orderNumber: string) => void;
  onStatusChange: (orderNumber: string, currentStatus: OrderStatus) => void;
  onDeleteOrder: (orderNumber: string) => void;
}

/**
 * 상태 변경 가능 여부 확인
 */
const canChangeStatus = (status: OrderStatus): boolean => {
  return ["PAYMENT_COMPLETED", "PREPARING", "READY_FOR_SHIPMENT"].includes(
    status
  );
};

/**
 * 삭제 가능 여부 확인
 */
const canDeleteOrder = (status: OrderStatus): boolean => {
  return ["DELIVERED", "CANCELLED", "REFUNDED"].includes(status);
};

/**
 * 주문 상태 칩 컴포넌트
 */
const OrderStatusChip: React.FC<{
  status: OrderStatus;
  isDelayed?: boolean;
}> = ({ status, isDelayed }) => {
  const statusInfo = ORDER_STATUS_INFO_MAP[status];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        variant="filled"
        sx={{
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
      {isDelayed && (
        <Chip
          icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
          label="지연"
          color="error"
          size="small"
          variant="outlined"
          sx={{
            fontSize: "0.7rem",
            height: 20,
          }}
        />
      )}
    </Box>
  );
};

/**
 * 주문 목록 테이블 컴포넌트
 * Frontend-prototype 브랜드 스타일 적용 + 완전한 기능 구현
 */
const OrderListTable: React.FC<OrderListTableProps> = ({
  data,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
  onDetailView,
  onStatusChange,
  onDeleteOrder,
}) => {
  // 메뉴 상태 관리
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState<OrderStatus>("PAYMENT_COMPLETED");

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    orderNumber: string,
    orderStatus: OrderStatus
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderNumber(orderNumber);
    setSelectedOrderStatus(orderStatus);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderNumber("");
  };

  // 액션 핸들러들
  const handleDetailView = () => {
    onDetailView(selectedOrderNumber);
    handleMenuClose();
  };

  const handleStatusChange = () => {
    onStatusChange(selectedOrderNumber, selectedOrderStatus);
    handleMenuClose();
  };

  const handleDeleteOrder = () => {
    onDeleteOrder(selectedOrderNumber);
    handleMenuClose();
  };

  // 날짜 포맷 헬퍼
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 금액 포맷 헬퍼
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  // 전화번호 포맷 헬퍼
  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  // 로딩 중인 경우
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
          <CircularProgress size={40} sx={{ color: BRAND_COLORS.PRIMARY }} />
          <Typography
            variant="body1"
            color={BRAND_COLORS.TEXT_SECONDARY}
            sx={{ mt: 2 }}
          >
            주문 목록을 불러오는 중...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // 데이터가 없는 경우
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
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                "& .MuiTableCell-head": {
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                },
              }}
            >
              <TableCell>주문번호</TableCell>
              <TableCell>주문일시</TableCell>
              <TableCell>구매자</TableCell>
              <TableCell>상품 정보</TableCell>
              <TableCell>주문 금액</TableCell>
              <TableCell>주문 상태</TableCell>
              <TableCell>배송 정보</TableCell>
              <TableCell>수령인 정보</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.orders.map((order: SellerOrderItem) => (
              <TableRow
                key={order.orderNumber}
                sx={{
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
                  },
                  "& .MuiTableCell-body": {
                    borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
                    fontSize: "0.875rem",
                  },
                }}
              >
                {/* 주문번호 */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: BRAND_COLORS.PRIMARY,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={() => onDetailView(order.orderNumber)}
                  >
                    {order.orderNumber}
                  </Typography>
                </TableCell>

                {/* 주문일시 */}
                <TableCell>
                  <Typography variant="body2" color={BRAND_COLORS.TEXT_PRIMARY}>
                    {formatDate(order.orderDate)}
                  </Typography>
                </TableCell>

                {/* 구매자 */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: BRAND_COLORS.PRIMARY,
                        fontSize: "0.875rem",
                      }}
                    >
                      {order.buyerName.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_PRIMARY}
                    >
                      {order.buyerName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* 상품 정보 */}
                <TableCell>
                  <Typography variant="body2" color={BRAND_COLORS.TEXT_PRIMARY}>
                    {order.orderItemCount}개 상품
                  </Typography>
                </TableCell>

                {/* 주문 금액 */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>

                {/* 주문 상태 */}
                <TableCell>
                  <OrderStatusChip
                    status={order.orderStatus}
                    isDelayed={order.isDelayed}
                  />
                </TableCell>

                {/* 배송 정보 */}
                <TableCell>
                  {order.trackingNumber ? (
                    <Stack spacing={0.5}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ShippingIcon
                          sx={{ fontSize: 16, color: BRAND_COLORS.PRIMARY }}
                        />
                        <Typography
                          variant="caption"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        >
                          {order.courierCompany}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {order.trackingNumber}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                    >
                      미등록
                    </Typography>
                  )}
                </TableCell>

                {/* 수령인 정보 */}
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.TEXT_PRIMARY}
                    >
                      {order.recipientName}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PhoneIcon
                        sx={{
                          fontSize: 12,
                          color: BRAND_COLORS.TEXT_SECONDARY,
                        }}
                      />
                      <Typography
                        variant="caption"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        {formatPhoneNumber(order.recipientPhone)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color={BRAND_COLORS.TEXT_SECONDARY}
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        maxWidth: 150,
                      }}
                    >
                      {order.shippingAddress}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* 관리 */}
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                  >
                    <Tooltip title="상세보기">
                      <IconButton
                        size="small"
                        onClick={() => onDetailView(order.orderNumber)}
                        sx={{ color: BRAND_COLORS.PRIMARY }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="더보기">
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleMenuOpen(
                            e,
                            order.orderNumber,
                            order.orderStatus
                          )
                        }
                        sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
        onPageChange={(_, page) => onPageChange(page)}
        rowsPerPage={data.pageSize}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / 총 ${count !== -1 ? count : `${to}개 이상`}`
        }
        sx={{
          borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
          "& .MuiTablePagination-toolbar": {
            color: BRAND_COLORS.TEXT_SECONDARY,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              color: BRAND_COLORS.TEXT_SECONDARY,
            },
        }}
      />

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${BRAND_COLORS.BORDER}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem onClick={handleDetailView}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} />
          상세보기
        </MenuItem>

        {canChangeStatus(selectedOrderStatus) && (
          <MenuItem onClick={handleStatusChange}>
            <EditIcon sx={{ mr: 1, fontSize: 18 }} />
            상태변경
          </MenuItem>
        )}

        {canDeleteOrder(selectedOrderStatus) && (
          <MenuItem onClick={handleDeleteOrder} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
            삭제
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default OrderListTable;
