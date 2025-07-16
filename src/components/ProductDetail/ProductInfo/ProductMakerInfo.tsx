// src/components/ProductDetail/ProductInfo/ProductMakerInfo.tsx
import React, { useState } from "react";
import { Card, CardContent, Box, Typography, Button } from "@mui/material";
import ChatModal from "@/components/common/chat/ChatModal";
import { Product } from "../Product";

interface ProductMakerInfoProps {
    product: Product;
}

const ProductMakerInfo: React.FC<ProductMakerInfoProps> = ({ product }) => {
    const [chatModalOpen, setChatModalOpen] = useState(false);

    const handleChatClick = () => {
        setChatModalOpen(true);
    };

    const handleChatModalClose = () => {
        setChatModalOpen(false);
    };

    return (
        <>
            <Card sx={{
                backgroundColor: "grey.100",
                boxShadow: "none"
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 600,
                                    color: "text.primary",
                                    mb: 0.5
                                }}
                            >
                                {product.brand}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleChatClick}
                            sx={{
                                color: "primary.main",
                                borderColor: "primary.main",
                                "&:hover": {
                                    backgroundColor: "primary.main",
                                    color: "primary.contrastText",
                                },
                            }}
                        >
                            1:1 채팅
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* 채팅 모달 */}
            <ChatModal
                open={chatModalOpen}
                onClose={handleChatModalClose}
            />
        </>
    );
};

export default ProductMakerInfo;