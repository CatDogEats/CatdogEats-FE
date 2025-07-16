"use client"

import type React from "react"
import { Box, Button } from "@mui/material"
import type { TabType } from "./index"

interface TabNavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <Box
            sx={{
                display: "flex",
                borderBottom: "1px solid",
                borderBottomColor: "grey.200", // #e7ddd0 from theme
                gap: 1,
                pb: 0,
            }}
        >
            <Button
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    color: activeTab === "announcements" ? "primary.main" : "text.secondary",
                    pb: 2,
                    pt: 2,
                    px: 3,
                    minWidth: "auto",
                    borderRadius: 0,
                    transition: "all 0.2s ease-in-out",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "primary.main",
                        transform: activeTab === "announcements" ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform 0.2s ease-in-out",
                    },
                    "&:hover": {
                        color: "primary.main",
                        backgroundColor: "rgba(232, 152, 48, 0.04)", // primary color with low opacity
                        "& p": {
                            transform: "translateY(-1px)",
                        }
                    },
                }}
                onClick={() => onTabChange("announcements")}
            >
                <Box
                    component="p"
                    sx={{
                        fontSize: "0.875rem",
                        fontWeight: activeTab === "announcements" ? 600 : 500,
                        margin: 0,
                        transition: "all 0.2s ease",
                    }}
                >
                    공지사항
                </Box>
            </Button>

            <Button
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    color: activeTab === "faq" ? "primary.main" : "text.secondary",
                    pb: 2,
                    pt: 2,
                    px: 3,
                    minWidth: "auto",
                    borderRadius: 0,
                    transition: "all 0.2s ease-in-out",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "primary.main",
                        transform: activeTab === "faq" ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform 0.2s ease-in-out",
                    },
                    "&:hover": {
                        color: "primary.main",
                        backgroundColor: "rgba(232, 152, 48, 0.04)",
                        "& p": {
                            transform: "translateY(-1px)",
                        }
                    },
                }}
                onClick={() => onTabChange("faq")}
            >
                <Box
                    component="p"
                    sx={{
                        fontSize: "0.875rem",
                        fontWeight: activeTab === "faq" ? 600 : 500,
                        margin: 0,
                        transition: "all 0.2s ease",
                    }}
                >
                    FAQ
                </Box>
            </Button>

            <Button
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    color: activeTab === "inquiries" ? "primary.main" : "text.secondary",
                    pb: 2,
                    pt: 2,
                    px: 3,
                    minWidth: "auto",
                    borderRadius: 0,
                    transition: "all 0.2s ease-in-out",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "primary.main",
                        transform: activeTab === "inquiries" ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform 0.2s ease-in-out",
                    },
                    "&:hover": {
                        color: "primary.main",
                        backgroundColor: "rgba(232, 152, 48, 0.04)",
                        "& p": {
                            transform: "translateY(-1px)",
                        }
                    },
                }}
                onClick={() => onTabChange("inquiries")}
            >
                <Box
                    component="p"
                    sx={{
                        fontSize: "0.875rem",
                        fontWeight: activeTab === "inquiries" ? 600 : 500,
                        margin: 0,
                        transition: "all 0.2s ease",
                    }}
                >
                    1:1 문의
                </Box>
            </Button>
        </Box>
    )
}

export default TabNavigation