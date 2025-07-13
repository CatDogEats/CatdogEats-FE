// src/components/OrderManagement/components/TrackingRegisterModal.tsx

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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useSellerOrderActions } from "@/hooks/useSellerOrders";
import type {
  CourierCompany,
  TrackingNumberRegisterRequest,
} from "@/types/sellerOrder.types";
import { COURIER_COMPANY_LABELS } from "@/types/sellerOrder.types";

interface TrackingRegisterModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  onSuccess?: () => void;
}

/**
 * 운송장 등록 모달
 * 판매자가 택배사와 운송장 번호를 등록할 수 있는 모달
 */
const TrackingRegisterModal: React.FC<TrackingRegisterModalProps> = ({
  open,
  onClose,
  orderNumber,
  onSuccess,
}) => {
  // 상태 관리
  const [courierCompany, setCourierCompany] = useState<CourierCompany | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentMemo, setShipmentMemo] = useState("");
  const [startShipmentImmediately, setStartShipmentImmediately] =
    useState(true);

  // 액션 훅
  const { loading, error, registerTrackingNumber } = useSellerOrderActions();

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setCourierCompany("");
      setTrackingNumber("");
      setShipmentMemo("");
      setStartShipmentImmediately(true);
    }
  }, [open]);

  // 운송장 번호 형식 검증
  const validateTrackingNumber = (
    _courier: CourierCompany,
    number: string
  ): string | null => {
    if (!number || number.length < 8) {
      return "운송장 번호는 최소 8자리 이상이어야 합니다";
    }

    // 택배사별 기본 형식 검증 (실제로는 더 정교한 검증 필요)
    const alphaNumericRegex = /^[A-Za-z0-9\-]+$/;
    if (!alphaNumericRegex.test(number)) {
      return "운송장 번호는 영문, 숫자, 하이픈만 입력 가능합니다";
    }

    return null;
  };

  // 입력 값 검증
  const trackingNumberError =
    courierCompany && trackingNumber
      ? validateTrackingNumber(courierCompany, trackingNumber)
      : null;

  const isFormValid = courierCompany && trackingNumber && !trackingNumberError;

  // 운송장 등록 처리
  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    const request: TrackingNumberRegisterRequest = {
      orderNumber,
      courierCompany: courierCompany as CourierCompany,
      trackingNumber: trackingNumber.trim(),
      shipmentMemo: shipmentMemo.trim() || undefined,
      startShipmentImmediately,
    };

    try {
      const result = await registerTrackingNumber(request);

      if (result) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      // 에러는 훅에서 처리됨
    }
  };

  // 운송장 번호 입력 시 포맷팅
  const handleTrackingNumberChange = (value: string) => {
    // 대문자로 변환하고 특수문자 제거 (하이픈 제외)
    const formatted = value.toUpperCase().replace(/[^A-Z0-9\-]/g, "");
    setTrackingNumber(formatted);
  };

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShippingIcon sx={{ color: "#ef9942" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              운송장 번호 등록
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 모달 내용 */}
      <DialogContent>
        {/* 주문 정보 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            주문번호: {orderNumber}
          </Typography>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {/* 택배사 선택 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>택배사 *</InputLabel>
          <Select
            value={courierCompany}
            onChange={(e) =>
              setCourierCompany(e.target.value as CourierCompany)
            }
            label="택배사 *"
            disabled={loading}
          >
            {Object.entries(COURIER_COMPANY_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 운송장 번호 입력 */}
        <TextField
          fullWidth
          label="운송장 번호 *"
          placeholder="운송장 번호를 입력해주세요"
          value={trackingNumber}
          onChange={(e) => handleTrackingNumberChange(e.target.value)}
          disabled={loading}
          error={!!trackingNumberError}
          helperText={
            trackingNumberError ||
            "택배사에서 발급받은 운송장 번호를 정확히 입력해주세요"
          }
          sx={{ mb: 2 }}
          inputProps={{
            maxLength: 50,
            style: { fontFamily: "monospace" },
          }}
        />

        {/* 배송 메모 */}
        <TextField
          fullWidth
          label="배송 메모 (선택)"
          placeholder="배송 시 특별 주의사항이나 메모를 입력해주세요"
          multiline
          rows={3}
          value={shipmentMemo}
          onChange={(e) => setShipmentMemo(e.target.value)}
          disabled={loading}
          helperText={`${shipmentMemo.length}/200자`}
          inputProps={{ maxLength: 200 }}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* 즉시 배송 시작 옵션 */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={startShipmentImmediately}
                onChange={(e) => setStartShipmentImmediately(e.target.checked)}
                disabled={loading}
              />
            }
            label="운송장 등록과 동시에 배송 시작"
          />

          <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
            {startShipmentImmediately
              ? "운송장 등록 후 주문 상태가 자동으로 '배송중'으로 변경됩니다."
              : "운송장만 등록되고, 별도로 상태를 '배송중'으로 변경해야 합니다."}
          </Alert>
        </Box>

        {/* 안내 메시지 */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            • 운송장 번호는 등록 후 수정할 수 없습니다
            <br />
            • 택배사에서 발급받은 정확한 번호를 입력해주세요
            <br />• 잘못된 운송장 번호로 인한 배송 지연 책임은 판매자에게
            있습니다
          </Typography>
        </Alert>
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
          disabled={loading || !isFormValid}
          startIcon={
            loading ? <CircularProgress size={16} /> : <ShippingIcon />
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
            bgcolor: "#ef9942",
            "&:hover": { bgcolor: "#e08830" },
          }}
        >
          {loading ? "등록 중..." : "운송장 등록"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrackingRegisterModal;
