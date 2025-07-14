// src/components/OrderManagement/components/OrderStatusUpdateModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Grid2 as Grid,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
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
 * 상태별 선택 가능한 다음 상태들 - 프로토타입 로직
 */
const getAvailableStatuses = (currentStatus: OrderStatus) => {
  switch (currentStatus) {
    case "PAYMENT_COMPLETED":
      return [{ value: "PREPARING", label: "상품준비중으로 변경" }];
    case "PREPARING":
      return [
        { value: "PREPARING", label: "상품준비중 유지 (출고 지연 처리)" },
        { value: "READY_FOR_SHIPMENT", label: "배송준비완료" },
      ];
    case "READY_FOR_SHIPMENT":
      return [{ value: "IN_DELIVERY", label: "배송중 (운송장 등록)" }];
    case "IN_DELIVERY":
      return [{ value: "DELIVERED", label: "배송완료" }];
    default:
      return [];
  }
};

/**
 * 택배사 옵션 - 프로토타입과 동일
 */
const COURIER_OPTIONS: { value: CourierCompany; label: string }[] = [
  { value: "CJ_DAEHAN", label: "CJ대한통운" },
  { value: "HANJIN", label: "한진택배" },
  { value: "LOTTE", label: "롯데택배" },
  { value: "LOGEN", label: "로젠택배" },
  { value: "POST_OFFICE", label: "우체국택배" },
];

/**
 * 상태 진행 단계 정의
 */
const STATUS_STEPS = [
  { key: "PAYMENT_COMPLETED", label: "결제완료", icon: <CheckIcon /> },
  { key: "PREPARING", label: "상품준비중", icon: <EditIcon /> },
  { key: "READY_FOR_SHIPMENT", label: "배송준비완료", icon: <CheckIcon /> },
  { key: "IN_DELIVERY", label: "배송중", icon: <ShippingIcon /> },
  { key: "DELIVERED", label: "배송완료", icon: <CheckIcon /> },
];

/**
 * 주문 상태 변경 모달 - 프로토타입 완전 복원
 * - 프로세스 시각화
 * - 출고지연 처리 로직
 * - 운송장 등록 통합
 * - 브랜드 스타일 적용
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

  // ===== 상태 관리 =====
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [delayReason, setDelayReason] = useState<string>("");
  const [expectedShipDate, setExpectedShipDate] = useState<Date | null>(null);
  const [courierCompany, setCourierCompany] = useState<CourierCompany | "">("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string>("basic");

  // ===== 계산된 값들 =====
  const availableStatuses = getAvailableStatuses(currentStatus);
  const currentStatusInfo = ORDER_STATUS_INFO_MAP[currentStatus];
  const selectedStatusInfo = ORDER_STATUS_INFO_MAP[selectedStatus];
  const isDelayProcess =
    selectedStatus === "PREPARING" && currentStatus === "PREPARING";
  const isShippingProcess = selectedStatus === "IN_DELIVERY";

  // 현재 상태의 스텝 인덱스 계산
  const getCurrentStepIndex = () => {
    return STATUS_STEPS.findIndex((step) => step.key === currentStatus);
  };

  const getSelectedStepIndex = () => {
    return STATUS_STEPS.findIndex((step) => step.key === selectedStatus);
  };

  // ===== 폼 제출 핸들러 =====
  const handleSubmit = async () => {
    const errors: string[] = [];

    // 기본 검증
    if (!selectedStatus) errors.push("변경할 상태를 선택해주세요.");

    // 배송중 변경 시 운송장 정보 검증
    if (isShippingProcess) {
      if (!courierCompany) errors.push("택배사를 선택해주세요.");
      if (!trackingNumber.trim()) errors.push("운송장번호를 입력해주세요.");
    }

    // 출고 지연 처리 시 필수 정보 검증
    if (isDelayProcess) {
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
        ...(isShippingProcess && {
          courierCompany: courierCompany as CourierCompany,
          trackingNumber: trackingNumber.trim(),
        }),
        ...(isDelayProcess && {
          reason: delayReason.trim(),
          isDelayed: true,
          expectedShipDate: expectedShipDate?.toISOString(),
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
      setExpectedShipDate(null);
      setCourierCompany("");
      setTrackingNumber("");
      setValidationErrors([]);
      setExpandedSection("basic");
    }
  }, [open, currentStatus]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            maxHeight: "90vh",
            border: `2px solid ${BRAND_COLORS.BORDER}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* 모달 헤더 */}
        <DialogTitle
          sx={{
            p: 0,
            background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.PRIMARY_HOVER} 100%)`,
            color: "white",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <EditIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  주문 상태 변경
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  주문번호: {orderNumber}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogTitle>

        {/* 모달 콘텐츠 */}
        <DialogContent sx={{ p: 0 }}>
          {detailLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress
                size={40}
                sx={{ color: BRAND_COLORS.PRIMARY }}
              />
              <Typography variant="body1" color="text.secondary">
                주문 정보를 불러오는 중...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {/* 진행 상태 시각화 */}
              <Card sx={{ mb: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: BRAND_COLORS.TEXT_PRIMARY,
                    }}
                  >
                    주문 처리 진행상황
                  </Typography>

                  <Stepper activeStep={getCurrentStepIndex()} alternativeLabel>
                    {STATUS_STEPS.map((step, index) => (
                      <Step key={step.key}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                backgroundColor:
                                  index <= getCurrentStepIndex()
                                    ? BRAND_COLORS.PRIMARY
                                    : index === getSelectedStepIndex()
                                      ? "#1976d2"
                                      : BRAND_COLORS.BORDER,
                                color:
                                  index <= getCurrentStepIndex() ||
                                  index === getSelectedStepIndex()
                                    ? "white"
                                    : BRAND_COLORS.TEXT_SECONDARY,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border:
                                  index === getSelectedStepIndex()
                                    ? "2px solid #1976d2"
                                    : "none",
                                boxShadow:
                                  index === getSelectedStepIndex() ? 2 : 0,
                              }}
                            >
                              {step.icon}
                            </Box>
                          )}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight:
                                index <= getCurrentStepIndex() ? 600 : 400,
                              color:
                                index <= getCurrentStepIndex()
                                  ? BRAND_COLORS.TEXT_PRIMARY
                                  : BRAND_COLORS.TEXT_SECONDARY,
                            }}
                          >
                            {step.label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>

              {/* 기본 상태 변경 정보 */}
              <Accordion
                expanded={expandedSection === "basic"}
                onChange={() =>
                  setExpandedSection(expandedSection === "basic" ? "" : "basic")
                }
                sx={{ mb: 2, border: `1px solid ${BRAND_COLORS.BORDER}` }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <InfoIcon sx={{ color: BRAND_COLORS.PRIMARY }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      기본 상태 변경 정보
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid xs={12} sm={6}>
                      <Card
                        sx={{
                          p: 2,
                          backgroundColor: BRAND_COLORS.BACKGROUND_LIGHT,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          현재 상태
                        </Typography>
                        <Chip
                          label={currentStatusInfo.label}
                          color={currentStatusInfo.color}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: BRAND_COLORS.TEXT_SECONDARY }}
                        >
                          {currentStatusInfo.description}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>변경할 상태</InputLabel>
                        <Select
                          value={selectedStatus}
                          onChange={(e) =>
                            setSelectedStatus(e.target.value as OrderStatus)
                          }
                          label="변경할 상태"
                        >
                          {availableStatuses.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {selectedStatus !== currentStatus && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>{currentStatusInfo.label}</strong>에서{" "}
                            <strong>{selectedStatusInfo.label}</strong>로
                            변경됩니다.
                          </Typography>
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* 출고 지연 처리 섹션 */}
              {isDelayProcess && (
                <Accordion
                  expanded={expandedSection === "delay"}
                  onChange={() =>
                    setExpandedSection(
                      expandedSection === "delay" ? "" : "delay"
                    )
                  }
                  sx={{ mb: 2, border: `1px solid #f57c00` }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ScheduleIcon sx={{ color: "#f57c00" }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#f57c00" }}
                      >
                        출고 지연 처리
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        출고 지연 처리를 진행합니다
                      </Typography>
                      <Typography variant="body2">
                        고객에게 지연 사유와 예상 출고일이 안내됩니다.
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid xs={12}>
                        <TextField
                          fullWidth
                          label="지연 사유"
                          placeholder="예: 원재료 수급 지연, 제조 과정에서 품질 검수 필요 등"
                          multiline
                          rows={3}
                          value={delayReason}
                          onChange={(e) => setDelayReason(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <DatePicker
                          label="예상 출고일"
                          value={expectedShipDate}
                          onChange={(date) => setExpectedShipDate(date)}
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* 운송장 등록 섹션 */}
              {isShippingProcess && (
                <Accordion
                  expanded={expandedSection === "shipping"}
                  onChange={() =>
                    setExpandedSection(
                      expandedSection === "shipping" ? "" : "shipping"
                    )
                  }
                  sx={{ mb: 2, border: `1px solid #1976d2` }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ShippingIcon sx={{ color: "#1976d2" }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        운송장 정보 등록
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        배송 시작 처리
                      </Typography>
                      <Typography variant="body2">
                        택배사와 운송장번호를 등록하면 고객이 배송 추적을 할 수
                        있습니다.
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>택배사</InputLabel>
                          <Select
                            value={courierCompany}
                            onChange={(e) =>
                              setCourierCompany(
                                e.target.value as CourierCompany
                              )
                            }
                            label="택배사"
                          >
                            {COURIER_OPTIONS.map((courier) => (
                              <MenuItem
                                key={courier.value}
                                value={courier.value}
                              >
                                {courier.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
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
                  </AccordionDetails>
                </Accordion>
              )}

              {/* 검증 오류 표시 */}
              {validationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    다음 항목을 확인해주세요:
                  </Typography>
                  <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                    {validationErrors.map((error, index) => (
                      <li key={index}>
                        <Typography variant="body2">{error}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}

              {/* 변경 예정 상태 미리보기 */}
              {selectedStatus !== currentStatus && (
                <Card
                  sx={{
                    border: `2px solid ${selectedStatusInfo.color === "primary" ? BRAND_COLORS.PRIMARY : "#1976d2"}`,
                    backgroundColor: `${selectedStatusInfo.color === "primary" ? BRAND_COLORS.PRIMARY : "#1976d2"}08`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <SendIcon
                        sx={{
                          color:
                            selectedStatusInfo.color === "primary"
                              ? BRAND_COLORS.PRIMARY
                              : "#1976d2",
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        변경 후 상태 미리보기
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedStatusInfo.label}
                      color={selectedStatusInfo.color}
                      variant="filled"
                      sx={{ fontWeight: 600, fontSize: "0.875rem", height: 32 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 2, color: BRAND_COLORS.TEXT_SECONDARY }}
                    >
                      {selectedStatusInfo.description}
                    </Typography>
                  </CardContent>
                </Card>
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
            gap: 2,
          }}
        >
          <SecondaryButton
            onClick={onClose}
            disabled={actionLoading}
            sx={{ minWidth: 120, py: 1.5 }}
          >
            취소
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={actionLoading || selectedStatus === currentStatus}
            startIcon={
              actionLoading ? <CircularProgress size={16} /> : <EditIcon />
            }
            sx={{ minWidth: 120, py: 1.5 }}
          >
            {actionLoading ? "처리중..." : "상태 변경"}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default OrderStatusUpdateModal;
