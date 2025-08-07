import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
} from "@mui/material";
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";

import { StockItem } from '@/components/ProductManagement/types/product.types';

interface InventoryDashboardCardsProps {
    stockItems: StockItem[];
}

const InventoryDashboardCards: React.FC<InventoryDashboardCardsProps> = ({
                                                                             stockItems,
                                                                         }) => {
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

    return (
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
    );
};

export default InventoryDashboardCards;
