// src/components/SellerDashboard/Dashboard/OrderRecommendationPanel/RecommendationItem.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { DemandForecastItem } from "../StatCards/types";

interface RecommendationItemProps {
    item: DemandForecastItem;
}

export const RecommendationItem: React.FC<RecommendationItemProps> = ({ item }) => {
    const truncatedProductName = item.productName.length > 15
        ? `${item.productName.substring(0, 15)}...`
        : item.productName;

    const shortageQuantity = Math.max(0, item.predictedQuantity - item.currentStock);
    const dailyAverage = (item.predictedQuantity / 7).toFixed(1);

    return (
        <Box
            sx={{
                p: 2,
                mb: 1.5,
                backgroundColor: "#FFFFFF",
                borderRadius: 2,
                border: "1px solid #F2994A20",
                borderLeft: "4px solid #F2994A",
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: "#fafafa",
                    transform: 'translateY(-1px)',
                }
            }}
        >
            <Typography
                sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    mb: 1,
                    color: "#333333",
                }}
            >
                {truncatedProductName}
            </Typography>

            <Box sx={{ mb: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        현재 재고
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#333333",
                        }}
                    >
                        {item.currentStock}개
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        7일 판매량 예측
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#333333",
                        }}
                    >
                        {item.predictedQuantity}개
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        일평균 예측
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#666666",
                        }}
                    >
                        {dailyAverage}개
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        추천 주문량
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#F2994A",
                        }}
                    >
                        {shortageQuantity}개
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};