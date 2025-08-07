import React from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Typography,
    CircularProgress,
} from "@mui/material";
import {
    Add as AddIcon,
    Remove as RemoveIcon,
} from "@mui/icons-material";
import { StockItem, StockMovement }  from '@/components/ProductManagement/types/product.types';


interface InventoryMovementTableProps {
    stockMovements: StockMovement[];
    stockItems: StockItem[];
    loading: boolean;
    page: number;
    rowsPerPage: number;
    totalElements: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const InventoryMovementTable: React.FC<InventoryMovementTableProps> = ({
                                                                           stockMovements,
                                                                           loading,
                                                                           page,
                                                                           rowsPerPage,
                                                                           totalElements,
                                                                           onPageChange,
                                                                           onRowsPerPageChange,
                                                                       }) => {
    return (
        <Box sx={{ p: 3 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        날짜
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        상품명
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        유형
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        수량 변화
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        사유
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockMovements.map((movement) => {
                                    // 수량 변화 아이콘, 색상, 접두사 결정 로직
                                    let quantityIcon = null;

                                    if (movement.type === "입고") {
                                        quantityIcon = <AddIcon sx={{ color: "success.main", fontSize: 16 }} />;
                                    } else if (movement.type === "출고") {
                                        quantityIcon = <RemoveIcon sx={{ color: "error.main", fontSize: 16 }} />;
                                    } else { // 조정 (ADJUSTMENT)
                                        if (movement.quantity > 0) {
                                            quantityIcon = <AddIcon sx={{ color: "success.main", fontSize: 16 }} />;
                                        } else {
                                            quantityIcon = <RemoveIcon sx={{ color: "error.main", fontSize: 16 }} />;
                                        }
                                    }

                                    return (
                                        <TableRow key={movement.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(movement.updatedAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {movement?.productsTitle || "알 수 없음"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={movement.type}
                                                    size="small"
                                                    color={
                                                        movement.type === "입고"
                                                            ? "success"
                                                            : movement.type === "출고"
                                                                ? "error"
                                                                : "warning" // "조정"의 경우
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    {quantityIcon} {movement.quantity}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {movement.notes && (
                                                    <Typography variant="body2">
                                                        {movement.notes}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={totalElements}
                        page={page}
                        onPageChange={(_, newPage) => onPageChange(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            onRowsPerPageChange(parseInt(event.target.value, 10));
                        }}
                        labelRowsPerPage="페이지당 행 수:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${count}개 중 ${from}-${to}`
                        }
                    />
                </>
            )}
        </Box>
    );
};

export default InventoryMovementTable;
