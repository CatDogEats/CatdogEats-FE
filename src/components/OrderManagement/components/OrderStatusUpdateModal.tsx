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
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
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
  const [reason, setReason] = useState("");

  // ===== 출고 지연 관련 상태 =====
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [expectedShipDate, setExpectedShipDate] = useState("");

  // ===== 운송장 관련 상태 (배송중 선택시) =====
  const [courierCompany, setCourierCompany] = useState<CourierCompany | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // ===== UI 상태 =====
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ===== 사용 가능한 상태 목록 =====
  const availableStatuses = getAvailableStatuses(currentStatus);

  // ===== 초기값 설정 =====
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setReason("");
      setIsDelayed(false);
      setDelayReason("");
      setExpectedShipDate("");
      setCourierCompany("");
      setTrackingNumber("");
      setErrors({});
    }
  }, [open, currentStatus]);

  // ===== 유효성 검사 =====
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 배송중으로 변경하는 경우 운송장 정보 필수
    if (selectedStatus === "IN_DELIVERY") {
      if (!courierCompany) {
        newErrors.courierCompany = "택배사를 선택해주세요.";
      }
      if (!trackingNumber) {
        newErrors.trackingNumber = "운송장 번호를 입력해주세요.";
      } else if (trackingNumber.length < 8) {
        newErrors.trackingNumber = "올바른 운송장 번호를 입력해주세요.";
      }
    }

    // 출고 지연인 경우 추가 정보 필수
    if (isDelayed) {
      if (!delayReason) {
        newErrors.delayReason = "지연 사유를 입력해주세요.";
      }
      if (!expectedShipDate) {
        newErrors.expectedShipDate = "예상 출고일을 선택해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== 제출 핸들러 =====
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const request: OrderStatusUpdateRequest = {
        orderNumber,
        newStatus: selectedStatus,
        reason: reason || undefined,
        isDelayed: isDelayed || undefined,
        expectedShipDate: expectedShipDate || undefined,
        courierCompany: courierCompany || undefined,
        trackingNumber: trackingNumber || undefined,
      };

      await updateOrderStatus(request);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("주문 상태 변경 실패:", error);
    }
  };

  // ===== 날짜 포맷 헬퍼 =====
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ===== 상태 정보 표시 =====
  const currentStatusInfo = ORDER_STATUS_INFO_MAP[currentStatus];
  const selectedStatusInfo = ORDER_STATUS_INFO_MAP[selectedStatus];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
          borderBottom: `1px solid ${BRAND_COLORS.BORDER}`,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: BRAND_COLORS.TEXT_PRIMARY,
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            주문 상태 변경
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: BRAND_COLORS.TEXT_SECONDARY,
            }}
          >
            주문번호: {orderNumber}
          </Typography>
        </Box>
        <SecondaryButton onClick={onClose} size="small">
          <CloseIcon />
        </SecondaryButton>
      </DialogTitle>

      {/* 모달 내용 */}
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
                    <Grid xs={6}>
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
                    <Grid xs={6}>
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
                    <Grid xs={12}>
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
                    <strong>{currentStatusInfo.label}</strong> →{" "}
                    <strong>{selectedStatusInfo.label}</strong>
                    <br />
                    {selectedStatusInfo.description}
                  </Typography>
                </Alert>
              )}

              {/* 변경 사유 */}
              <TextField
                fullWidth
                label="변경 사유 (선택사항)"
                multiline
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="상태 변경 사유를 입력하세요"
                sx={{ mb: 2 }}
              />
            </Box>

            {/* 출고 지연 처리 */}
            {(selectedStatus === "PREPARING" ||
              currentStatus === "PREPARING") && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: "#fff3e0",
                  border: "1px solid #ffb74d",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isDelayed}
                      onChange={(e) => setIsDelayed(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleIcon sx={{ color: "#f57c00", fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        출고 지연 요청
                      </Typography>
                    </Box>
                  }
                />

                {isDelayed && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <TextField
                      fullWidth
                      label="지연 사유"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      error={!!errors.delayReason}
                      helperText={errors.delayReason}
                      sx={{ mb: 2 }}
                      required
                    />

                    <TextField
                      fullWidth
                      label="예상 출고일"
                      type="date"
                      value={expectedShipDate}
                      onChange={(e) => setExpectedShipDate(e.target.value)}
                      error={!!errors.expectedShipDate}
                      helperText={errors.expectedShipDate}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      required
                    />
                  </Box>
                )}
              </Paper>
            )}

            {/* 운송장 정보 입력 (배송중으로 변경시) */}
            {selectedStatus === "IN_DELIVERY" && (
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#e3f2fd",
                  border: "1px solid #90caf9",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <ShippingIcon sx={{ color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    운송장 정보 등록
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    배송중 상태로 변경하려면 운송장 정보를 등록해야 합니다.
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={!!errors.courierCompany}
                      required
                    >
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
                      {errors.courierCompany && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors.courierCompany}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="운송장 번호"
                      value={trackingNumber}
                      onChange={(e) =>
                        setTrackingNumber(e.target.value.replace(/\D/g, ""))
                      }
                      error={!!errors.trackingNumber}
                      helperText={errors.trackingNumber}
                      placeholder="숫자만 입력"
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* 경고 메시지 */}
            {selectedStatus !== currentStatus && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>주의:</strong> 주문 상태를 변경하면 되돌릴 수
                  없습니다. 변경하기 전에 신중히 확인해주세요.
                </Typography>
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
          disabled={actionLoading || selectedStatus === currentStatus}
          startIcon={actionLoading ? <CircularProgress size={16} /> : null}
        >
          {actionLoading ? "처리중..." : "상태 변경"}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusUpdateModal;
