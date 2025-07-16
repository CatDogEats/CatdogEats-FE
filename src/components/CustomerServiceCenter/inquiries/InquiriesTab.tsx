"use client"

import type React from "react"
import { useState } from "react"
import { Box, Typography, Button } from "@mui/material"
import InquiryHistory from "./InquiryHistory"
import InquiryForm from "./InquiryForm"

type InquiryTabType = "history" | "new"

const InquiriesTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<InquiryTabType>("history")

    const handleTabChange = (tab: InquiryTabType) => {
        setActiveTab(tab)
    }

    return (
        <Box sx={{ pt: 3, pb: 4 }}>
            <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                    color: "text.primary",
                    mb: 3
                }}
            >
                1:1 문의
            </Typography>

            <Box sx={{ display: "flex", borderBottom: "1px solid", borderBottomColor: "grey.200", mb: 3 }}>
                <Button
                    sx={{
                        flex: 1,
                        pb: 1.5,
                        pt: 1,
                        borderBottom: "2px solid",
                        borderBottomColor: activeTab === "history" ? "primary.main" : "transparent",
                        color: activeTab === "history" ? "primary.main" : "text.secondary",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        borderRadius: 0,
                        transition: "all 0.2s ease",
                        "&:hover": {
                            backgroundColor: "transparent",
                            color: "primary.main",
                        },
                    }}
                    onClick={() => handleTabChange("history")}
                >
                    문의 내역
                </Button>
                <Button
                    sx={{
                        flex: 1,
                        pb: 1.5,
                        pt: 1,
                        borderBottom: "2px solid",
                        borderBottomColor: activeTab === "new" ? "primary.main" : "transparent",
                        color: activeTab === "new" ? "primary.main" : "text.secondary",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        borderRadius: 0,
                        transition: "all 0.2s ease",
                        "&:hover": {
                            backgroundColor: "transparent",
                            color: "primary.main",
                        },
                    }}
                    onClick={() => handleTabChange("new")}
                >
                    문의글 작성
                </Button>
            </Box>

            {activeTab === "history" && <InquiryHistory />}
            {activeTab === "new" && <InquiryForm />}
        </Box>
    )
}

export default InquiriesTab