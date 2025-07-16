// src/components/ProductDetail/ProductReviews/ProductReviews.tsx

import { Box, Typography, Grid } from "@mui/material";
import { Review, ReviewStats } from "../review";
import ReviewStatsOverview from "./ReviewStatsOverview";
import ReviewSummaryAI from "./ReviewSummaryAI";
import ReviewList from "./ReviewList";
import ReviewPagination from "./ReviewPagination";
import { ReviewSummary } from "@/service/review/ReviewSummaryAPI";

interface ProductReviewsProps {
    reviews: Review[];
    stats: ReviewStats;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    reviewSummary: ReviewSummary | null;
}

const reviewsPerPage = 10;

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews,
                                                           stats,
                                                           currentPage,
                                                           totalPages,
                                                           onPageChange,
                                                           reviewSummary,}) => {
    // 데이터 안전성 체크 - useMemo 아래로 이동
    if (!stats || !stats.ratingDistribution) {
        return (
            <div style={{ color: "red", fontSize: "2rem" }}>
                ERROR: stats 데이터가 없습니다!
            </div>
        );
    }

    const startIdx = (currentPage - 1) * reviewsPerPage;
    const endIdx = startIdx + reviewsPerPage;
    const currentReviews = reviews.slice(startIdx, endIdx);

    return (
        <Box sx={{ mt: 6, py: 4 }}>
            <Box
                id="review-section"
                sx={{
                    backgroundColor: "grey.100",
                    p: 4,
                    borderRadius: 2
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        mb: 4,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "text.primary",
                    }}
                >
                    고객 리뷰
                </Typography>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <ReviewStatsOverview stats={stats} />
                </Grid>

                {/* 페이지 정보 표시 */}
                <Box
                    sx={{
                        mb: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        총 {stats.totalReviews}개 리뷰 중{" "}
                        {startIdx + 1}-{Math.min(endIdx, reviews.length)}개 표시
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        {currentPage} / {totalPages} 페이지
                    </Typography>
                </Box>

                {/* AI 리뷰 요약 */}
                <ReviewSummaryAI
                    reviewSummary={reviewSummary}
                    totalReviews={stats.totalReviews}
                />

                {/* 리뷰 목록 */}
                <ReviewList reviews={currentReviews} />

                {/* 페이지네이션 */}
                <ReviewPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={(_, page) => onPageChange(page)}
                />

                {/* 리뷰가 없을 때 표시할 메시지 */}
                {reviews.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography
                            variant="body1"
                            sx={{ color: "text.secondary", fontSize: "1rem" }}
                        >
                            아직 등록된 리뷰가 없습니다.
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "grey.200", mt: 1 }}
                        >
                            첫 번째 리뷰를 남겨보세요!
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ProductReviews;