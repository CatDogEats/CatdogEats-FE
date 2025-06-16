// src/components/ProductManagement/components/InventoryManagement.tsx

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  currentStock: number;
  availableStock: number; // 예약 재고 제거로 인해 이 필드만 사용
  safetyStock: number; // 안전 재고 (초기 등록 수량의 50%로 자동 설정)
  unitPrice: number;
  status: "충분" | "부족" | "품절";
  lastUpdated: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: "입고" | "출고" | "조정" | "반품";
  quantity: number;
  reason: string;
  date: string;
  orderNumber?: string; // 주문 번호 필드 추가
  notes?: string;
}

interface AdjustForm {
  type: "입고" | "출고" | "조정";
  quantity: string; // 빈 값 허용을 위해 string 타입으로 변경
  orderNumber: string; // 주문 번호 필드 추가
  safetyStock: string; // 안전 재고 조정 필드 추가
  notes: string;
}

const InventoryManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [adjustForm, setAdjustForm] = useState<AdjustForm>({
    type: "입고",
    quantity: "", // 빈 값으로 초기화 (0 대신)
    orderNumber: "", // 주문 번호 초기화
    safetyStock: "", // 안전 재고 빈 값으로 초기화
    notes: "",
  });

  // 목업 데이터 - 안전 재고는 초기 등록 수량의 50%로 자동 설정
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: "1",
      productId: "P001",
      productName: "유기농 치킨 & 블루베리 강아지 간식",
      supplier: "자연식품",
      currentStock: 150,
      availableStock: 150, // 예약 재고 제거로 인해 현재 재고와 동일
      safetyStock: 75, // 초기 등록 수량(150)의 50%
      unitPrice: 9990,
      status: "충분",
      lastUpdated: "2024-12-16",
    },
    {
      id: "2",
      productId: "P002",
      productName: "야생 연어 & 고구마 껌",
      supplier: "바다식품",
      currentStock: 25,
      availableStock: 25,
      safetyStock: 25, // 초기 등록 수량(50)의 50% (현재는 25개로 안전재고 기준)
      unitPrice: 14500,
      status: "부족", // 현재 재고가 안전재고와 같아서 부족
      lastUpdated: "2024-12-15",
    },
    {
      id: "3",
      productId: "P003",
      productName: "고양이 참치 크림 간식",
      supplier: "고양이마을",
      currentStock: 0,
      availableStock: 0,
      safetyStock: 20, // 초기 등록 수량(40)의 50%
      unitPrice: 7500,
      status: "품절",
      lastUpdated: "2024-12-14",
    },
  ]);

  // 재고 이동 기록 - 처리자 필드 제거
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: "1",
      productId: "P001",
      type: "입고",
      quantity: 100,
      reason: "정기 입고",
      date: "2024-12-16",
      orderNumber: "ORD-001",
      notes: "월간 정기 주문",
    },
    {
      id: "2",
      productId: "P002",
      type: "출고",
      quantity: -50,
      reason: "고객 주문",
      date: "2024-12-15",
      orderNumber: "ORD-002",
    },
    {
      id: "3",
      productId: "P001",
      type: "조정",
      quantity: 5,
      reason: "재고 점검 조정",
      date: "2024-12-15",
      notes: "실사 후 차이 조정",
    },
  ]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredStockItems = stockItems.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalInventoryValue = () => {
    return stockItems.reduce(
      (total, item) => total + item.currentStock * item.unitPrice,
      0
    );
  };

  const getLowStockCount = () => {
    return stockItems.filter((item) => item.currentStock <= item.safetyStock)
      .length;
  };

  const getOutOfStockCount = () => {
    return stockItems.filter((item) => item.status === "품절").length;
  };

  const getTotalProducts = () => {
    return stockItems.length;
  };

  const handleAdjustStock = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustForm({
      type: "입고",
      quantity: "",
      orderNumber: "",
      safetyStock: item.safetyStock.toString(), // 현재 안전재고 값으로 초기화
      notes: "",
    });
    setAdjustDialogOpen(true);
  };

  const handleAdjustSubmit = () => {
    if (!selectedItem || !adjustForm.quantity) return;

    // 수량 변화 계산 (입고: +, 출고/조정: 입력값에 따라)
    let adjustment = parseInt(adjustForm.quantity) || 0;
    if (adjustForm.type === "출고") {
      adjustment = -Math.abs(adjustment);
    } else if (adjustForm.type === "조정") {
      // 조정의 경우 입력값이 음수면 감소, 양수면 증가
      adjustment = adjustment;
    }

    const newStock = Math.max(0, selectedItem.currentStock + adjustment);
    const newSafetyStock = adjustForm.safetyStock
      ? parseInt(adjustForm.safetyStock)
      : selectedItem.safetyStock;

    // 재고 아이템 업데이트
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              currentStock: newStock,
              availableStock: newStock, // 예약 재고 제거로 현재 재고와 동일
              safetyStock: newSafetyStock, // 안전 재고 업데이트
              status:
                newStock === 0
                  ? "품절"
                  : newStock <= newSafetyStock
                    ? "부족"
                    : "충분",
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );

    // 개별 재고 이동 기록 추가 (TO-BE: 매번 독립적인 기록 생성)
    const newMovement: StockMovement = {
      id: `${Date.now()}-${Math.random()}`, // 고유 ID 생성
      productId: selectedItem.productId,
      type: adjustForm.type,
      quantity: adjustment,
      reason: `${adjustForm.type} 처리`,
      date: new Date().toISOString().split("T")[0],
      orderNumber: adjustForm.orderNumber || undefined,
      notes: adjustForm.notes,
    };

    // 기존 기록에 추가 (합산하지 않고 개별 기록으로 유지)
    setStockMovements((prev) => [newMovement, ...prev]);

    setAlertMessage("재고가 성공적으로 조정되었습니다.");
    setShowAlert(true);
    setAdjustDialogOpen(false);
    setSelectedItem(null);
    setAdjustForm({
      type: "입고",
      quantity: "",
      orderNumber: "",
      safetyStock: "",
      notes: "",
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* 재고 현황 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                  }}
                >
                  <InventoryIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    총 재고 가치
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ₩{getTotalInventoryValue().toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#fff3e0",
                    color: "#f57c00",
                  }}
                >
                  <WarningIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    재고 부족 상품
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {getLowStockCount()}개
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#ffebee",
                    color: "#d32f2f",
                  }}
                >
                  <TrendingDownIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    품절 상품
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {getOutOfStockCount()}개
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#e8f5e8",
                    color: "#2e7d32",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    총 상품 수
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {getTotalProducts()}개
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 네비게이션 */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="재고 현황" />
          <Tab label="재고 이동 기록" />
        </Tabs>

        {/* 재고 현황 탭 */}
        <TabPanel value={tabValue} index={0}>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ maxWidth: 400 }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      상품명
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      공급업체
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      현재 재고
                    </TableCell>
                    {/* 예약 재고, 최소 재고 컬럼 삭제 */}
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      단가
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      상태
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      최종 업데이트
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      작업
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStockItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.productId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.supplier}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.currentStock}개
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
                            onClick={() => handleAdjustStock(item)}
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
              count={filteredStockItems.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) =>
                `${count}개 중 ${from}-${to}`
              }
            />
          </Box>
        </TabPanel>

        {/* 재고 이동 기록 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      날짜
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      상품명
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      유형
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      수량 변화
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      사유
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                    >
                      주문번호
                    </TableCell>
                    {/* 처리자 컬럼 삭제 */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockMovements.map((movement) => {
                    const item = stockItems.find(
                      (item) => item.productId === movement.productId
                    );
                    return (
                      <TableRow key={movement.id} hover>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(movement.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item?.productName || "알 수 없음"}
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
                                  : movement.type === "조정"
                                    ? "warning"
                                    : "default"
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
                            {movement.quantity > 0 ? (
                              <AddIcon
                                sx={{ color: "success.main", fontSize: 16 }}
                              />
                            ) : (
                              <RemoveIcon
                                sx={{ color: "error.main", fontSize: 16 }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              color={
                                movement.quantity > 0
                                  ? "success.main"
                                  : "error.main"
                              }
                              fontWeight={600}
                            >
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {movement.reason}
                          </Typography>
                          {movement.notes && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {movement.notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {movement.orderNumber || "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>

      {/* 재고 조정 다이얼로그 - 안전 재고 조정 및 UI 개선 */}
      <Dialog
        open={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
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
                  setAdjustForm({ ...adjustForm, type: e.target.value as any })
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
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, quantity: e.target.value })
              }
              placeholder="수량을 입력하세요"
              helperText={
                adjustForm.type === "조정"
                  ? "증가는 양수(+), 감소는 음수(-)로 입력하세요"
                  : adjustForm.type === "입고"
                    ? "입고할 수량을 입력하세요"
                    : "출고할 수량을 입력하세요"
              }
            />

            {/* 안전 재고 조정 필드 추가 */}
            <TextField
              fullWidth
              label="안전 재고"
              type="number"
              value={adjustForm.safetyStock}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, safetyStock: e.target.value })
              }
              placeholder="안전 재고 수량"
              helperText="안전 재고는 상품 상태 판단 기준이 됩니다 (기본값: 초기 등록 수량의 50%)"
            />

            {/* 주문 번호 필드 */}
            <TextField
              fullWidth
              label="주문 번호 (선택사항)"
              value={adjustForm.orderNumber}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, orderNumber: e.target.value })
              }
              placeholder="예: ORD-001"
              helperText="관련 주문이 있는 경우 주문 번호를 입력하세요"
            />

            <TextField
              fullWidth
              label="비고 (선택사항)"
              multiline
              rows={3}
              value={adjustForm.notes}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, notes: e.target.value })
              }
              placeholder="조정 사유나 특이사항을 입력하세요"
            />

            {/* 조정 후 예상 재고 - 항상 표시 */}
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
                  {(() => {
                    const quantityValue = parseInt(adjustForm.quantity) || 0;
                    let adjustment = quantityValue;
                    if (adjustForm.type === "출고") {
                      adjustment = -Math.abs(quantityValue);
                    }
                    const expectedStock = Math.max(
                      0,
                      selectedItem.currentStock + adjustment
                    );
                    const safetyStockValue =
                      parseInt(adjustForm.safetyStock) ||
                      selectedItem.safetyStock;

                    let status = "충분";
                    let statusColor = "success.main";

                    if (expectedStock === 0) {
                      status = "품절";
                      statusColor = "error.main";
                    } else if (expectedStock <= safetyStockValue) {
                      status = "부족";
                      statusColor = "warning.main";
                    }

                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{expectedStock}개</span>
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            backgroundColor:
                              statusColor === "success.main"
                                ? "#e8f5e8"
                                : statusColor === "warning.main"
                                  ? "#fff3e0"
                                  : "#ffebee",
                            color:
                              statusColor === "success.main"
                                ? "#2e7d32"
                                : statusColor === "warning.main"
                                  ? "#f57c00"
                                  : "#d32f2f",
                          }}
                        />
                      </Box>
                    );
                  })()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setAdjustDialogOpen(false);
              setSelectedItem(null);
              setAdjustForm({
                type: "입고",
                quantity: "",
                orderNumber: "",
                safetyStock: "",
                notes: "",
              });
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleAdjustSubmit}
            variant="contained"
            disabled={!adjustForm.quantity}
            sx={{ borderRadius: 2 }}
          >
            조정 완료
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
          severity="success"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryManagement;
