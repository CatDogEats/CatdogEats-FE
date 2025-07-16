// src/components/SellerDashboard/Dashboard/DemandForecastPanel/ForecastItem.tsx
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { CheckCircle, Warning } from "@mui/icons-material";
import { DemandForecastItem, getStatusColor, getConfidenceColor } from "../StatCards/types";

interface ForecastItemProps {
    item: DemandForecastItem;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "재주문 필요":
            return <Warning sx={{ color: "#F2994A", fontSize: 16 }} />;
        case "충분":
            return <CheckCircle sx={{ color: "#6FCF97", fontSize: 16 }} />;
        default:
            return <CheckCircle sx={{ color: "#A59A8E", fontSize: 16 }} />;
    }
};

export const ForecastItem: React.FC<ForecastItemProps> = ({ item }) => {
    const shortageQuantity = Math.max(0, item.predictedQuantity - item.currentStock);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                mb: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 2,
                border: "1px solid #F8F4F0",
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: "#fafafa",
                    transform: 'translateY(-1px)',
                }
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography
                    sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        mb: 0.5,
                        color: "#333333",
                    }}
                >
                    {item.productName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        현재: {item.currentStock}개
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: "#333333", fontSize: "0.75rem" }}
                    >
                        예측: {item.predictedQuantity}개
                    </Typography>
                </Box>
                {item.status === "재주문 필요" && (
                    <Typography
                        variant="caption"
                        sx={{ color: "#F2994A", fontSize: "0.75rem", fontWeight: 600 }}
                    >
                        부족: {shortageQuantity}개
                    </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: "#A59A8E", fontSize: "0.75rem" }}
                    >
                        신뢰도: {item.confidenceScore}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={item.confidenceScore}
                        sx={{
                            width: 40,
                            height: 3,
                            borderRadius: 2,
                            backgroundColor: "#F3EADD",
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: getConfidenceColor(item.confidenceScore),
                                borderRadius: 2,
                            },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getStatusIcon(item.status)}
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: getStatusColor(item.status),
                    }}
                >
                    {item.status}
                </Typography>
            </Box>
        </Box>
    );
};