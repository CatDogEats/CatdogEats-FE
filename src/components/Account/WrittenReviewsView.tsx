import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Paper, Avatar, Rating, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Pagination from "../common/Pagination";
import { BuyerReview, Review } from "@/service/review/WrittenReviewAPI";
import noImage from "@/service/review/no_image.svg";
import ReviewEditDialog from "./ReviewEditDialog";

const ITEMS_PER_PAGE = 5;

const WrittenReviewsView: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 삭제용 state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // 수정 모달
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Review | null>(null);

    const fetchReviews = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        const res = await BuyerReview.getReviewsByBuyer(page - 1, ITEMS_PER_PAGE);
        if (res) {
            setReviews(res.content);
            setTotal(res.totalElements);
        } else {
            setError("리뷰 목록을 불러오지 못했습니다.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchReviews(currentPage);
    }, [currentPage, fetchReviews]);

    const handleDelete = async () => {
        if (!deleteTargetId) return;
        setLoading(true);
        const res = await BuyerReview.deleteReview(deleteTargetId);
        setLoading(false);
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
        if (res && res.success) {
            fetchReviews(currentPage);
        } else {
            setError("리뷰 삭제 실패");
        }
    };

    const openDeleteDialog = (id: string) => {
        setDeleteTargetId(id);
        setDeleteDialogOpen(true);
    };

    // 수정 버튼 클릭시
    const openEditDialog = (review: Review) => {
        setEditTarget(review);
        setEditDialogOpen(true);
    };

    const handlePageChange = (page: number) => setCurrentPage(page);

    return (
        <Box>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <Typography variant="body2" color="text.secondary">
                    작성한 리뷰 {total}건
                </Typography>
            </Box>

            {loading && <Typography>로딩 중...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && reviews.length === 0 && (
                <Typography>작성한 리뷰가 없습니다.</Typography>
            )}

            {reviews.map((review) => (
                <Paper key={review.id} style={{ marginBottom: 24, padding: 24 }}>
                    <Box style={{ display: "flex", gap: 24 }}>
                        <Avatar
                            src={review.images[0]?.imageUrl || noImage}
                            variant="rounded"
                            style={{ width: 80, height: 80, flexShrink: 0 }}
                        />
                        <Box style={{ flex: 1 }}>
                            <Typography variant="body1" style={{ fontWeight: 600, marginBottom: 12 }}>
                                {review.productName}
                            </Typography>
                            <Box style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                                <Rating value={review.star} readOnly size="small" />
                                <Typography variant="body2" color="text.secondary">
                                    {review.updatedAt?.substring(0, 10)}
                                </Typography>
                            </Box>
                            <Typography variant="body2" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                                {review.contents}
                            </Typography>
                        </Box>
                        <Box style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <Box style={{ display: "flex", gap: 8 }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="primary"
                                    onClick={() => openEditDialog(review)}
                                >
                                    수정
                                </Button>
                                <Typography variant="body2" color="text.secondary">
                                    |
                                </Typography>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="error"
                                    onClick={() => openDeleteDialog(review.id)}
                                >
                                    삭제
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            ))}

            <Pagination
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>리뷰 삭제</DialogTitle>
                <DialogContent>정말 이 리뷰를 삭제하시겠습니까?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>삭제</Button>
                </DialogActions>
            </Dialog>

            <ReviewEditDialog
                open={editDialogOpen}
                review={editTarget}
                onClose={() => setEditDialogOpen(false)}
                onSaved={() => fetchReviews(currentPage)}
            />
        </Box>
    );
};

export default WrittenReviewsView;
