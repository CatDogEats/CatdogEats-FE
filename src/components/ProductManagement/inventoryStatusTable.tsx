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
    TextField,
    InputAdornment,
    Button,
    Chip,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { StockItem }  from '@/components/ProductManagement/types/product.types';

interface InventoryStatusTableProps {
    stockItems: StockItem[];
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    page: number;
    rowsPerPage: number;
    totalElements: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    onAdjustStock: (item: StockItem) => void;
}

const InventoryStatusTable: React.FC<InventoryStatusTableProps> = ({
                                                                       stockItems,
                                                                       loading,
                                                                       searchTerm,
                                                                       onSearchChange,
                                                                       page,
                                                                       rowsPerPage,
                                                                       totalElements,
                                                                       onPageChange,
                                                                       onRowsPerPageChange,
                                                                       onAdjustStock,
                                                                   }) => {
    return (
        <Box sx={{ p: 3 }}>
            {/* 검색 */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="상품명으로 검색"
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{ maxWidth: 400 }}
                />
            </Box>

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
                                        상품명
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        현재 재고
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        안전 재고
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        단가
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        상태
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        최종 업데이트
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                        작업
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockItems.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.productName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {item.productNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.currentStock}개
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.safetyStock}개
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                ₩{item.unitPrice.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status}
                                                size="small"
                                                color={
                                                    item.status === "충분"
                                                        ? "success"
                                                        : item.status === "부족"
                                                            ? "warning"
                                                            : "error"
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(item.lastUpdated).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => onAdjustStock(item)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                재고 조정
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
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

export default InventoryStatusTable;
