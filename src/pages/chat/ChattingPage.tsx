"use client"

import React, { useState, useCallback } from "react"
import { Box, useTheme, useMediaQuery } from "@mui/material"
import type { CustomerInquiry } from "@/types/customer"
import CustomerInquiryList from "@/components/common/chat/CustomerInquiryList"
import ChatWindow from "@/components/common/chat/ChatWindow"
import { customerInquiries as initialCustomerInquiries } from "@/data/customerData"

const ChatPage: React.FC = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const [customerInquiries, setCustomerInquiries] = useState<CustomerInquiry[]>(initialCustomerInquiries)
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInquiry | null>(null)

    const handleCustomerClick = useCallback((customer: CustomerInquiry) => {
        setSelectedCustomer(customer)
    }, [])

    const handleBackToList = useCallback(() => {
        setSelectedCustomer(null)
    }, [])

    const handleDeleteChatRoom = useCallback(
        (customerId: number) => {
            setCustomerInquiries((prev) => prev.filter((c) => c.id !== customerId))
            if (selectedCustomer?.id === customerId) {
                setSelectedCustomer(null)
            }
        },
        [selectedCustomer]
    )

    // 모바일에서는 전체 화면 전환, 데스크톱에서는 동적 비율 조정
    if (isMobile) {
        return (
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: theme.palette.background.default,
                    position: "relative",
                }}
            >
                {selectedCustomer ? (
                    // 모바일: 채팅창이 전체 화면을 차지
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#fff",
                        }}
                    >
                        <ChatWindow
                            selectedCustomer={selectedCustomer}
                            onBackToList={handleBackToList}
                            onDeleteChatRoom={handleDeleteChatRoom}
                            isMobile={isMobile}
                        />
                    </Box>
                ) : (
                    // 모바일: 채팅방 목록이 전체 화면을 차지
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            overflowY: "auto",
                        }}
                    >
                        <CustomerInquiryList
                            customerInquiries={customerInquiries}
                            selectedCustomer={selectedCustomer}
                            onCustomerClick={handleCustomerClick}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    // 데스크톱: 동적 비율 조정
    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                backgroundColor: theme.palette.background.default,
                transition: "all 0.3s ease-in-out",
            }}
        >
            {/* 채팅방 목록 - 동적 크기 조정 */}
            <Box
                sx={{
                    flex: selectedCustomer ? "0 0 40%" : "1 1 100%",
                    minWidth: selectedCustomer ? 320 : 280,
                    maxWidth: selectedCustomer ? "40%" : "100%",
                    borderRight: selectedCustomer ? "1px solid #ddd" : "none",
                    overflowY: "auto",
                    transition: "all 0.3s ease-in-out",
                }}
            >
                <CustomerInquiryList
                    customerInquiries={customerInquiries}
                    selectedCustomer={selectedCustomer}
                    onCustomerClick={handleCustomerClick}
                />
            </Box>

            {/* 채팅 메시지 창 - 선택시에만 표시 */}
            {selectedCustomer && (
                <Box
                    sx={{
                        flex: "1 1 60%",
                        backgroundColor: "#fff",
                        borderLeft: "1px solid #ddd",
                        overflowY: "auto",
                        transition: "all 0.3s ease-in-out",
                        animation: "slideInFromRight 0.3s ease-out",
                        "@keyframes slideInFromRight": {
                            "0%": {
                                opacity: 0,
                                transform: "translateX(20px)",
                            },
                            "100%": {
                                opacity: 1,
                                transform: "translateX(0)",
                            },
                        },
                    }}
                >
                    <ChatWindow
                        selectedCustomer={selectedCustomer}
                        onBackToList={handleBackToList}
                        onDeleteChatRoom={handleDeleteChatRoom}
                        isMobile={isMobile}
                    />
                </Box>
            )}
        </Box>
    )
}

export default ChatPage