// src/components/common/ChatModal.tsx
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    useTheme,
    useMediaQuery,

} from "@mui/material";
import type { CustomerChat } from "@/types/customer";
import CustomerInquiryList from "@/components//common/chat/CustomerInquiryList";
import ChatWindow from "@/components/common/chat/ChatWindow";
import { customerChat as initialCustomerInquiries } from "@/data/customerData";

interface ChatModalProps {
    open: boolean;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose }) => {
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
            sx={{
                '& .MuiDialog-paper': {
                    height: isMobile ? '100%' : '85vh',
                    maxHeight: isMobile ? '100%' : '85vh',
                    borderRadius: isMobile ? 0 : 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* 모달 헤더 */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                zIndex: 1000
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

            {/* 채팅 컨텐츠 */}
            <DialogContent sx={{
                p: 0,
                flex: 1,
                display: 'flex',
                overflow: 'hidden'
            }}>
                {/* 모바일에서 채팅창이 열린 경우 */}
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
                    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
                        {/* 고객 목록 - 스크롤 가능 */}
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

                        {/* 채팅창 - 모달에 딱 맞게 */}
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
            </DialogContent>
        </Dialog>
    );
};

export default ChatModal;