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
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  PersonOutline as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
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
  showDelayInfo?: boolean;
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
 * 주문 상태 칩 컴포넌트 - 프로토타입 스타일
 */
const OrderStatusChip: React.FC<{
  status: OrderStatus;
  isDelayed?: boolean;
}> = ({ status, isDelayed }) => {
  const statusInfo = ORDER_STATUS_INFO_MAP[status];

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
    >
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        variant="filled"
        sx={{
          fontWeight: 600,
          fontSize: "0.75rem",
          borderRadius: 1.5,
          boxShadow: 1,
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
            borderRadius: 1,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.7 },
              "100%": { opacity: 1 },
            },
          }}
        />
      )}
    </Box>
  );
};

/**
 * 주문 목록 테이블 컴포넌트 - 프로토타입 완전 복원
 * - 브랜드 스타일 적용
 * - 완전한 인터랙션
 * - 반응형 디자인
 * - 풍부한 정보 표시
 */
const OrderListTable: React.FC<OrderListTableProps> = ({
  data,
  loading = false,
  showDelayInfo = false,
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

  // 메뉴 핸들러
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    orderNumber: string,
    status: OrderStatus
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderNumber(orderNumber);
    setSelectedOrderStatus(status);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderNumber("");
  };

  // 액션 핸들러
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

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }),
      time: date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  // 전화번호 포맷팅
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          backgroundColor: "white",
          borderRadius: 2,
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        }}
      >
        <CircularProgress size={40} sx={{ color: BRAND_COLORS.PRIMARY }} />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${BRAND_COLORS.BORDER}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <TableContainer sx={{ maxHeight: 800 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShoppingBagIcon
                    sx={{ fontSize: 18, color: BRAND_COLORS.PRIMARY }}
                  />
                  주문정보
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon
                    sx={{ fontSize: 18, color: BRAND_COLORS.PRIMARY }}
                  />
                  주문일시
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon
                    sx={{ fontSize: 18, color: BRAND_COLORS.PRIMARY }}
                  />
                  구매자정보
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                상품정보
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MoneyIcon
                    sx={{ fontSize: 18, color: BRAND_COLORS.PRIMARY }}
                  />
                  주문금액
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                }}
              >
                주문상태
              </TableCell>
              {showDelayInfo && (
                <TableCell
                  sx={{
                    backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                    py: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 18, color: "#f57c00" }} />
                    지연정보
                  </Box>
                </TableCell>
              )}
              <TableCell
                sx={{
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  borderBottom: `2px solid ${BRAND_COLORS.BORDER}`,
                  py: 2,
                  textAlign: "center",
                }}
              >
                액션
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.orders.map((order, index) => (
              <TableRow
                key={order.orderNumber}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
                  },
                  borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
                }}
              >
                {/* 주문정보 */}
                <TableCell sx={{ py: 2.5, minWidth: 140 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: BRAND_COLORS.PRIMARY,
                        mb: 0.5,
                      }}
                    >
                      {order.orderNumber}
                    </Typography>
                    <Chip
                      label={`#${(index + 1).toString().padStart(3, "0")}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        borderColor: BRAND_COLORS.BORDER,
                        color: BRAND_COLORS.TEXT_SECONDARY,
                      }}
                    />
                  </Box>
                </TableCell>

                {/* 주문일시 */}
                <TableCell sx={{ py: 2.5, minWidth: 120 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {
                        formatDate(
                          order.orderDate ||
                            order.createdAt ||
                            Date.now().toString()
                        ).date
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {
                        formatDate(
                          order.orderDate ||
                            order.createdAt ||
                            Date.now().toString()
                        ).time
                      }
                    </Typography>
                  </Box>
                </TableCell>

                {/* 구매자정보 */}
                <TableCell sx={{ py: 2.5, minWidth: 160 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: BRAND_COLORS.PRIMARY,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {order.buyerName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {order.buyerName}
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
                        <Typography variant="caption" color="text.secondary">
                          {formatPhone(
                            order.buyerPhone ||
                              order.customerPhone ||
                              "연락처 없음"
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* 상품정보 */}
                <TableCell sx={{ py: 2.5, minWidth: 200 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {order.orderItems[0]?.productName}
                    </Typography>
                    {order.orderItems.length > 1 && (
                      <Chip
                        label={`외 ${order.orderItems.length - 1}개`}
                        size="small"
                        variant="filled"
                        sx={{
                          backgroundColor: BRAND_COLORS.SECONDARY,
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: "0.7rem",
                          height: 20,
                          mb: 0.5,
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      총 수량:{" "}
                      {order.orderItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                      개
                    </Typography>
                  </Box>
                </TableCell>

                {/* 주문금액 */}
                <TableCell sx={{ py: 2.5, minWidth: 120 }}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: BRAND_COLORS.TEXT_PRIMARY,
                        mb: 0.5,
                      }}
                    >
                      {(
                        order.totalAmount ||
                        order.amount ||
                        0
                      ).toLocaleString()}
                      원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1개 상품
                    </Typography>
                  </Box>
                </TableCell>

                {/* 주문상태 */}
                <TableCell sx={{ py: 2.5, minWidth: 140 }}>
                  <OrderStatusChip
                    status={order.orderStatus}
                    isDelayed={order.isDelayed}
                  />
                </TableCell>

                {/* 지연정보 */}
                {showDelayInfo && (
                  <TableCell sx={{ py: 2.5, minWidth: 180 }}>
                    {order.isDelayed ? (
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: "#fff3e0",
                          borderRadius: 1,
                          border: "1px solid #ffb74d",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#f57c00",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          지연 사유
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          {order.delayReason || "미입력"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          예상 출고일:{" "}
                          {order.expectedShipDate
                            ? new Date(
                                order.expectedShipDate
                              ).toLocaleDateString("ko-KR")
                            : "미정"}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        정상 처리
                      </Typography>
                    )}
                  </TableCell>
                )}

                {/* 액션 */}
                <TableCell sx={{ py: 2.5, textAlign: "center" }}>
                  <Tooltip title="더보기">
                    <IconButton
                      size="small"
                      onClick={(e) =>
                        handleMenuClick(e, order.orderNumber, order.orderStatus)
                      }
                      sx={{
                        backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                        border: `1px solid ${BRAND_COLORS.BORDER}`,
                        "&:hover": {
                          backgroundColor: BRAND_COLORS.PRIMARY,
                          color: "white",
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 데이터 없을 때 */}
      {data.orders.length === 0 && (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          }}
        >
          <ShoppingBagIcon
            sx={{
              fontSize: 64,
              color: BRAND_COLORS.TEXT_SECONDARY,
              mb: 2,
              opacity: 0.5,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 1, color: BRAND_COLORS.TEXT_SECONDARY }}
          >
            주문 내역이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            조건에 맞는 주문을 찾을 수 없습니다.
          </Typography>
        </Box>
      )}

      {/* 페이지네이션 */}
      {data.totalElements > 0 && (
        <Box
          sx={{
            borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
            backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          }}
        >
          <TablePagination
            component="div"
            count={data.totalElements}
            page={data.currentPage}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={data.pageSize}
            onRowsPerPageChange={(e) =>
              onRowsPerPageChange(parseInt(e.target.value, 10))
            }
            labelRowsPerPage="페이지당 주문 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from.toLocaleString()}-${to.toLocaleString()} / 총 ${count.toLocaleString()}개`
            }
            sx={{
              "& .MuiTablePagination-toolbar": {
                paddingX: 3,
                paddingY: 2,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontWeight: 500,
                  color: BRAND_COLORS.TEXT_SECONDARY,
                },
              "& .MuiTablePagination-select": {
                backgroundColor: "white",
                border: `1px solid ${BRAND_COLORS.BORDER}`,
                borderRadius: 1,
              },
              "& .MuiTablePagination-actions button": {
                backgroundColor: "white",
                border: `1px solid ${BRAND_COLORS.BORDER}`,
                borderRadius: 1,
                margin: "0 2px",
                "&:hover": {
                  backgroundColor: BRAND_COLORS.PRIMARY,
                  color: "white",
                },
                "&.Mui-disabled": {
                  backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                  borderColor: BRAND_COLORS.BORDER,
                },
              },
            }}
          />
        </Box>
      )}

      {/* 액션 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            border: `1px solid ${BRAND_COLORS.BORDER}`,
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleDetailView} sx={{ py: 1.5 }}>
          <VisibilityIcon
            sx={{ mr: 1.5, fontSize: 18, color: BRAND_COLORS.PRIMARY }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            상세 보기
          </Typography>
        </MenuItem>

        {canChangeStatus(selectedOrderStatus) && (
          <MenuItem onClick={handleStatusChange} sx={{ py: 1.5 }}>
            <EditIcon sx={{ mr: 1.5, fontSize: 18, color: "#1976d2" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              상태 변경
            </Typography>
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        {canDeleteOrder(selectedOrderStatus) && (
          <MenuItem
            onClick={handleDeleteOrder}
            sx={{ py: 1.5, color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              주문 삭제
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default OrderListTable;
