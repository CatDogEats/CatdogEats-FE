// src/components/OrderManagement/components/OrderStatusUpdateModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import {
  BRAND_COLORS,
  PrimaryButton,
  SecondaryButton,
  FormField,
} from "@/components/SellerDashboard/SellerInfo";
import { useSellerOrderDetail } from "@/hooks/useSellerOrders";
import type { OrderStatus, CourierCompany } from "@/types/sellerOrder.types";

interface OrderStatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  currentStatus: OrderStatus;
  onSuccess: () => void;
}

// 상태별 선택 가능한 다음 상태들 (주문취소 제거됨)
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

// 택배사 옵션
const COURIER_OPTIONS: { value: CourierCompany; label: string }[] = [
  { value: "CJ_DAEHAN", label: "CJ대한통운" },
  { value: "HANJIN", label: "한진택배" },
  { value: "LOTTE", label: "롯데택배" },
  { value: "LOGEN", label: "로젠택배" },
  { value: "POST_OFFICE", label: "우체국택배" },
];

/**
 * 주문 상태 변경 모달
 * - 주문취소 선택지 완전 제거
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
  // ===== 기본 상태 =====
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  // ===== 출고 지연 관련 상태 =====
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [expectedShipDate, setExpectedShipDate] = useState("");

  // ===== 운송장 관련 상태 (배송중 선택시) =====
  const [courierCompany, setCourierCompany] = useState<CourierCompany | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // ===== 주문 상세 정보 조회 =====
  const {
    data: orderDetail,
    loading: detailLoading,
    error: detailError,
    refresh: refreshOrderDetail,
  } = useSellerOrderDetail(orderNumber);

  // ===== 모달 열릴 때 초기화 =====
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setIsDelayed(false);
      setDelayReason("");
      setExpectedShipDate("");
      setCourierCompany("");
      setTrackingNumber("");

      // 기본 예상 출고일 (3일 후)
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setExpectedShipDate(defaultDate.toISOString().split("T")[0]);

      // 주문 상세 정보 조회
      if (orderNumber) {
        refreshOrderDetail();
      }
    }
  }, [open, currentStatus, orderNumber, refreshOrderDetail]);

  // ===== 상태 변경 핸들러 =====
  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);

    // 상품준비중이 아닌 상태로 변경하면 출고 지연 해제
    if (newStatus !== "PREPARING") {
      setIsDelayed(false);
      setDelayReason("");
    }

    // 배송중이 아닌 상태로 변경하면 운송장 정보 초기화
    if (newStatus !== "IN_DELIVERY") {
      setCourierCompany("");
      setTrackingNumber("");
    }
  };

  // ===== 폼 유효성 검증 =====
  const validateForm = (): string | null => {
    // 출고 지연 시 사유 필수
    if (isDelayed && !delayReason.trim()) {
      return "출고 지연 사유를 입력해주세요.";
    }

    // 배송중으로 변경 시 운송장 정보 필수
    if (selectedStatus === "IN_DELIVERY") {
      if (!courierCompany) {
        return "택배사를 선택해주세요.";
      }
      if (!trackingNumber.trim()) {
        return "운송장 번호를 입력해주세요.";
      }
    }

    return null;
  };

  // ===== 상태 변경 제출 =====
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError); // TODO: 스낵바로 변경
      return;
    }

    try {
      setLoading(true);

      if (selectedStatus === "IN_DELIVERY") {
        // 배송중으로 변경 + 운송장 등록
        console.log("Update with tracking:", {
          orderNumber,
          newStatus: "IN_DELIVERY",
          courierCompany,
          trackingNumber,
        });
        // TODO: API 호출
      } else if (isDelayed) {
        // 출고 지연 처리
        console.log("Update with delay:", {
          orderNumber,
          newStatus: "PREPARING",
          reason: delayReason,
          isDelayed: true,
          expectedShipDate,
        });
        // TODO: API 호출
      } else {
        // 일반 상태 변경
        console.log("Update status:", {
          orderNumber,
          newStatus: selectedStatus,
        });
        // TODO: API 호출
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Status update failed:", error);
      alert("상태 변경에 실패했습니다."); // TODO: 스낵바로 변경
    } finally {
      setLoading(false);
    }
  };

  // ===== 사용 가능한 상태 목록 =====
  const availableStatuses = getAvailableStatuses(currentStatus);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: `1px solid ${BRAND_COLORS.BORDER}`,
        },
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: BRAND_COLORS.TEXT_PRIMARY }}
          >
            주문 상태 변경
          </Typography>
          <SecondaryButton onClick={onClose} sx={{ minWidth: "auto", px: 1 }}>
            <CloseIcon />
          </SecondaryButton>
        </Box>
        <Divider sx={{ mt: 1, borderColor: BRAND_COLORS.BORDER }} />
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent sx={{ p: 3 }}>
        {detailLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: BRAND_COLORS.PRIMARY }} />
          </Box>
        ) : detailError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {detailError.message}
          </Alert>
        ) : (
          <Box>
            {/* 주문 정보 */}
            <Paper
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: BRAND_COLORS.SECONDARY,
                border: `1px solid ${BRAND_COLORS.BORDER}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: BRAND_COLORS.TEXT_SECONDARY, mb: 1 }}
              >
                주문번호: <strong>{orderNumber}</strong>
              </Typography>
              {orderDetail && (
                <Typography
                  variant="body2"
                  sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                >
                  고객명: <strong>{orderDetail.recipientInfo.name}</strong> |
                  주문일:{" "}
                  <strong>
                    {new Date(orderDetail.orderDate).toLocaleDateString(
                      "ko-KR"
                    )}
                  </strong>
                </Typography>
              )}
            </Paper>

            {/* 상태 변경 선택 */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>변경할 상태</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as OrderStatus)
                  }
                  label="변경할 상태"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: BRAND_COLORS.BORDER,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: BRAND_COLORS.PRIMARY,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: BRAND_COLORS.PRIMARY,
                    },
                  }}
                >
                  {availableStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 출고 지연 옵션 (상품준비중 상태에서만) */}
            {currentStatus === "PREPARING" &&
              selectedStatus === "PREPARING" && (
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDelayed}
                        onChange={(e) => setIsDelayed(e.target.checked)}
                        sx={{
                          color: BRAND_COLORS.PRIMARY,
                          "&.Mui-checked": {
                            color: BRAND_COLORS.PRIMARY,
                          },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WarningIcon sx={{ fontSize: 16, color: "#f57c00" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          출고 지연
                        </Typography>
                      </Box>
                    }
                  />

                  {isDelayed && (
                    <Box sx={{ mt: 2, ml: 4 }}>
                      <FormField
                        label="출고 지연 사유"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="출고 지연 사유를 상세히 입력해주세요"
                        required
                        sx={{ mb: 2 }}
                      />
                      <FormField
                        label="예상 출고일"
                        type="date"
                        value={expectedShipDate}
                        onChange={(e) => setExpectedShipDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Box>
                  )}
                </Box>
              )}

            {/* 운송장 정보 입력 (배송중 선택시) */}
            {selectedStatus === "IN_DELIVERY" && (
              <Box sx={{ mb: 3 }}>
                <Divider sx={{ mb: 3, borderColor: BRAND_COLORS.BORDER }} />

                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ShippingIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                  배송 정보 입력
                </Typography>

                {/* 배송 주소 표시 */}
                {orderDetail && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: BRAND_COLORS.SECONDARY,
                      border: `1px solid ${BRAND_COLORS.BORDER}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      배송 주소
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {orderDetail.recipientInfo.address}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: BRAND_COLORS.TEXT_SECONDARY }}
                    >
                      {orderDetail.recipientInfo.name} /{" "}
                      {orderDetail.recipientInfo.phone}
                    </Typography>
                  </Paper>
                )}

                {/* 택배사 선택 */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>택배사</InputLabel>
                  <Select
                    value={courierCompany}
                    onChange={(e) =>
                      setCourierCompany(e.target.value as CourierCompany)
                    }
                    label="택배사"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: BRAND_COLORS.BORDER,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: BRAND_COLORS.PRIMARY,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: BRAND_COLORS.PRIMARY,
                      },
                    }}
                  >
                    {COURIER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 운송장 번호 입력 */}
                <FormField
                  label="운송장 번호"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="운송장 번호를 입력해주세요"
                  required
                />

                <Alert
                  severity="info"
                  sx={{ mt: 2, borderRadius: 2 }}
                  icon={<ShippingIcon />}
                >
                  운송장 번호를 입력하면 주문 상태가 자동으로 '배송중'으로
                  변경됩니다.
                </Alert>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <SecondaryButton onClick={onClose} disabled={loading}>
          취소
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={loading || availableStatuses.length === 0}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{ minWidth: 100 }}
        >
          {loading ? "처리중..." : "변경"}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusUpdateModal;
