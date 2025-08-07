// src/pages/SellerDashboardPage/ProductManagementPage.tsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AddCircleOutline as AddIcon,
  List as ListIcon,
  Inventory as InventoryIcon,
  LocalOffer as CouponIcon,
} from "@mui/icons-material";
import {
  ProductRegistrationForm,
  ProductEditDelete,
  InventoryManagement,
  ProductFormData,
} from "@/components/ProductManagement";
import CouponManagement from "@/components/ProductManagement/CouponManagement.tsx";

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

const ProductManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProductSubmit = (data: ProductFormData) => {
    console.log("상품 등록 데이터:", data);
    // 실제 구현에서는 API 호출
  };

  // 탭 순서 변경: 상품 목록 → 상품 등록 → 재고 관리 → 쿠폰 등록/관리
  const tabsData = [
    {
      label: "상품 목록", // 기존 "상품 수정/삭제"에서 변경
      icon: <ListIcon />, // EditIcon에서 ListIcon으로 변경
      component: <ProductEditDelete />,
    },
    {
      label: "상품 등록",
      icon: <AddIcon />,
      component: <ProductRegistrationForm onSubmit={handleProductSubmit} />,
    },
    {
      label: "재고 관리",
      icon: <InventoryIcon />,
      component: <InventoryManagement />,
    },
    {
      label: "쿠폰 등록/관리",
      icon: <CouponIcon />,
      component: <CouponManagement />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* 페이지 제목 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#2d2a27",
            fontFamily: "'Noto Sans KR', sans-serif",
            mb: 1,
          }}
        >
          상품 관리
        </Typography>
        <Typography variant="body1" sx={{ color: "#5c5752", fontSize: "1rem" }}>
          상품 등록, 수정, 재고 관리, 쿠폰 관리를 한 곳에서 편리하게 관리하세요.
        </Typography>
      </Box>

      {/* 탭 네비게이션 */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#F5EFEA",
            backgroundColor: "#f9fafb",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#5c5752",
                py: 2,
                "&.Mui-selected": {
                  color: "#d2691e",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#d2691e",
                height: 3,
              },
            }}
          >
            {tabsData.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  gap: 1,
                  minHeight: 60,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* 탭 패널 내용 */}
        {tabsData.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default ProductManagementPage;
