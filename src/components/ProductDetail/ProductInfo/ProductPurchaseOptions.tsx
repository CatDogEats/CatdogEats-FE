// src/components/ProductDetail/ProductInfo/ProductPurchaseOptions.tsx
import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Divider,
    CircularProgress,
} from "@mui/material";
import { AddShoppingCart, FavoriteBorder, Favorite, LocalOffer } from "@mui/icons-material";
import { Product } from "../Product";
import ReportModal from "../../common/ReportModal.tsx";
import CouponIssueModal from "./CouponIssueModal";
import NotificationSnackbar from "@/components/common/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";
import { useCart } from "@/hooks/useCart";

interface ProductPurchaseOptionsProps {
    product: Product;
}

const ProductPurchaseOptions: React.FC<ProductPurchaseOptionsProps> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [packaging, setPackaging] = useState(
        product.packaging?.[0]?.label || "기본 포장"
    );
    const [isFavorite, setIsFavorite] = useState(false); // 🔧 기본값으로 설정
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // 커스텀 훅들
    const {
        showSuccess,
        showError,
        showInfo,
        notification,
        hideNotification
    } = useNotification();

    const { addItem } = useCart();

    // 장바구니 추가 핸들러
    const handleAddToCart = async () => {

        try {
            setIsAddingToCart(true);
            console.log(product, "아이디?")
            const success = await addItem({
                productNumber: Number(product.id),
                quantity: quantity,
            });

            if (success) {
                showSuccess(`${product.name}이(가) 장바구니에 추가되었습니다.`);
                console.log('✅ 장바구니 추가 성공:', {
                    productId: product.id,
                    productName: product.name,
                    quantity,
                    packaging
                });
            } else {
                showError('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('❌ 장바구니 추가 실패:', error);

            // 에러 메시지 처리
            let errorMessage = '장바구니 추가에 실패했습니다.';
            if (error instanceof Error) {
                if (error.message.includes('재고')) {
                    errorMessage = '재고가 부족합니다.';
                } else if (error.message.includes('로그인')) {
                    errorMessage = '로그인이 필요합니다.';
                } else if (error.message.includes('권한')) {
                    errorMessage = '권한이 없습니다.';
                }
            }

            showError(errorMessage);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {

            console.log("바로 구매:", {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity,
                packaging
            });

            // TODO: 바로 구매 로직 구현
            showInfo('바로 구매 기능은 준비 중입니다.');
    };

    const handleToggleFavorite = () => {
            setIsFavorite(!isFavorite);
            const message = isFavorite
                ? '관심 상품에서 제거되었습니다.'
                : '관심 상품으로 등록되었습니다.';
            showSuccess(message);

            console.log("찜 상태 변경:", {
                productId: product.id,
                isFavorite: !isFavorite
            });
    };

    const handleReportProduct = () => {
        setReportModalOpen(true);
    };

    const handleReportModalClose = () => {
        setReportModalOpen(false);
    };

    const handleCouponModalOpen = () => {
        setCouponModalOpen(true);
    };

    const handleCouponModalClose = () => {
        setCouponModalOpen(false);
    };

    // 재고 상태 확인
    const isOutOfStock = (product as any).isOutOfStock || false;
    const totalPrice = product.price * quantity;

    return (
        <Box sx={{ width: "100%" }}>
            {/* 재고 없음 알림 */}
            {isOutOfStock && (
                <Box
                    sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: "grey.100",
                        borderRadius: 1,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        현재 품절된 상품입니다
                        {(product as any).restockDate && ` (재입고 예정: ${(product as any).restockDate})`}
                    </Typography>
                </Box>
            )}

            {/* 쿠폰 발급 버튼 */}
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LocalOffer />}
                    onClick={handleCouponModalOpen}
                    sx={{
                        height: 48,
                        color: "primary.main",
                        borderColor: "primary.main",
                        backgroundColor: "rgba(232, 152, 48, 0.05)",
                        "&:hover": {
                            borderColor: "primary.dark",
                            backgroundColor: "rgba(232, 152, 48, 0.1)",
                            color: "primary.dark",
                        },
                        fontWeight: 600,
                    }}
                >
                    이 상품에 사용할 수 있는 쿠폰 받기
                </Button>
            </Box>

            <Divider sx={{ my: 2, borderColor: "grey.200" }} />

            {/* 총 금액 표시 */}
            <Box sx={{ mb: 2, textAlign: "right" }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    총 {totalPrice.toLocaleString()}원
                </Typography>
            </Box>

            {/* 수량/포장 선택 */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                {/* 찜 버튼 자리만큼 공백 */}
                <Box sx={{ width: 48 }}></Box>

                {/* 수량 선택 */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1,
                            color: "text.primary",
                            fontWeight: 500,
                        }}
                    >
                        수량
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            disabled={isOutOfStock || isAddingToCart}
                            displayEmpty
                            sx={{
                                height: 48,
                                backgroundColor: "background.default",
                                "& .MuiSelect-select": {
                                    height: "48px",
                                    padding: "0 14px",
                                    display: "flex",
                                    alignItems: "center",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "grey.200",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: isOutOfStock || isAddingToCart ? "grey.200" : "primary.main",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <MenuItem key={num} value={num}>
                                    {num}개
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* 포장 선택 */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1,
                            color: "text.primary",
                            fontWeight: 500,
                        }}
                    >
                        포장 방식
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={packaging}
                            onChange={(e) => setPackaging(e.target.value)}
                            disabled={isOutOfStock || isAddingToCart}
                            displayEmpty
                            sx={{
                                height: 48,
                                backgroundColor: "background.default",
                                "& .MuiSelect-select": {
                                    height: "48px",
                                    padding: "0 14px",
                                    display: "flex",
                                    alignItems: "center",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "grey.200",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: isOutOfStock || isAddingToCart ? "grey.200" : "primary.main",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            {product.packaging?.map((pack) => (
                                <MenuItem key={pack.value} value={pack.label}>
                                    {pack.label}
                                </MenuItem>
                            )) || (
                                <>
                                    <MenuItem value="기본 포장">기본 포장</MenuItem>
                                    <MenuItem value="선물 포장">선물 포장</MenuItem>
                                </>
                            )}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* 구매 버튼들 */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                <IconButton
                    onClick={handleToggleFavorite}
                    disabled={isAddingToCart}
                    sx={{
                        width: 48,
                        height: 48,
                        border: "1px solid",
                        borderColor: isFavorite ? "primary.main" : "grey.200",
                        backgroundColor: isFavorite ? "primary.light" : "background.default",
                        "&:hover": {
                            borderColor: "primary.main",
                            backgroundColor: isFavorite ? "primary.light" : "grey.100",
                        },
                        "&:disabled": {
                            borderColor: "grey.200",
                            backgroundColor: "grey.100",
                        },
                    }}
                >
                    {isFavorite ? (
                        <Favorite sx={{ color: "primary.main" }} />
                    ) : (
                        <FavoriteBorder sx={{ color: "primary.main" }} />
                    )}
                </IconButton>

                <Button
                    variant="outlined"
                    startIcon={
                        isAddingToCart ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <AddShoppingCart />
                        )
                    }
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    sx={{
                        flex: 1,
                        height: 48,
                        color: "text.primary",
                        borderColor: "grey.200",
                        backgroundColor: "grey.100",
                        "&:hover": {
                            borderColor: "primary.main",
                            backgroundColor: "primary.light",
                            color: "text.primary",
                        },
                        "&:disabled": {
                            backgroundColor: "grey.100",
                            color: "text.disabled",
                        },
                    }}
                >
                    {isAddingToCart ? "추가 중..." : "장바구니"}
                </Button>

                <Button
                    variant="contained"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || isAddingToCart}
                    sx={{
                        flex: 1,
                        height: 48,
                        backgroundColor: "primary.main",
                        "&:hover": {
                            backgroundColor: "primary.dark",
                        },
                        "&:disabled": {
                            backgroundColor: "grey.300",
                        },
                    }}
                >
                    {isOutOfStock ? "품절" : "바로 구매"}
                </Button>
            </Box>

            {/* 신고 버튼 */}
            <Button
                variant="outlined"
                fullWidth
                onClick={handleReportProduct}
                disabled={isAddingToCart}
                sx={{
                    height: 48,
                    color: "text.secondary",
                    borderColor: "grey.200",
                    backgroundColor: "background.default",
                    "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "grey.100",
                        color: "primary.main",
                    },
                    "&:disabled": {
                        backgroundColor: "grey.100",
                        color: "text.disabled",
                    },
                }}
            >
                상품 신고하기
            </Button>

            {/* 상품 신고 모달 */}
            <ReportModal
                open={reportModalOpen}
                onClose={handleReportModalClose}
                type="product"
                targetId={product.id}
                targetName={product.name}
            />

            {/* 쿠폰 발급 모달 */}
            <CouponIssueModal
                open={couponModalOpen}
                onClose={handleCouponModalClose}
                productId={product.id}
                productName={product.name}
            />

            {/* 알림 스낵바 */}
            <NotificationSnackbar
                notification={notification}
                onClose={hideNotification}
            />
        </Box>
    );
};

export default ProductPurchaseOptions;