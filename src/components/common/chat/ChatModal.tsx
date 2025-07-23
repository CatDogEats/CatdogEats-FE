// src/components/common/ChatModal.tsx
import React, { useState } from "react";
import {
    IconButton,
    Box,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import type { CustomerChat } from "@/types/customer";
import CustomerInquiryList from "@/components/common/chat/CustomerInquiryList";
import ChatWindow from "@/components/common/chat/ChatWindow";
import { customerChat as initialCustomerInquiries } from "@/data/customerData";

interface ChatModalProps {
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerChat | null>(null);
    const [customerInquiries, setCustomerInquiries] = useState<CustomerChat[]>(initialCustomerInquiries);

    const handleCustomerClick = (customer: CustomerChat) => {
        setSelectedCustomer(customer);
    };

    const handleBackToList = () => {
        setSelectedCustomer(null);
    };

    const handleDeleteChatRoom = (customerId: number) => {
        setCustomerInquiries(prev => prev.filter(customer => customer.id !== customerId));
        setSelectedCustomer(null);
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.default,
                overflow: 'hidden',
            }}
        >
            {/* 헤더 */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    <span className="material-icons">close</span>
                </IconButton>
            </Box>

            {/* 본문 */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                {/* 모바일 단독 화면 */}
                {selectedCustomer && isMobile ? (
                    <Box sx={{ width: '100%', height: '100%' }}>
                        <ChatWindow
                            selectedCustomer={selectedCustomer}
                            onBackToList={handleBackToList}
                            onDeleteChatRoom={handleDeleteChatRoom}
                            isMobile={isMobile}
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', width: '100%' }}>
                        {/* 고객 목록 */}
                        <Box
                            sx={{
                                width: selectedCustomer && !isMobile ? '40%' : '100%',
                                minWidth: selectedCustomer && !isMobile ? 300 : 'auto',
                                borderRight: selectedCustomer && !isMobile ? `1px solid ${theme.palette.divider}` : 'none',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                p: 2
                            }}>
                                <CustomerInquiryList
                                    customerInquiries={customerInquiries}
                                    selectedCustomer={selectedCustomer}
                                    onCustomerClick={handleCustomerClick}
                                />
                            </Box>
                        </Box>

                        {/* 채팅창 */}
                        {selectedCustomer && !isMobile && (
                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <ChatWindow
                                    selectedCustomer={selectedCustomer}
                                    onBackToList={handleBackToList}
                                    onDeleteChatRoom={handleDeleteChatRoom}
                                    isMobile={isMobile}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ChatModal;