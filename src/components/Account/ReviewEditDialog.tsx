import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, TextField, Button, Avatar, IconButton, Rating
} from "@mui/material";
import { BuyerReview, Review, ReviewImage } from "@/service/review/WrittenReviewAPI";
import Icon from "@mui/material/Icon";

interface ReviewEditDialogProps {
    open: boolean;
    review: Review | null;
    onClose: () => void;
    onSaved: () => void;
}

const MAX_IMAGES = 10;

const ReviewEditDialog: React.FC<ReviewEditDialogProps> = ({ open, review, onClose, onSaved }) => {
    const [star, setStar] = useState<number>(0);
    const [contents, setContents] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [keptImages, setKeptImages] = useState<ReviewImage[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (review) {
            setStar(review.star);
            setContents(review.contents);
            setSummary(""); // summary 필요시 review에서 받아오기
            setKeptImages(review.images);
            setNewImages([]);
            setNewImagePreviews([]);
        }
    }, [review, open]);

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const total = keptImages.length + newImages.length + files.length;
        if (total > MAX_IMAGES) {
            alert(`이미지는 최대 ${MAX_IMAGES}장까지 첨부 가능합니다.`);
            return;
        }
        setNewImages(prev => [...prev, ...files]);
        setNewImagePreviews(prev => [
            ...prev,
            ...files.map(file => URL.createObjectURL(file))
        ]);
    };

    const handleRemoveOldImage = (imageId: string) => {
        setKeptImages(prev => prev.filter(img => img.imageId !== imageId));
    };

    const handleRemoveNewImage = (idx: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleEditSave = async () => {
        if (!review) return;
        setLoading(true);

        // 1. 리뷰 내용 수정 (필드 누락시 undefined만 전달)
        await BuyerReview.updateReview({
            reviewId: review.id,
            star,
            contents,
            summary: summary || undefined,
        });

        const allImageIds = (review.images ?? []).map(img => img.imageId);
        const keptImageIds = keptImages.map(img => img.imageId);
        const deleteImageIds = allImageIds.filter(id => !keptImageIds.includes(id));

        await BuyerReview.updateReviewImage(
            review.id,
            deleteImageIds,
            newImages
        );

        setLoading(false);
        onSaved();
        onClose();
    };

    if (!review) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>리뷰 수정</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>별점</Typography>
                    <Rating
                        value={star}
                        onChange={(_, val) => setStar(val ?? 0)}
                        max={5}
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>리뷰 내용</Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        value={contents}
                        onChange={e => setContents(e.target.value)}
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>한줄 요약(선택)</Typography>
                    <TextField
                        fullWidth
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        placeholder="입력하지 않으면 기존 내용 유지"
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>리뷰 이미지</Typography>
                    {/* 기존 이미지 */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                        {keptImages.map(img => (
                            <Box key={img.imageId} sx={{ position: "relative" }}>
                                <Avatar src={img.imageUrl} variant="rounded" sx={{ width: 60, height: 60 }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: "absolute", top: -10, right: -10, bgcolor: "white" }}
                                    onClick={() => handleRemoveOldImage(img.imageId)}
                                >
                                    <Icon>delete</Icon>
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    {/* 새로 추가한 이미지 */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                        {newImagePreviews.map((src, i) => (
                            <Box key={i} sx={{ position: "relative" }}>
                                <Avatar src={src} variant="rounded" sx={{ width: 60, height: 60 }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: "absolute", top: -10, right: -10, bgcolor: "white" }}
                                    onClick={() => handleRemoveNewImage(i)}
                                >
                                    <Icon>delete</Icon>
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    {/* 파일 첨부 */}
                    <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                        이미지 추가
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddImages}
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        {keptImages.length + newImages.length} / {MAX_IMAGES}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button variant="contained" onClick={handleEditSave} disabled={loading}>저장</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewEditDialog;
