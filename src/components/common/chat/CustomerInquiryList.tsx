"use client"

import type React from "react"
import { Box, Typography, TextField, InputAdornment, List, ListItem, ListItemText, Chip, Paper, CircularProgress } from "@mui/material"
import { Search, ChatBubbleOutline } from "@mui/icons-material"
import type { CustomerInquiry } from "@/types/customer.ts"

interface CustomerInquiryListProps {
    customerInquiries: CustomerInquiry[]
    selectedCustomer: CustomerInquiry | null
    onCustomerClick: (customer: CustomerInquiry) => void
    loading?: boolean
}

const CustomerInquiryList: React.FC<CustomerInquiryListProps> = ({
                                                                     customerInquiries,
                                                                     selectedCustomer,
                                                                     onCustomerClick,
                                                                     loading = false,
                                                                 }) => {
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    채팅방
                </Typography>
                {loading && (
                    <CircularProgress size={20} />
                )}
            </Box>

            {/* 검색창 */}
            <TextField
                fullWidth
                placeholder="채팅방 검색"
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {/* 고객 목록 */}
            {customerInquiries.length > 0 ? (
                <List>
                    {customerInquiries.map((customer) => (
                        <ListItem
                            key={customer.id}
                            onClick={() => onCustomerClick(customer)}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                border: selectedCustomer?.id === customer.id ? `2px solid #e89830` : "1px solid transparent",
                                backgroundColor: selectedCustomer?.id === customer.id ? "#fff3e0" : "white",
                                "&:hover": {
                                    backgroundColor: "#f5f5f5",
                                },
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography component="span" variant="body1" fontWeight="medium">
                                            {customer.name}
                                        </Typography>
                                    </Box>
                                }
                                secondary={customer.lastMessage}
                                secondaryTypographyProps={{
                                    noWrap: true,
                                    sx: { maxWidth: "200px" },
                                }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                {customer.unreadCount > 0 && (
                                    <Chip
                                        label={customer.unreadCount}
                                        color="primary"
                                        size="small"
                                        sx={{ minWidth: 24, height: 24 }}
                                    />
                                )}
                                {/* 마지막 메시지 시간 표시 (옵션) */}
                                {customer.messages && customer.messages.length > 0 && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.7rem' }}
                                    >
                                        {customer.messages[customer.messages.length - 1].time}
                                    </Typography>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                </List>
            ) : (
                // 빈 고객 목록 상태
                <Paper
                    sx={{
                        p: 4,
                        textAlign: "center",
                        border: "2px dashed #e0e0e0",
                        backgroundColor: "#fafafa",
                        borderRadius: 2
                    }}
                >
                    <ChatBubbleOutline
                        sx={{
                            fontSize: 64,
                            color: "text.disabled",
                            mb: 2
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 1,
                            fontWeight: 500,
                            color: "text.secondary"
                        }}
                    >
                        고객 채팅 목록이 없습니다.
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.disabled"
                        }}
                    >
                        새로운 고객 문의를 기다리고 있습니다.
                    </Typography>
                </Paper>
            )}
        </Box>
    )
}

export default CustomerInquiryList