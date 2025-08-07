// src/components/ProductManagement/components/CouponManagement.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";

// API imports
import {
  sellerCouponApi,
  type SellerCouponListResponse,
  type SellerCreateCouponRequest,
  type SellerModifyCouponRequest
} from "@/service/coupons/couponApi.ts";

// API 응답에 맞는 쿠폰 타입 정의
interface Coupon {
  id: string;
  code: string;
  couponName: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  vendorName?: string;
  createdAt?: Date;
}

interface CouponFormData {
  couponName: string;
  code: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number;
}

// 쿠폰 삭제 확인 다이얼로그를 위한 상태 타입
interface DeleteConfirmState {
  open: boolean;
  couponToDelete: Coupon | null;
  inputCode: string;
}

const CouponManagement = () => {
  // 상태 관리
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CouponFormData>({
    couponName: "",
    code: "",
    discountType: "PERCENT",
    discountValue: 0,
    startDate: null,
    endDate: null,
    usageLimit: 1,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 5;

  // 쿠폰 삭제 확인 다이얼로그 상태
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    couponToDelete: null,
    inputCode: "",
  });

  // 삭제 버튼 활성화 여부
  const isDeleteButtonEnabled =
      deleteConfirm.inputCode === deleteConfirm.couponToDelete?.code;

  // --- 핸들러들 (컴포넌트 스코프) ---
  const fetchCoupons = async (currentPage: number = page) => {
    setLoading(true);
    try {
      const response = await sellerCouponApi.getSellerCoupons(currentPage, rowsPerPage);
      const transformed: Coupon[] = response.map((c: SellerCouponListResponse) => ({
        id: c.id,
        code: c.code,
        couponName: c.couponName,
        discountType: c.discountType,
        discountValue: c.discountValue,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
        usageLimit: c.usageLimit,
        vendorName: c.vendorName,
        createdAt: new Date(),
      }));
      setCoupons(transformed);
      if (transformed.length < rowsPerPage) {
        setTotalCount(currentPage * rowsPerPage + transformed.length);
      } else {
        setTotalCount((currentPage + 1) * rowsPerPage + 1);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setAlertMessage("쿠폰 목록을 불러오는데 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setFormData({
      couponName: "",
      code: "",
      discountType: "PERCENT",
      discountValue: 0,
      startDate: null,
      endDate: null,
      usageLimit: 1,
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      couponName: coupon.couponName,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setDeleteConfirm({
      open: true,
      couponToDelete: coupon,
      inputCode: "",
    });
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirm({ open: false, couponToDelete: null, inputCode: "" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.couponToDelete) return;
    setSubmitting(true);
    try {
      await sellerCouponApi.deleteSellerCoupon({
        id: deleteConfirm.couponToDelete.id,
      });
      setAlertMessage("쿠폰이 삭제되었습니다.");
      setAlertSeverity("success");
      setShowAlert(true);
      handleDeleteConfirmClose();
      await fetchCoupons(page);
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      setAlertMessage("쿠폰 삭제에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setAlertMessage("쿠폰 코드가 복사되었습니다.");
    setAlertSeverity("success");
    setShowAlert(true);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRefresh = () => fetchCoupons(page);

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleFormChange = (field: keyof CouponFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.couponName || !formData.code || !formData.startDate || !formData.endDate) {
      setAlertMessage("모든 필수 항목을 입력해주세요.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    setSubmitting(true);
    try {
      if (editingCoupon) {
        const req: SellerModifyCouponRequest = {
          id: editingCoupon.id,
          couponName: formData.couponName,
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          usageLimit: formData.usageLimit,
        };
        await sellerCouponApi.updateSellerCoupon(req);
        setAlertMessage("쿠폰이 수정되었습니다.");
      } else {
        const req: SellerCreateCouponRequest = {
          code: formData.code,
          couponName: formData.couponName,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          usageLimit: formData.usageLimit,
        };
        await sellerCouponApi.createSellerCoupon(req);
        setAlertMessage("쿠폰이 등록되었습니다.");
      }
      setAlertSeverity("success");
      setShowAlert(true);
      handleDialogClose();
      await fetchCoupons(0);
      setPage(0);
    } catch (error) {
      console.error("Failed to submit coupon:", error);
      setAlertMessage(editingCoupon ? "쿠폰 수정에 실패했습니다." : "쿠폰 등록에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };
  // --- 핸들러 끝 ---

  // 마운트 & 페이지 변경 시 데이터 로딩
  useEffect(() => { fetchCoupons(0); }, []);
  useEffect(() => { fetchCoupons(page); }, [page]);

  // JSX 반환
  return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Box sx={{ p: 2 }}>
          {/* 헤더 */}
          <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
          >
            <Typography variant="h6" sx={{ color: "#2d2a27", fontWeight: 600 }}>
              쿠폰 관리
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    borderColor: "#ef9942",
                    color: "#ef9942",
                    "&:hover": {
                      borderColor: "#d6853c",
                      backgroundColor: "rgba(239, 153, 66, 0.04)"
                    },
                  }}
              >
                새로고침
              </Button>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsDialogOpen(true)}
                  disabled={loading || submitting}
                  sx={{
                    backgroundColor: "#ef9942",
                    "&:hover": { backgroundColor: "#d6853c" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
              >
                새 쿠폰 등록
              </Button>
            </Box>
          </Box>

          {/* 쿠폰 목록 */}
          <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                  <CircularProgress size={40} sx={{ color: "#ef9942" }} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    쿠폰 목록을 불러오는 중...
                  </Typography>
                </Box>
            ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            쿠폰명
                          </TableCell>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            쿠폰 코드
                          </TableCell>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            할인 정보
                          </TableCell>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            사용 제한
                          </TableCell>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            사용 기간
                          </TableCell>
                          <TableCell
                              sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                          >
                            관리
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coupons.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  등록된 쿠폰이 없습니다.
                                </Typography>
                              </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {coupon.couponName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                      <Typography
                                          variant="body2"
                                          sx={{ fontFamily: "monospace" }}
                                      >
                                        {coupon.code}
                                      </Typography>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleCopyCode(coupon.code)}
                                          sx={{ color: "#5c5752" }}
                                      >
                                        <CopyIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {coupon.discountType === "PERCENT"
                                          ? `${coupon.discountValue}% 할인`
                                          : `${coupon.discountValue.toLocaleString()}원 할인`}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {coupon.usageLimit.toLocaleString()}회
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {coupon.startDate.toLocaleDateString()} ~{" "}
                                      {coupon.endDate.toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleEdit(coupon)}
                                          disabled={submitting}
                                          sx={{ color: "#5c5752" }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleDeleteClick(coupon)}
                                          disabled={submitting}
                                          sx={{ color: "#f44336" }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 페이지네이션 */}
                  {coupons.length > 0 && (
                      <TablePagination
                          component="div"
                          count={totalCount}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          labelDisplayedRows={({ from, to, count }) =>
                              `${count !== -1 ? count : `${to}+`}개 중 ${from}-${to}`
                          }
                          showFirstButton
                          showLastButton
                          sx={{
                            "& .MuiTablePagination-selectLabel": {
                              display: "none",
                            },
                            "& .MuiTablePagination-select": {
                              display: "none",
                            },
                            "& .MuiTablePagination-selectIcon": {
                              display: "none",
                            },
                          }}
                      />
                  )}
                </>
            )}
          </Paper>
            {/* 쿠폰 등록/수정 다이얼로그 */}
            <Dialog
                open={isDialogOpen}
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
            >
              <DialogTitle>
                {editingCoupon ? "쿠폰 수정" : "새 쿠폰 등록"}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {/* 쿠폰 이름 */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="쿠폰 이름"
                        value={formData.couponName}
                        onChange={(e) => handleFormChange("couponName", e.target.value)}
                        placeholder="예: 여름맞이 15% 할인"
                        required
                        disabled={submitting}
                    />
                  </Grid>

                  {/* 쿠폰 코드 */}
                  <Grid size={{ xs: 8 }}>
                    <TextField
                        fullWidth
                        label="쿠폰 코드"
                        value={formData.code}
                        onChange={(e) =>
                            handleFormChange("code", e.target.value.toUpperCase())
                        }
                        placeholder="예: SUMMER15"
                        required
                        disabled={submitting}
                        inputProps={{ style: { fontFamily: "monospace" } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleFormChange("code", generateCouponCode())}
                        disabled={submitting}
                        sx={{ height: "56px", textTransform: "none" }}
                    >
                      자동 생성
                    </Button>
                  </Grid>

                  {/* 할인 유형 */}
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth disabled={submitting}>
                      <InputLabel>할인 유형</InputLabel>
                      <Select
                          value={formData.discountType}
                          onChange={(e) =>
                              handleFormChange("discountType", e.target.value)
                          }
                          label="할인 유형"
                      >
                        <MenuItem value="PERCENT">정률 할인 (%)</MenuItem>
                        <MenuItem value="AMOUNT">정액 할인 (원)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 할인 값 */}
                  <Grid size={{ xs: 6 }}>
                    <TextField
                        fullWidth
                        label={`할인 ${formData.discountType === "PERCENT" ? "율" : "금액"}`}
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) =>
                            handleFormChange("discountValue", Number(e.target.value))
                        }
                        disabled={submitting}
                        InputProps={{
                          endAdornment:
                              formData.discountType === "PERCENT" ? "%" : "원",
                        }}
                    />
                  </Grid>

                  {/* 사용 제한 횟수 */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="사용 제한 횟수"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) =>
                            handleFormChange("usageLimit", Number(e.target.value))
                        }
                        disabled={submitting}
                        InputProps={{ endAdornment: "회" }}
                        inputProps={{ min: 1 }}
                    />
                  </Grid>

                  {/* 사용 기간 */}
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                        label="시작일"
                        value={formData.startDate}
                        onChange={(date: Date | null) =>
                            handleFormChange("startDate", date)
                        }
                        disabled={submitting}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: false,
                            helperText: "",
                          },
                        }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                        label="종료일"
                        value={formData.endDate}
                        onChange={(date: Date | null) =>
                            handleFormChange("endDate", date)
                        }
                        disabled={submitting}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: false,
                            helperText: "",
                          },
                        }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} disabled={submitting}>
                  취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      backgroundColor: "#ef9942",
                      "&:hover": { backgroundColor: "#d6853c" },
                      "&:disabled": { backgroundColor: "#e0e0e0" },
                    }}
                >
                  {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                        {editingCoupon ? "수정 중..." : "등록 중..."}
                      </>
                  ) : (
                      editingCoupon ? "수정" : "등록"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            {/* 쿠폰 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteConfirm.open}
                onClose={handleDeleteConfirmClose}
                maxWidth="sm"
                fullWidth
            >
              <DialogTitle sx={{ color: "#d32f2f", fontWeight: 600 }}>
                쿠폰 삭제 확인
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>{deleteConfirm.couponToDelete?.couponName}</strong> 쿠폰을
                    삭제하시겠습니까?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    삭제하시려면 아래에 쿠폰 코드를 정확히 입력해주세요.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    쿠폰 코드: <strong>{deleteConfirm.couponToDelete?.code}</strong>
                  </Typography>
                  <TextField
                      fullWidth
                      label="쿠폰 코드를 입력하세요"
                      value={deleteConfirm.inputCode}
                      onChange={(e) =>
                          setDeleteConfirm((prev) => ({
                            ...prev,
                            inputCode: e.target.value,
                          }))
                      }
                      placeholder={deleteConfirm.couponToDelete?.code}
                      disabled={submitting}
                      sx={{ mt: 2 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteConfirmClose} disabled={submitting}>
                  취소
                </Button>
                <Button
                    onClick={handleDeleteConfirm}
                    variant="contained"
                    color="error"
                    disabled={!isDeleteButtonEnabled || submitting}
                    sx={{
                      "&:disabled": {
                        backgroundColor: "#e0e0e0",
                        color: "#9e9e9e",
                      },
                    }}
                >
                  {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                        삭제 중...
                      </>
                  ) : (
                      "삭제"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            {/* 알림 스낵바 */}
            <Snackbar
                open={showAlert}
                autoHideDuration={4000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                  onClose={() => setShowAlert(false)}
                  severity={alertSeverity}
                  sx={{ width: "100%" }}
              >
                {alertMessage}
              </Alert>
            </Snackbar>
        </Box>
      </LocalizationProvider>
);
};

export default CouponManagement;