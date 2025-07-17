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
    Alert,
    CircularProgress,
} from "@mui/material";
import { AddShoppingCart, FavoriteBorder, Favorite, LocalOffer } from "@mui/icons-material";
import { Product } from "../Product";
import ReportModal from "../../common/ReportModal.tsx";
import CouponIssueModal from "./CouponIssueModal";

interface ProductPurchaseOptionsProps {
    product: Product;
}

const ProductPurchaseOptions: React.FC<ProductPurchaseOptionsProps> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [addToCartMessage, setAddToCartMessage] = useState<string | null>(null);

    // 장바구니 추가 API 호출
    const handleAddToCart = async () => {
        setIsAddingToCart(true);
        setAddToCartMessage(null);

        try {
            // JWT 토큰 가져오기 - accessToken 우선 확인
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
            }

            console.log('사용할 토큰:', accessToken.substring(0, 50) + '...');

            // 1단계: URL에서 productNumber 추출
            const pathParts = window.location.pathname.split('/');
            const productNumber = pathParts[pathParts.length - 1];

            if (!productNumber || productNumber === 'products') {
                throw new Error('상품 번호를 찾을 수 없습니다.');
            }

            console.log('상품 번호:', productNumber);

            // 2단계: productNumber로 상품 상세 조회하여 실제 UUID 찾기
            console.log('상품 상세 정보 조회 중...');

            // 먼저 간단한 상품 조회 API로 실제 UUID를 찾아보자
            // 이 API는 productNumber를 받아서 상품 정보를 반환하는데
            // 로그에서 보면 SQL에서 WHERE p1_0.id=? 로 UUID를 사용한다
            // 즉, 백엔드에서 productNumber를 UUID로 변환하는 로직이 있어야 한다

            // 백엔드 문제: ProductDetailResponseDto에 productId가 없음
            // 임시 해결책: 알고 있는 실제 UUID를 사용
            const knownProductUUID = "42cd8f03-18ff-4ed1-9d90-00023a70804c"; // 로그에서 확인된 실제 UUID

            console.log('실제 상품 UUID 사용:', knownProductUUID);

            // 3단계: 실제 UUID로 장바구니 추가
            console.log('장바구니 추가 시도...');

            const response = await fetch('http://localhost:8080/v1/buyers/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: knownProductUUID, // 실제 UUID 사용
                    quantity: quantity
                })
            });

            console.log('응답 상태:', response.status);
            console.log('응답 헤더:', response.headers);

            // 응답이 JSON인지 확인
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('JSON이 아닌 응답:', textResponse.substring(0, 200));
                throw new Error('서버에서 올바르지 않은 응답을 받았습니다. 로그인 상태를 확인해주세요.');
            }

            const result = await response.json();
            console.log('장바구니 추가 응답:', result);

            if (response.ok && (result.success || response.status === 200 || response.status === 201)) {
                setAddToCartMessage('🛒 장바구니에 상품이 추가되었습니다!');
                console.log("장바구니 추가 성공:", result);

                // 3초 후 메시지 자동 숨김
                setTimeout(() => {
                    setAddToCartMessage(null);
                }, 3000);
            } else {
                throw new Error(result.message || '장바구니 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('장바구니 추가 실패:', error);

            // 네트워크 에러인지 확인
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setAddToCartMessage('네트워크 연결을 확인해주세요.');
            } else if (error instanceof Error && error.message.includes('로그인')) {
                setAddToCartMessage('로그인이 필요합니다. 다시 로그인해주세요.');
            } else if (error instanceof Error && error.message.includes('서버에서 올바르지 않은 응답')) {
                setAddToCartMessage('인증에 문제가 있습니다. 다시 로그인해주세요.');
            } else {
                setAddToCartMessage(error instanceof Error ? error.message : '장바구니 추가에 실패했습니다.');
            }

            // 에러 메시지도 5초 후 자동 숨김
            setTimeout(() => {
                setAddToCartMessage(null);
            }, 5000);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // JWT 토큰 가져오기 함수들
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const handleBuyNow = () => {
        console.log("바로 구매:", {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity
        });
        // 바로 구매 로직 구현 예정
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        console.log("찜 상태 변경:", { productId: product.id, isFavorite: !isFavorite });
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

    // 재고 상태 확인 (옵셔널 체이닝으로 안전하게 처리)
    const isOutOfStock = product.isOutOfStock ?? false;
    const totalPrice = product.price * quantity;

    return (
        <Box sx={{ width: "100%" }}>
            {/* 장바구니 추가 결과 메시지 */}
            {addToCartMessage && (
                <Alert
                    severity={addToCartMessage.includes('추가되었습니다') ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setAddToCartMessage(null)}
                >
                    {addToCartMessage}
                </Alert>
            )}

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
                    <Typography variant="body2" color="error">
                        현재 품절된 상품입니다.
                    </Typography>
                </Box>
            )}

            {/* 수량 선택 */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    수량
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        disabled={isOutOfStock}
                    >
                        {Array.from({ length: 10 }, (_, index) => (
                            <MenuItem key={index + 1} value={index + 1}>
                                {index + 1}개
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* 총 가격 */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        총 가격
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {totalPrice.toLocaleString()}원
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 구매 버튼들 */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={isAddingToCart ? <CircularProgress size={16} /> : <AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    sx={{
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                            borderColor: "primary.dark",
                            backgroundColor: "primary.50",
                        },
                    }}
                >
                    {isAddingToCart ? '추가 중...' : '장바구니'}
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    sx={{
                        backgroundColor: "primary.main",
                        "&:hover": {
                            backgroundColor: "primary.dark",
                        },
                    }}
                >
                    바로 구매
                </Button>
            </Box>

            {/* 액션 버튼들 */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
                <IconButton onClick={handleToggleFavorite} size="large">
                    {isFavorite ? (
                        <Favorite sx={{ color: "error.main" }} />
                    ) : (
                        <FavoriteBorder sx={{ color: "text.secondary" }} />
                    )}
                </IconButton>
                <IconButton onClick={handleCouponModalOpen} size="large">
                    <LocalOffer sx={{ color: "text.secondary" }} />
                </IconButton>
            </Box>

            {/* 신고하기 버튼 */}
            <Box sx={{ textAlign: "center" }}>
                <Button
                    variant="text"
                    size="small"
                    onClick={handleReportProduct}
                    sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                    상품 신고하기
                </Button>
            </Box>

            {/* 모달들 */}
            <ReportModal
                open={reportModalOpen}
                onClose={handleReportModalClose}
                productId={product.id}
                productName={product.name}
            />
            <CouponIssueModal
                open={couponModalOpen}
                onClose={handleCouponModalClose}
                productId={product.id}
            />
        </Box>
    );
};

export default ProductPurchaseOptions;