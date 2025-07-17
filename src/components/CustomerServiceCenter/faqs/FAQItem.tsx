"use client"

import type React from "react"
import { useState } from "react"
import {
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Box
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { FaqResponseDTO } from "@/types/faq"

interface FAQItemProps {
    faq: FaqResponseDTO
}

const FAQItem: React.FC<FAQItemProps> = ({ faq }) => {
    const [expanded, setExpanded] = useState(false)

    const handleChange = () => {
        setExpanded(!expanded)
    }

    return (
        <Accordion
            expanded={expanded}
            onChange={handleChange}
            sx={{
                bgcolor: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                border: "1px solid #e8dbce",
                borderRadius: "8px !important",
                "&:before": {
                    display: "none",
                },
                mb: 1,
            }}
        >
            <AccordionSummary
                expandIcon={
                    <ExpandMoreIcon
                        sx={{
                            transition: "transform 0.3s",
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                    />
                }
                sx={{
                    padding: 2,
                    "& .MuiAccordionSummary-content": {
                        margin: 0,
                        alignItems: "center",
                        gap: 1.5
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                    {/* 카테고리 칩 */}
                    <Chip
                        label={faq.categoryDisplayName}
                        size="small"
                        sx={{
                            bgcolor: getCategoryColor(faq.faqCategory),
                            color: "white",
                            fontSize: "0.75rem",
                            height: 24,
                            minWidth: 60,
                            "& .MuiChip-label": {
                                px: 1.5
                            }
                        }}
                    />

                    {/* 질문 텍스트 */}
                    <Typography
                        fontWeight="medium"
                        sx={{
                            color: "#1c140d",
                            flex: 1,
                            pr: 2
                        }}
                    >
                        Q. {faq.question}
                    </Typography>
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ padding: 2, pt: 0, mt: 1.5 }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: "#9c7349",
                        whiteSpace: "pre-wrap",  // 줄바꿈 유지
                        lineHeight: 1.6
                    }}
                >
                    A. {faq.answer}
                </Typography>

                {/* 키워드 태그 표시 (있는 경우) */}
                {faq.keywords && faq.keywords.length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <Typography
                            variant="caption"
                            sx={{ color: "#9c7349", mr: 0.5 }}
                        >
                            관련 키워드:
                        </Typography>
                        {faq.keywords.map((keyword, index) => (
                            <Chip
                                key={index}
                                label={`#${keyword}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: "#e8dbce",
                                    color: "#9c7349",
                                    fontSize: "0.7rem",
                                    height: 20,
                                    "& .MuiChip-label": {
                                        px: 0.8
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    )
}

// 카테고리별 색상 반환 함수
const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        'PRODUCT': '#3f51b5',     // 제품 - 파란색
        'ORDER': '#9c27b0',       // 주문/결제 - 보라색
        'DELIVERY': '#4caf50',    // 배송 - 초록색
        'RETURN': '#ff9800',      // 환불/교환 - 주황색
        'ACCOUNT': '#f44336',     // 계정 - 빨간색
        'ETC': '#757575',         // 기타 - 회색
        'ALL': '#9c7349'          // 전체 - 브랜드 색상
    };

    return colorMap[category] || '#757575';
}

export default FAQItem