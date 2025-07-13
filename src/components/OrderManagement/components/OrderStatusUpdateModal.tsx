// src/components/OrderManagement/components/OrderStatusUpdateModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useSellerOrderActions } from "@/hooks/useSellerOrders";
import type {
  OrderStatus,
  OrderStatusUpdateRequest,
} from "@/types/sellerOrder.types";
import {
  ORDER_STATUS_LABELS,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/types/sellerOrder.types";

interface OrderStatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  currentStatus: OrderStatus;
  onSuccess?: () => void;
}

/**
 * 주문 상태 변경 모달
 * 판매자가 주문의 상태를 변경할 수 있는 모달
 */
const OrderStatusUpdateModal: React.FC<OrderStatusUpdateModalProps> = ({
  open,
  onClose,
  orderNumber,
  currentStatus,
  onSuccess,
}) => {
  // 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [reason, setReason] = useState("");
  const [isDelayed, setIsDelayed] = useState(false);
  const [expectedShipDate, setExpectedShipDate] = useState("");

  // 액션 훅
  const { loading, error, updateOrderStatus } = useSellerOrderActions();

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setSelectedStatus("");
      setReason("");
      setIsDelayed(false);
      setExpectedShipDate("");
    }
  }, [open]);

  // 현재 상태에서 전환 가능한 상태들
  const availableStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  // 취소 요청인지 확인
  const isCancellationRequest = selectedStatus === "CANCELLED";

  // 사유 입력 필수 여부
  const isReasonRequired = isCancellationRequest || isDelayed;

  // 상태 변경 처리
  const handleSubmit = async () => {
    if (!selectedStatus) {
      return;
    }

    if (isReasonRequired && !reason.trim()) {
      return;
    }

    const request: OrderStatusUpdateRequest = {
      orderNumber,
      newStatus: selectedStatus,
      reason: reason.trim() || undefined,
      isDelayed,
      expectedShipDate: expectedShipDate || undefined,
    };

    try {
      const result = await updateOrderStatus(request);

      if (result) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      // 에러는 훅에서 처리됨
    }
  };

  // 상태 변경 시 관련 필드 초기화
  const handleStatusChange = (status: OrderStatus) => {
    setSelectedStatus(status);

    // 취소가 아닌 경우 지연 관련 필드 초기화
    if (status !== "CANCELLED") {
      setIsDelayed(false);
      setExpectedShipDate("");
    }
  };

  // 지연 체크박스 변경 시
  const handleDelayedChange = (checked: boolean) => {
    setIsDelayed(checked);
    if (!checked) {
      setExpectedShipDate("");
    }
  };

  // 오늘 날짜 (YYYY-MM-DD 형식)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            주문 상태 변경
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent>
        {/* 현재 주문 정보 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            주문번호: {orderNumber}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">현재 상태:</Typography>
            <Chip
              label={ORDER_STATUS_LABELS[currentStatus]}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {/* 변경할 상태 선택 */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>변경할 상태</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            label="변경할 상태"
            disabled={loading}
          >
            {availableStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 취소 요청 시 안내 */}
        {isCancellationRequest && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            주문을 취소하시겠습니까? 취소 사유를 반드시 입력해주세요.
          </Alert>
        )}

        {/* 출고 지연 옵션 (PREPARING 상태일 때만) */}
        {selectedStatus === "PREPARING" && (
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDelayed}
                  onChange={(e) => handleDelayedChange(e.target.checked)}
                  disabled={loading}
                />
              }
              label="출고 지연 요청"
            />
            {isDelayed && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1, mb: 2 }}>
                출고 지연 시 지연 사유와 예상 출고일을 입력해주세요.
              </Alert>
            )}
          </Box>
        )}

        {/* 예상 출고일 (지연 요청 시에만) */}
        {isDelayed && (
          <TextField
            fullWidth
            label="예상 출고일"
            type="date"
            value={expectedShipDate}
            onChange={(e) => setExpectedShipDate(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            helperText="예상 출고일을 선택해주세요"
          />
        )}

        {/* 사유 입력 */}
        <TextField
          fullWidth
          label={isReasonRequired ? "사유 (필수)" : "사유 (선택)"}
          placeholder={
            isCancellationRequest
              ? "취소 사유를 입력해주세요"
              : isDelayed
                ? "지연 사유를 입력해주세요"
                : "상태 변경 사유를 입력해주세요 (선택사항)"
          }
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          error={isReasonRequired && !reason.trim()}
          helperText={
            isReasonRequired && !reason.trim()
              ? "사유는 필수 입력 항목입니다"
              : `${reason.length}/500자`
          }
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#e5e7eb",
            color: "#6b7280",
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading || !selectedStatus || (isReasonRequired && !reason.trim())
          }
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            bgcolor: isCancellationRequest ? "#ef4444" : "#ef9942",
            "&:hover": {
              bgcolor: isCancellationRequest ? "#dc2626" : "#e08830",
            },
          }}
        >
          {loading ? "변경 중..." : "상태 변경"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusUpdateModal;
