"use client"

import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    TextField,
    Rating,
    IconButton,
} from "@mui/material";
import { ChevronRight, PhotoCamera, Delete } from "@mui/icons-material";
import { registerReview, uploadReviewImages } from "@/service/product/DeliveredProductAPI";

interface ReviewWriteViewProps {
    product: {
        productId: string;
        productImage: string;
        productName: string;
        deliveredAt: string;
    };
    setDetailView: () => void;
    onComplete: () => void;
}

const MAX_IMAGES = 10;
const MAX_SUMMARY = 30;

const ReviewWriteView: React.FC<ReviewWriteViewProps> = ({
                                                             product,
                                                             setDetailView,
                                                             onComplete,
                                                         }) => {
    const [star, setStar] = useState<number | null>(0);
    const [contents, setContents] = useState("");
    const [summary, setSummary] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const fileArr = Array.from(files).slice(0, MAX_IMAGES - images.length);
        setImages((prev) => [...prev, ...fileArr]);
        fileArr.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const handleImageDelete = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setUploadPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    // 등록하기
    const handleSubmit = async () => {
        if (!star || !contents.trim()) {
            alert("별점과 상세리뷰를 입력해 주세요.");
            return;
        }
        setSubmitting(true);
        try {
            // 1. 리뷰 등록
            const reviewId = await registerReview({
                productId: product.productId,
                star,
                contents,
                summary,
            });

            // 2. 이미지 있으면 업로드
            if (images.length > 0) {
                await uploadReviewImages(reviewId, images);
            }

            onComplete(); // 성공시 상위에서 alert!
        } catch (e: any) {
            alert("리뷰 등록에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Button
                startIcon={<ChevronRight sx={{ transform: "rotate(180deg)" }} />}
                onClick={setDetailView}
                sx={{ mb: 3 }}
                disabled={submitting}
            >
                뒤로가기
            </Button>

            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
                상품 후기 다루
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                이 상품의 품질에 대해서 얼마나 만족하시나요?
            </Typography>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                    <Avatar
                        src={`https://${product.productImage}`}
                        variant="rounded"
                        sx={{ width: 80, height: 80 }}
                    />
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                            {product.productName}
                        </Typography>
                        <Rating
                            size="large"
                            value={star}
                            onChange={(_, val) => setStar(val)}
                            precision={1}
                            max={5}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (필수)*
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        상세리뷰
                    </Typography>
                    <TextField
                        multiline
                        rows={6}
                        fullWidth
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                        placeholder="다른 고객님에게 도움이 되도록 상품에 대한 솔직한 평가를 남겨주세요."
                        variant="outlined"
                        sx={{ mb: 2 }}
                        inputProps={{ maxLength: 1000 }}
                    />
                    <Box sx={{ textAlign: "right", mt: 1 }}>
                        <Typography variant="caption">{contents.length}</Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        사진첨부
                    </Typography>
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        sx={{ mb: 2 }}
                        disabled={images.length >= MAX_IMAGES}
                    >
                        사진 첨부하기
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleImageUpload}
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {images.length}/{MAX_IMAGES}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        사진은 최대 20MB 이하의 JPG, PNG, GIF 파일 10장까지 첨부 가능합니다.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                        {uploadPreviews.map((src, idx) => (
                            <Box key={idx} sx={{ position: "relative" }}>
                                <Avatar src={src} variant="rounded" sx={{ width: 60, height: 60 }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: "absolute", top: -8, right: -8, bgcolor: "white" }}
                                    onClick={() => handleImageDelete(idx)}
                                    disabled={submitting}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        한줄요약
                    </Typography>
                    <TextField
                        fullWidth
                        value={summary}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_SUMMARY) setSummary(e.target.value);
                        }}
                        placeholder="한 줄 요약을 입력해 주세요"
                        variant="outlined"
                        sx={{ mb: 1 }}
                    />
                    <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption">{summary.length}/{MAX_SUMMARY}</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                    <Button variant="outlined" size="large" sx={{ minWidth: 120 }} onClick={setDetailView} disabled={submitting}>
                        취소하기
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ minWidth: 120 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        등록하기
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ReviewWriteView;
