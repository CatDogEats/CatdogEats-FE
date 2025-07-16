// src/components/SellerDashboard/Dashboard/StatCards/StatCards.tsx
import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { StatItem } from "../StatCards/types";

interface StatCardsProps {
    data: StatItem[];
    loading?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                {[1, 2].map((index) => (
                    <Box key={index} sx={{ flex: 1 }}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                border: "1px solid #F3EADD",
                                height: 120,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f5f5f5"
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="body2" color="#A59A8E" gutterBottom>
                                    로딩 중...
                                </Typography>
                                <Typography variant="h4" sx={{ color: "#A59A8E", fontWeight: 700 }}>
                                    -
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            {data.map((stat, index) => (
                <Box key={index} sx={{ flex: 1 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: "1px solid #F3EADD",
                            height: 120,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="#A59A8E" gutterBottom>
                                {stat.title}
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: stat.color,
                                    fontWeight: 700,
                                    fontSize: { xs: "1.5rem", sm: "1.8rem" }
                                }}
                            >
                                {stat.value}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            ))}
        </Box>
    );
};