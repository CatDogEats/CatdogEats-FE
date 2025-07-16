// src/components/ProductDetail/ProductInfo/ProductSpecTable.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { Product } from "../Product";

interface ProductSpecTableProps {
    product: Product;
}
const ProductSpecTable: React.FC<ProductSpecTableProps> = ({ product }) => {
    return (
        <Box sx={{
            backgroundColor: "grey.100",
            p: 3,
            borderRadius: 2
        }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 2,
                    color: "text.primary",
                }}
            >
                상품 정보
            </Typography>

            <Typography
                variant="body1"
                color="text.primary"
                whiteSpace="pre-line"
            >
                {product.productInfoText ?? "-"}
            </Typography>
        </Box>
    );
};

export default ProductSpecTable;