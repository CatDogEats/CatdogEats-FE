"use client"

import React from "react"
import { Box, useTheme } from "@mui/material"

const ChatLayout: React.FC = () => {
    const theme = useTheme()

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                flexDirection: "row",
                backgroundColor: theme.palette.background.default,
            }}
        >
            {/* 채팅방 목록 영역 */}
            <Box
                sx={{
                    bgcolor: "#f5f5f5",
                    overflowY: "auto",
                    height: "100%",
                    width: {
                        xs: 0,       // xs (모바일) : 숨김
                        sm: "30%",   // sm (600px 이상) : 30%
                        md: "25%",   // md (900px 이상) : 25%
                        lg: "20%",   // lg (1200px 이상) : 20%
                    },
                    minWidth: {
                        sm: 200,
                        md: 250,
                        lg: 300,
                    },
                    display: {
                        xs: "none",  // xs에서는 숨김
                        sm: "block",
                    },
                }}
            >
                {/* 예시 채팅방 목록 */}
                {[...Array(20)].map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            p: 2,
                            borderBottom: "1px solid #ccc",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#e0e0e0" },
                        }}
                    >
                        채팅방 {idx + 1}
                    </Box>
                ))}
            </Box>

            {/* 채팅 메시지 영역 */}
            <Box
                sx={{
                    flex: 1,
                    bgcolor: "#fff",
                    height: "100%",
                    overflowY: "auto",
                    p: 2,
                }}
            >
                {/* 예시 채팅 메시지 */}
                {[...Array(30)].map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            p: 1,
                            m: 1,
                            borderRadius: 2,
                            bgcolor: idx % 2 === 0 ? "#e3f2fd" : "#fce4ec",
                        }}
                    >
                        메시지 {idx + 1}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default ChatLayout
