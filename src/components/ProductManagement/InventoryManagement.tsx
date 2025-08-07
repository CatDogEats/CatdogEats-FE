  import React, { useState, useEffect } from "react";
  import {
    Box,
    Paper,
    Tabs,
    Tab,
  } from "@mui/material";
  import {
    inventoryApi,
    ProductInventoryProjection,
    InventoryAdjustmentProjection,
    AdjustmentRequestDTO
  } from '@/service/product/InventoryAPI';
  import InventoryDashboardCards from './inventoryDashboardCards';
  import InventoryStatusTable from './inventoryStatusTable';
  import InventoryMovementTable from './inventoryMovementTable';
  import InventoryAdjustmentDialog from './inventoryAdjustmentDialog';
  import {
    StockItem,
    StockMovement,
    AdjustForm,
    convertApiTypeToUiType,
    convertUiTypeToApiType
  } from '@/components/ProductManagement/types/product.types';

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  interface InventoryManagementProps {
    showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
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

  const InventoryManagement: React.FC<InventoryManagementProps> = ({ showAlert })  => {
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [adjustForm, setAdjustForm] = useState<AdjustForm>({
      type: "입고",
      quantity: "",
      orderNumber: "",
      safetyStock: "",
      notes: "",
    });

    // API에서 가져온 데이터를 저장할 state
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [, setTotalPages] = useState(0);

    // 상품 재고 목록 조회
    const fetchProductInventoryList = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getProductInventoryList(page, rowsPerPage, searchTerm || undefined);

        // API 응답을 StockItem 형태로 변환
        const transformedItems: StockItem[] = response.content.map((item: ProductInventoryProjection) => ({
          id: item.id,
          productId: item.productId,
          productNumber: item.productNumber, // 원본 productNumber 저장
          productName: item.title,
          supplier: item.supplier || "미지정",
          currentStock: item.currentStock,
          availableStock: item.currentStock,
          safetyStock: item.safetyStock || Math.floor(item.currentStock * 0.5),
          unitPrice: item.unitPrice,
          status: item.currentStock === 0
              ? "품절"
              : item.currentStock <= (item.safetyStock || Math.floor(item.currentStock * 0.5))
                  ? "부족"
                  : "충분",
          lastUpdated: item.lastUpdated,
        }));

        setStockItems(transformedItems);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);

      } catch (error) {
        console.error('상품 재고 목록 조회 실패:', error);
        showAlert("재고 목록을 불러오는데 실패했습니다.", "error");

      } finally {
        setLoading(false);
      }
    };

    // 재고 조정 기록 조회
    const fetchAdjustmentRecords = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getAdjustmentRecords(page, rowsPerPage);

        // API 응답을 StockMovement 형태로 변환 (타입 변환 함수 사용)
        const transformedMovements: StockMovement[] = response.content.map((item: InventoryAdjustmentProjection) => ({
          id: item.id,
          productId: item.productId,
          productsTitle: item.productsTitle,
          type: convertApiTypeToUiType(item.adjustmentType as any), // API 타입을 UI 타입으로 변환
          quantity: item.quantity,
          updatedAt: item.updatedAt,
          note: item.note, // 'notes' 대신 'note'로 매핑
        }));

        setStockMovements(transformedMovements);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('재고 조정 기록 조회 실패:', error);
        showAlert("재고 조정 기록 조회를 불러오는데 실패했습니다.", "error");
      } finally {
        setLoading(false);
      }
    };

    // 컴포넌트 마운트 시 및 탭 변경 시 데이터 로딩
    useEffect(() => {
      if (tabValue === 0) {
        fetchProductInventoryList();
      } else {
        fetchAdjustmentRecords();
      }
    }, [tabValue, page, rowsPerPage, searchTerm]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
      setPage(0);
    };

    const handleSearchChange = (value: string) => {
      setSearchTerm(value);
      setPage(0);
    };

    const handlePageChange = (newPage: number) => {
      setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    };

    const handleAdjustStock = (item: StockItem) => {
      setSelectedItem(item);
      setAdjustForm({
        type: "입고",
        quantity: "",
        orderNumber: "",
        safetyStock: item.safetyStock.toString(),
        notes: "",
      });
      setAdjustDialogOpen(true);
    };

    const handleAdjustSubmit = async () => {
      if (!selectedItem || !adjustForm.quantity) return;

      try {
        setLoading(true);

        // 수량은 항상 양수로 보냄. 백엔드에서 type에 따라 처리
        const quantityToSend = Math.abs(parseInt(adjustForm.quantity) || 0);
        if (quantityToSend === 0) {
          showAlert("수량은 0보다 커야 합니다.", "error");
          setLoading(false);
          return;
        }

        // UI 타입을 API 타입으로 변환
        const apiType = convertUiTypeToApiType(adjustForm.type);

        // API 요청 DTO 생성
        const adjustmentDto: AdjustmentRequestDTO = {
          id: selectedItem.id, // productId 사용 (UUID 문자열)
          type: apiType,
          quantity: quantityToSend, // 항상 양수로 보냄
          note: adjustForm.notes || `${adjustForm.type} 처리` // UI의 notes를 백엔드 note로 매핑
        };

        // 재고 조정 API 호출
        await inventoryApi.createAdjustmentRecord(adjustmentDto);

        // 성공 후 데이터 새로고침
        if(tabValue === 0) {
          await fetchProductInventoryList();
        } else {
          await fetchAdjustmentRecords();
        }

        showAlert("재고가 성공적으로 조정되었습니다.", "success");
        handleDialogClose();
      } catch (error) {
        console.error('재고 조정 실패:', error);
        showAlert("재고 조정에 실패했습니다.", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleDialogClose = () => {
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
            <InventoryDashboardCards stockItems={stockItems} />

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
                <InventoryStatusTable
                    stockItems={stockItems}
                    loading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalElements={totalElements}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onAdjustStock={handleAdjustStock}
                />
              </TabPanel>

              {/* 재고 이동 기록 탭 */}
              <TabPanel value={tabValue} index={1}>
                <InventoryMovementTable
                    stockMovements={stockMovements}
                    stockItems={stockItems}
                    loading={loading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalElements={totalElements}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TabPanel>
            </Paper>

            {/* 재고 조정 다이얼로그 */}
            <InventoryAdjustmentDialog
                open={adjustDialogOpen}
                onClose={handleDialogClose}
                selectedItem={selectedItem}
                adjustForm={adjustForm}
                onFormChange={setAdjustForm}
                onSubmit={handleAdjustSubmit}
                loading={loading}
            />
          </Box>
    );
  };

  export default InventoryManagement;
