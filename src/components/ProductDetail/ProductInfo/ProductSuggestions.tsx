// src/components/ProductDetail/ProductInfo/ProductSuggestions.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { Product } from "../Product";

interface ProductSuggestionsProps {
    product: Product;
}

const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({ product }) => {
    return (
        <Box
            sx={{
                background: "#faf6f2",
                padding: "24px 20px",
                borderRadius: "12px",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
            >
                상품 내용
            </Typography>
            <Typography
                variant="body1"
                color="text.primary"
                whiteSpace="pre-line"
            >
                {product.suitableFor ?? "-"}
            </Typography>
        </Box>
    );
};

export default ProductSuggestions;