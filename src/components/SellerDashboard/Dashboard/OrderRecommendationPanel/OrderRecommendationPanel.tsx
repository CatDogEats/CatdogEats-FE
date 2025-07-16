// src/components/SellerDashboard/Dashboard/OrderRecommendationPanel/OrderRecommendationPanel.tsx
import React from "react";
import {
    Box,
    Typography,
    Card,
} from "@mui/material";
import { ShoppingCart, CheckCircle } from "@mui/icons-material";
import { RecommendationItem } from "./RecommendationItem";
import { DemandForecastItem } from "../StatCards/types";

interface OrderRecommendationPanelProps {
    title?: string;
    data: DemandForecastItem[];
    loading?: boolean;
}

export const OrderRecommendationPanel: React.FC<OrderRecommendationPanelProps> = ({
                                                                                      title = "주문 추천 상품",
                                                                                      data,
                                                                                      loading = false
                                                                                  }) => {
    // 재주문이 필요한 상품만 필터링
    const reorderItems = data.filter((item) => item.status === "재주문 필요");
    const reorderCount = reorderItems.length;

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: 3,
                    border: "1px solid #F3EADD",
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        color: "#A59A8E"
                    }}
                >
                    <Typography>데이터를 불러오는 중...</Typography>
                </Box>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                borderRadius: 3,
                border: "1px solid #F3EADD",
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >
                <ShoppingCart sx={{ color: "#ef9942", fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#ef9942" }}>
                        {reorderCount}건
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#333333" }}>
                        주문 필요
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto" }}>
                {reorderItems.length > 0 ? (
                    reorderItems.map((item) => (
                        <RecommendationItem key={item.id} item={item} />
                    ))
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#A59A8E",
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 40, mb: 1, color: "#6FCF97" }} />
                        <Typography sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                            모든 상품의 재고가 충분합니다
                        </Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};