// src/components/SellerDashboard/SellerInfo/ProfileImageUpload.tsx

import React, { useRef, useState } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { CameraAlt as CameraIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { BRAND_COLORS } from "./constants";

// ==================== 인터페이스 ====================
interface ProfileImageUploadProps {
    currentImage: string | null;
    onChange: (image: string | null) => void;
    onUpload?: (file: File) => Promise<void>;
    onDelete?: () => Promise<void>;
}

// ==================== 프로필 이미지 업로드 컴포넌트 ====================
const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
                                                                   currentImage,
                                                                   onChange,
                                                                   onUpload,
                                                                   onDelete,
                                                               }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 크기 검증 (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        // 파일 형식 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPEG, PNG, JPG, WebP 형식의 이미지만 업로드 가능합니다.');
            return;
        }

        try {
            setUploading(true);

            if (onUpload) {
                // 실제 API 업로드 사용
                await onUpload(file);
            } else {
                // 로컬 미리보기 (fallback)
                const reader = new FileReader();
                reader.onload = (e) => {
                    onChange(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
        } finally {
            setUploading(false);
            // input 값 초기화 (같은 파일을 다시 선택할 수 있도록)
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (uploading) return;

        const confirmed = window.confirm('이미지를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            setUploading(true);

            if (onDelete) {
                // 실제 API 삭제 사용
                await onDelete();
            } else {
                // 로컬 상태만 변경 (fallback)
                onChange(null);
            }
        } catch (error) {
            console.error('이미지 삭제 실패:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box>
            <Typography
                variant="body2"
                fontWeight="500"
                color={BRAND_COLORS.TEXT_PRIMARY}
                mb={1}
            >
                프로필 이미지
            </Typography>
            <Box
                sx={{
                    position: "relative",
                    width: 120,
                    height: 120,
                    borderRadius: 3,
                    border: `2px dashed ${BRAND_COLORS.BORDER}`,
                    backgroundColor: uploading ? BRAND_COLORS.SECONDARY : BRAND_COLORS.BACKGROUND_LIGHT,
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    opacity: uploading ? 0.7 : 1,
                    "&:hover": {
                        borderColor: uploading ? BRAND_COLORS.BORDER : BRAND_COLORS.PRIMARY,
                        backgroundColor: uploading ? BRAND_COLORS.SECONDARY : BRAND_COLORS.BACKGROUND_INPUT,
                    }
                }}
                onClick={handleImageClick}
            >
                {uploading ? (
                    <Box textAlign="center">
                        <CircularProgress
                            size={32}
                            sx={{ color: BRAND_COLORS.PRIMARY, mb: 1 }}
                        />
                        <Typography
                            variant="caption"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                            display="block"
                        >
                            업로드 중...
                        </Typography>
                    </Box>
                ) : currentImage ? (
                    <>
                        <img
                            src={currentImage}
                            alt="Profile"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <IconButton
                            sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                }
                            }}
                            size="small"
                            onClick={handleRemoveImage}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    <Box textAlign="center">
                        <CameraIcon
                            sx={{
                                fontSize: 32,
                                color: BRAND_COLORS.TEXT_SECONDARY,
                                mb: 1
                            }}
                        />
                        <Typography
                            variant="caption"
                            color={BRAND_COLORS.TEXT_SECONDARY}
                            display="block"
                        >
                            이미지 업로드
                        </Typography>
                    </Box>
                )}
            </Box>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={uploading}
            />
            <Typography
                variant="caption"
                color={BRAND_COLORS.TEXT_SECONDARY}
                mt={1}
                display="block"
            >
                권장 크기: 400x400px, 최대 10MB
                <br />
                지원 형식: JPEG, PNG, JPG, WebP
            </Typography>
        </Box>
    );
};

export default ProfileImageUpload;