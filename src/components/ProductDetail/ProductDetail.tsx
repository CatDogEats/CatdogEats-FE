// src/components/ProductDetail/ProductDetail.tsx
import React from "react";
import { Container, Grid, Box } from "@mui/material";
import { Product } from "./Product";
import { Review, ReviewStats } from "./review";
import ProductImages from "./ProductImages";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./ProductReviews";
import RelatedProducts from "./RelatedProducts";
import { ReviewSummary } from "@/service/review/ReviewSummaryAPI";

interface ProductDetailProps {
    product: Product;
    reviews: Review[];
    reviewStats: ReviewStats;
    relatedProducts: Array<{
        id: string;
        name: string;
        price: number;
        image: string;
    }>;
    reviewPage: number;
    totalReviewPages: number;
    onChangeReviewPage: (page: number) => void;
    reviewSummary: ReviewSummary | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
                                                         product,
                                                         reviews,
                                                         reviewStats,
                                                         relatedProducts,
                                                         reviewPage,
                                                         totalReviewPages,
                                                         onChangeReviewPage,
                                                         reviewSummary
                                                     }) => {
    return (
        <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
            <Container
                maxWidth="xl"
                sx={{
                    py: { xs: 2, md: 4 },
                    px: { xs: 2, sm: 4, md: 8, lg: 10 },
                }}
            >
                {/* 메인 상품 섹션 */}
                <Grid
                    container
                    spacing={{ xs: 3, md: 6 }}
                    sx={{ mb: { xs: 6, md: 12 } }}
                >
                    <Grid
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <ProductImages product={product} productName={product.name} />
                    </Grid>
                    <Grid
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <ProductInfo product={product} />
                    </Grid>
                </Grid>

                {/* 고객 리뷰 섹션 */}
                <Box sx={{ mb: { xs: 6, md: 10 } }}>
                    <ProductReviews
                        reviews={reviews}
                        stats={reviewStats}
                        currentPage={reviewPage}
                        totalPages={totalReviewPages}
                        onPageChange={(page) => onChangeReviewPage(page)}
                        reviewSummary={reviewSummary}
                    />
                </Box>

                {/* 추천 상품 섹션 */}
                <Box>
                    <RelatedProducts products={relatedProducts} />
                </Box>
            </Container>
        </Box>
    );
};

export default ProductDetail;