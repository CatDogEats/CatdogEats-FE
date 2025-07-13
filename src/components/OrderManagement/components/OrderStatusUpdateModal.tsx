// src/components/OrderManagement/components/OrderStatusUpdateModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
} from "@/components/SellerDashboard/SellerInfo";
import {
  useSellerOrderDetail,
  useSellerOrderManagement,
} from "@/hooks/useSellerOrders";
import type {
  OrderStatus,
  CourierCompany,
  OrderStatusUpdateRequest,
} from "@/types/sellerOrder.types";
import { ORDER_STATUS_INFO_MAP } from "@/types/sellerOrder.types";

interface OrderStatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  currentStatus: OrderStatus;
  onSuccess: () => void;
}

/**
 * 상태별 선택 가능한 다음 상태들
 */
const getAvailableStatuses = (currentStatus: OrderStatus) => {
  switch (currentStatus) {
    case "PAYMENT_COMPLETED":
      return [{ value: "PREPARING", label: "상품준비중" }];
    case "PREPARING":
      return [
        { value: "PREPARING", label: "상품준비중 (현재 상태 유지)" },
        { value: "READY_FOR_SHIPMENT", label: "배송준비완료" },
      ];
    case "READY_FOR_SHIPMENT":
      return [{ value: "IN_DELIVERY", label: "배송중" }];
    default:
      return [];
  }
};

/**
 * 택배사 옵션
 */
const COURIER_OPTIONS: { value: CourierCompany; label: string }[] = [
  { value: "CJ_DAEHAN", label: "CJ대한통운" },
  { value: "HANJIN", label: "한진택배" },
  { value: "LOTTE", label: "롯데택배" },
  { value: "LOGEN", label: "로젠택배" },
  { value: "POST_OFFICE", label: "우체국택배" },
];

/**
 * 주문 상태 변경 모달
 * - 출고지연 처리 로직 개선
 * - 배송중 선택시 운송장 등록 통합
 * - Frontend-prototype 브랜드 스타일 적용
 */
const OrderStatusUpdateModal: React.FC<OrderStatusUpdateModalProps> = ({
  open,
  onClose,
  orderNumber,
  currentStatus,
  onSuccess,
}) => {
  // ===== Hook 사용 =====
  const { updateOrderStatus, actionLoading } = useSellerOrderManagement();
  const { orderDetail, loading: detailLoading } =
    useSellerOrderDetail(orderNumber);

  // ===== 기본 상태 =====
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [delayReason, setDelayReason] = useState("");
  const [expectedShipDate, setExpectedShipDate] = useState("");

  // ===== 배송 관련 상태 =====
  const [courierCompany, setCourierCompany] = useState<CourierCompany | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // ===== UI 상태 =====
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ===== 유틸리티 =====
  const availableStatuses = getAvailableStatuses(currentStatus);
  const currentStatusInfo = ORDER_STATUS_INFO_MAP[currentStatus];
  const selectedStatusInfo = ORDER_STATUS_INFO_MAP[selectedStatus];

  // 날짜 포맷 헬퍼
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== 이벤트 핸들러 =====
  const handleSubmit = async () => {
    const errors: string[] = [];

    // 배송중으로 변경 시 운송장 정보 필수
    if (selectedStatus === "IN_DELIVERY") {
      if (!courierCompany) errors.push("택배사를 선택해주세요.");
      if (!trackingNumber.trim()) errors.push("운송장번호를 입력해주세요.");
    }

    // 출고 지연 처리 시 필수 정보
    if (selectedStatus === "PREPARING" && currentStatus === "PREPARING") {
      if (!delayReason.trim()) errors.push("지연 사유를 입력해주세요.");
      if (!expectedShipDate) errors.push("예상 출고일을 선택해주세요.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const updateRequest: OrderStatusUpdateRequest = {
        orderNumber,
        newStatus: selectedStatus,
        ...(selectedStatus === "IN_DELIVERY" && {
          courierCompany: courierCompany as CourierCompany,
          trackingNumber: trackingNumber.trim(),
        }),
        ...(selectedStatus === "PREPARING" &&
          currentStatus === "PREPARING" && {
            reason: delayReason.trim(),
            isDelayed: true,
            expectedShipDate,
          }),
      };

      await updateOrderStatus(updateRequest);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("상태 변경 실패:", error);
    }
  };

  // ===== 초기화 효과 =====
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setDelayReason("");
      setExpectedShipDate("");
      setCourierCompany("");
      setTrackingNumber("");
      setValidationErrors([]);
    }
  }, [open, currentStatus]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 0,
          borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: BRAND_COLORS.TEXT_PRIMARY,
            }}
          >
            주문 상태 변경
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: BRAND_COLORS.TEXT_SECONDARY,
              fontFamily: "monospace",
            }}
          >
            {orderNumber}
          </Typography>
        </Box>
      </DialogTitle>

      {/* 모달 콘텐츠 */}
      <DialogContent sx={{ p: 3 }}>
        {detailLoading ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
            }}
          >
            <CircularProgress
              size={40}
              sx={{ color: BRAND_COLORS.PRIMARY, mb: 2 }}
            />
            <Typography color={BRAND_COLORS.TEXT_SECONDARY}>
              주문 정보를 불러오는 중...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* 현재 주문 정보 */}
            {orderDetail && (
              <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    현재 주문 정보
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        주문일시
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDate(orderDetail.orderDate)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        구매자
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {orderDetail.buyerName}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="body2"
                        color={BRAND_COLORS.TEXT_SECONDARY}
                      >
                        현재 상태
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={currentStatusInfo.label}
                          color={currentStatusInfo.color}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                        {orderDetail.isDelayed && (
                          <Chip
                            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                            label="출고 지연"
                            color="error"
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* 상태 변경 섹션 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                변경할 상태 선택
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>새로운 상태</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as OrderStatus)
                  }
                  label="새로운 상태"
                >
                  {availableStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 상태 변경 설명 */}
              {selectedStatus !== currentStatus && (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{currentStatusInfo.label}</strong>에서{" "}
                    <strong>{selectedStatusInfo.label}</strong>로 변경됩니다.
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* 출고 지연 처리 (상품준비중 → 상품준비중) */}
            {selectedStatus === "PREPARING" &&
              currentStatus === "PREPARING" && (
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    border: `1px solid #ffb74d`,
                    backgroundColor: "#fff3e0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <ScheduleIcon sx={{ color: "#f57c00" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      출고 지연 처리
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="지연 사유"
                        placeholder="고객에게 안내할 지연 사유를 입력해주세요"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="예상 출고일"
                        value={expectedShipDate}
                        onChange={(e) => setExpectedShipDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: new Date().toISOString().split("T")[0],
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

            {/* 배송 정보 입력 (배송중으로 변경) */}
            {selectedStatus === "IN_DELIVERY" && (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  border: `1px solid ${BRAND_COLORS.PRIMARY}`,
                  backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <ShippingIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    배송 정보 등록
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>
                      <InputLabel>택배사</InputLabel>
                      <Select
                        value={courierCompany}
                        onChange={(e) =>
                          setCourierCompany(e.target.value as CourierCompany)
                        }
                        label="택배사"
                      >
                        {COURIER_OPTIONS.map((courier) => (
                          <MenuItem key={courier.value} value={courier.value}>
                            {courier.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="운송장번호"
                      placeholder="운송장번호를 입력하세요"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* 검증 오류 표시 */}
            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  다음 항목을 확인해주세요:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      <Typography variant="body2">{error}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {/* 모달 푸터 */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${BRAND_COLORS.BORDER}`,
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
        }}
      >
        <SecondaryButton onClick={onClose} disabled={actionLoading}>
          취소
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={actionLoading}
          startIcon={actionLoading ? <CircularProgress size={16} /> : null}
        >
          {actionLoading ? "처리중..." : "상태 변경"}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusUpdateModal;
