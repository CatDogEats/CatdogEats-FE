import React from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Typography,
    Chip,
    CircularProgress,
} from "@mui/material";

import { StockItem } from '@/components/ProductManagement/types/product.types';

interface AdjustForm {
    type: "입고" | "출고" | "조정";
    quantity: string;
    orderNumber: string;
    safetyStock: string;
    notes: string;
}

interface InventoryAdjustmentDialogProps {
    open: boolean;
    onClose: () => void;
    selectedItem: StockItem | null;
    adjustForm: AdjustForm;
    onFormChange: (form: AdjustForm) => void;
    onSubmit: () => void;
    loading: boolean;
}

const InventoryAdjustmentDialog: React.FC<InventoryAdjustmentDialogProps> = ({
                                                                                 open,
                                                                                 onClose,
                                                                                 selectedItem,
                                                                                 adjustForm,
                                                                                 onFormChange,
                                                                                 onSubmit,
                                                                                 loading,
                                                                             }) => {
    const handleFormChange = (field: keyof AdjustForm, value: string) => {
        onFormChange({ ...adjustForm, [field]: value });
    };

    const calculateExpectedStock = () => {
        if (!selectedItem) return 0;

        const quantityValue = parseInt(adjustForm.quantity) || 0;
        let adjustment = quantityValue;
        if (adjustForm.type === "출고") {
            adjustment = -Math.abs(quantityValue);
        }
        return Math.max(0, selectedItem.currentStock + adjustment);
    };

    const getExpectedStatus = () => {
        const expectedStock = calculateExpectedStock();
        const safetyStockValue = parseInt(adjustForm.safetyStock) || selectedItem?.safetyStock || 0;

        if (expectedStock === 0) return { status: "품절", color: "error.main" };
        if (expectedStock <= safetyStockValue) return { status: "부족", color: "warning.main" };
        return { status: "충분", color: "success.main" };
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
            <DialogTitle>재고 조정 - {selectedItem?.productName}</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            현재 재고: {selectedItem?.currentStock}개 | 안전 재고:{" "}
                            {selectedItem?.safetyStock}개
                        </Typography>
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>조정 유형</InputLabel>
                        <Select
                            value={adjustForm.type}
                            label="조정 유형"
                            onChange={(e) =>
                                handleFormChange("type", e.target.value as "입고" | "출고" | "조정")
                            }
                        >
                            <MenuItem value="입고">입고</MenuItem>
                            <MenuItem value="출고">출고</MenuItem>
                            <MenuItem value="조정">조정</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="수량"
                        type="number"
                        value={adjustForm.quantity}
                        onChange={(e) => handleFormChange("quantity", e.target.value)}
                        placeholder="수량을 입력하세요"
                        helperText={
                            adjustForm.type === "조정"
                                ? "증가는 양수(+), 감소는 음수(-)로 입력하세요"
                                : adjustForm.type === "입고"
                                    ? "입고할 수량을 입력하세요"
                                    : "출고할 수량을 입력하세요"
                        }
                    />

                    <TextField
                        fullWidth
                        label="안전 재고"
                        type="number"
                        value={adjustForm.safetyStock}
                        onChange={(e) => handleFormChange("safetyStock", e.target.value)}
                        placeholder="안전 재고 수량"
                        helperText="안전 재고는 상품 상태 판단 기준이 됩니다 (기본값: 초기 등록 수량의 50%)"
                    />

                    <TextField
                        fullWidth
                        label="주문 번호 (선택사항)"
                        value={adjustForm.orderNumber}
                        onChange={(e) => handleFormChange("orderNumber", e.target.value)}
                        placeholder="예: ORD-001"
                        helperText="관련 주문이 있는 경우 주문 번호를 입력하세요"
                    />

                    <TextField
                        fullWidth
                        label="비고 (선택사항)"
                        multiline
                        rows={3}
                        value={adjustForm.notes}
                        onChange={(e) => handleFormChange("notes", e.target.value)}
                        placeholder="조정 사유나 특이사항을 입력하세요"
                    />

                    {/* 조정 후 예상 재고 */}
                    {selectedItem && (
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: "#f5f5f5",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                조정 후 예상 재고:
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>{calculateExpectedStock()}개</span>
                                    <Chip
                                        label={getExpectedStatus().status}
                                        size="small"
                                        sx={{
                                            backgroundColor:
                                                getExpectedStatus().color === "success.main"
                                                    ? "#e8f5e8"
                                                    : getExpectedStatus().color === "warning.main"
                                                        ? "#fff3e0"
                                                        : "#ffebee",
                                            color:
                                                getExpectedStatus().color === "success.main"
                                                    ? "#2e7d32"
                                                    : getExpectedStatus().color === "warning.main"
                                                        ? "#f57c00"
                                                        : "#d32f2f",
                                        }}
                                    />
                                </Box>
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>
                    취소
                </Button>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    disabled={!adjustForm.quantity || loading}
                    sx={{ borderRadius: 2 }}
                >
                    {loading ? <CircularProgress size={20} /> : "조정 완료"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InventoryAdjustmentDialog;
