// src/components/SellerDashboard/Dashboard/DemandForecastPanel/DemandForecastPanel.tsx
import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    Alert,
    AlertTitle,
    IconButton,
    Chip,
} from "@mui/material";
import { Analytics, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ForecastItem } from "./ForecastItem";
import { DemandForecastItem } from "../StatCards/types";

interface DemandForecastPanelProps {
    title?: string;
    data: DemandForecastItem[];
    loading?: boolean;
    itemsPerPage?: number;
}

export const DemandForecastPanel: React.FC<DemandForecastPanelProps> = ({
                                                                            title = "수요 예측 결과",
                                                                            data,
                                                                            loading = false,
                                                                            itemsPerPage = 5
                                                                        }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const reorderCount = data.filter(item => item.status === "재주문 필요").length;

    // 페이징 계산
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

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
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Analytics sx={{ color: "#ef9942", fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                        {title}
                    </Typography>
                </Box>
                {/* 페이징 정보 표시 */}
                {totalPages > 1 && (
                    <Chip
                        label={`${currentPage + 1}/${totalPages}`}
                        size="small"
                        sx={{
                            backgroundColor: "#F3EADD",
                            color: "#ef9942",
                            fontSize: "0.75rem",
                            height: 24
                        }}
                    />
                )}
            </Box>

            {reorderCount > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Alert
                        severity="warning"
                        sx={{
                            backgroundColor: "#FFF3CD",
                            border: "1px solid #F2C94C",
                            borderRadius: 2
                        }}
                    >
                        <AlertTitle sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                            재주문 알림
                        </AlertTitle>
                        <Typography sx={{ fontSize: "0.75rem" }}>
                            {reorderCount}개 상품의 재고 부족이 예상됩니다.
                        </Typography>
                    </Alert>
                </Box>
            )}

            {/* 페이징 정보 */}
            {data.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="caption" sx={{ color: "#A59A8E" }}>
                        {startIndex + 1}-{Math.min(endIndex, data.length)} / 전체 {data.length}개 상품
                    </Typography>

                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                size="small"
                                sx={{
                                    color: currentPage === 0 ? "#ccc" : "#ef9942",
                                    "&:disabled": { color: "#ccc" }
                                }}
                            >
                                <ChevronLeft fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                size="small"
                                sx={{
                                    color: currentPage === totalPages - 1 ? "#ccc" : "#ef9942",
                                    "&:disabled": { color: "#ccc" }
                                }}
                            >
                                <ChevronRight fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            )}

            <Box sx={{ flex: 1, overflow: "auto" }}>
                {currentData.length > 0 ? (
                    currentData.map((item) => (
                        <ForecastItem key={item.id} item={item} />
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
                        <Analytics sx={{ fontSize: 40, mb: 1 }} />
                        <Typography sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                            수요 예측 데이터가 없습니다
                        </Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};