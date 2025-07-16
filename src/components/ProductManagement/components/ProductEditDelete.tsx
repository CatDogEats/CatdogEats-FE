import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Typography, TextField, InputAdornment, Chip, Avatar,
  Alert, Snackbar, Menu, MenuItem
} from "@mui/material";
import {
  Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, MoreVert as MoreVertIcon
} from "@mui/icons-material";
import {
  fetchSellerProducts, deleteProduct, mapApiProductToForm, ProductFormData
} from "@/service/product/ProductAPI";
import ProductEditDialog from "./ProductEditDialog";

const ProductEditDelete: React.FC = () => {
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  // 상품 목록 불러오기
  const loadProducts = async () => {
    try {
      const res = await fetchSellerProducts(page, rowsPerPage);
      setProducts(res.data.content.map(mapApiProductToForm));
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      setAlertMessage("상품 목록을 불러오지 못했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, rowsPerPage]);

  const filteredProducts = products.filter(
      (product) =>
          product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (
      event: React.MouseEvent<HTMLElement>,
      product: ProductFormData
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
    console.log('selectedProduct:', product);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    // setSelectedProduct(null);
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };
  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setAlertMessage("상품이 삭제되었습니다.");
      setAlertSeverity("success");
      setShowAlert(true);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err: any) {
      setAlertMessage("상품 삭제에 실패했습니다.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  return (
      <Box sx={{ p: 2 }}>
        {/* 검색 및 필터 */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#2d2a27", fontWeight: 600 }}>
            상품 수정/삭제
          </Typography>
          <TextField
              size="small"
              placeholder="상품명 또는 카테고리로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#5c5752" }} />
                    </InputAdornment>
                ),
              }}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": { backgroundColor: "#f9fafb", borderRadius: 2 }
              }}
          />
        </Box>

        {/* 상품 테이블 */}
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>상품명</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>카테고리</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>타입</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>가격</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>재고</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>등록/수정일</TableCell>
                  <TableCell sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                    .slice(0, rowsPerPage)
                    .map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Avatar
                                  variant="rounded"
                                  src={product.images[0]}
                                  sx={{
                                    width: 48, height: 48,
                                    backgroundColor: "#f9fafb", color: "#5c5752"
                                  }}
                              >
                                📦
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>{product.productName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {product.productNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={product.category} size="small"
                                  sx={{ backgroundColor: "#fdecdb", color: "#ef9942" }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={product.productType} size="small"
                                  sx={{ backgroundColor: "#e5f6fd", color: "#42a5f5" }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              ₩{product.price.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{product.stockQuantity}개</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(product.updatedAt ?? "").toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={(e) => handleMenuOpen(e, product)} size="small" sx={{ color: "#5c5752" }}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) => `${count}개 중 ${from}-${to}`}
          />
        </Paper>

        {/* 작업 메뉴 */}
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ sx: { borderRadius: 2, minWidth: 150 } }}
        >
          <MenuItem onClick={handleEdit} sx={{ gap: 1 }}>
            <EditIcon fontSize="small" /> 수정
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ gap: 1, color: "error.main" }}>
            <DeleteIcon fontSize="small" /> 삭제
          </MenuItem>
        </Menu>

        {/* 수정 다이얼로그 */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>상품 수정</DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedProduct && (
                <ProductEditDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    product={selectedProduct}
                    onSuccess={() => {
                      setEditDialogOpen(false);
                      setSelectedProduct(null);
                      loadProducts();
                    }}
                />
            )}
          </DialogContent>
        </Dialog>

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>상품 삭제 확인</DialogTitle>
          <DialogContent>
            <Typography>
              "{selectedProduct?.productName}" 상품을 정말 삭제하시겠습니까?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              삭제된 상품은 복구할 수 없습니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button
                onClick={confirmDelete}
                color="error"
                variant="contained"
                sx={{ borderRadius: 2 }}
            >
              삭제
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
  );
};

export default ProductEditDelete;
