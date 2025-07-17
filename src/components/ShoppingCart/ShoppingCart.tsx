import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Checkbox,
    Button,
    Divider,
    IconButton,
    Breadcrumbs,
    Link,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    NavigateNext as NavigateNextIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

// API 연동 훅 import
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/service/cartApi';

// AI Comparison Modal import
// import AIComparisonModal from "./AIComparisonModal";

const ShoppingCart: React.FC = () => {
    const navigate = useNavigate();

    // API 연동 훅 사용
    const {
        cartItems,
        loading,
        error,
        recommendations,
        updateQuantity,
        removeItem,
        clearCart,
        fetchRecommendations,
        getTotalPrice,
        getTotalItemCount,
        getSelectedItems,
        updateItemSelection
    } = useCart();

    // 로컬 상태
    const [selectAll, setSelectAll] = useState(true);
    // const [comparisonOpen, setComparisonOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // 전체 선택 상태 업데이트
    useEffect(() => {
        if (cartItems.length > 0) {
            const allSelected = cartItems.every(item => item.selected);
            setSelectAll(allSelected);
        } else {
            setSelectAll(false);
        }
    }, [cartItems]);

    // 추천 상품 로드
    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // 전체 선택/해제
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        cartItems.forEach(item => {
            updateItemSelection(item.id, checked);
        });
    };

    // 개별 상품 선택/해제
    const handleItemSelect = (cartItemId: string, checked: boolean) => {
        updateItemSelection(cartItemId, checked);
    };

    // 수량 변경
    const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const success = await updateQuantity(cartItemId, newQuantity);
        if (success) {
            showSnackbar('수량이 변경되었습니다.');
        }
    };

    // 상품 삭제
    const handleRemoveItem = async (cartItemId: string) => {
        const success = await removeItem(cartItemId);
        if (success) {
            showSnackbar('상품이 삭제되었습니다.');
        }
    };

    // 선택된 상품 삭제
    const handleRemoveSelected = async () => {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
            showSnackbar('삭제할 상품을 선택해주세요.');
            return;
        }

        try {
            for (const item of selectedItems) {
                await removeItem(item.id);
            }
            showSnackbar('선택한 상품들이 삭제되었습니다.');
        } catch (error) {
            showSnackbar('상품 삭제 중 오류가 발생했습니다.');
        }
    };

    // 장바구니 비우기
    const handleClearCart = async () => {
        if (cartItems.length === 0) {
            showSnackbar('장바구니가 이미 비어있습니다.');
            return;
        }

        if (window.confirm('장바구니를 비우시겠습니까?')) {
            const success = await clearCart();
            if (success) {
                showSnackbar('장바구니가 비워졌습니다.');
            }
        }
    };

    // // AI 상품 비교 기능
    // const handleCompareSelected = () => {
    //     const selectedItems = getSelectedItems();
    //     if (selectedItems.length === 0) {
    //         showSnackbar('비교할 상품을 선택해주세요.');
    //         return;
    //     }
    //     setComparisonOpen(true);
    // };

    // 결제 처리
    const handleCheckout = () => {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
            showSnackbar('결제할 상품을 선택해주세요.');
            return;
        }
        navigate('/checkout', { state: { selectedItems } });
    };

    // 쇼핑 계속하기
    const handleContinueShopping = () => {
        navigate('/productsList');
    };

    // 스낵바 표시
    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    // 가격 포맷팅 함수
    const formatPrice = (price: number) => {
        return `${price.toLocaleString()}원`;
    };

    // 로딩 상태
    if (loading && cartItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 3, mt: 2, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    장바구니를 불러오고 있습니다...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3, mt: 2 }}>
            {/* 브레드크럼 */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link
                    href="#"
                    color="inherit"
                    sx={{
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        color: "#666",
                    }}
                    onClick={handleContinueShopping}
                >
                    쇼핑
                </Link>
                <Typography color="text.primary" sx={{ fontSize: "0.875rem" }}>
                    장바구니
                </Typography>
            </Breadcrumbs>

            {/* 페이지 제목 */}
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    mb: 4,
                    fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif',
                }}
            >
                장바구니
            </Typography>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                {/* 장바구니 상품 목록 */}
                <Box sx={{ flex: "1 1 65%" }}>
                    {cartItems.length > 0 ? (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            {/* 전체 선택 및 액션 버튼 */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        color="primary"
                                    />
                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                        전체 선택 ({cartItems.length}개)
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleRemoveSelected}
                                        disabled={loading}
                                    >
                                        선택 삭제
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleClearCart}
                                        disabled={loading}
                                    >
                                        전체 삭제
                                    </Button>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* 상품 목록 */}
                            {cartItems.map((item) => (
                                <Box key={item.id} sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Checkbox
                                            checked={item.selected || false}
                                            onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                            color="primary"
                                        />
                                        <Box
                                            component="img"
                                            src={item.productImage || "/api/placeholder/100/100"}
                                            alt={item.productName}
                                            sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 1 }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                                                {item.productName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                판매자: {item.sellerName}
                                            </Typography>
                                            <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                                                {formatPrice(item.price)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || loading}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 40, textAlign: "center" }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={loading}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={loading}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}

                            {/*/!* AI 비교 버튼 *!/*/}
                            <Box sx={{ mt: 3, textAlign: "center" }}>
                            {/*    <Button*/}
                            {/*        variant="outlined"*/}
                            {/*        onClick={handleCompareSelected}*/}
                            {/*        disabled={loading}*/}
                            {/*        sx={{ mr: 2 }}*/}
                            {/*    >*/}
                            {/*        AI 상품 비교*/}
                            {/*    </Button>*/}
                                <Button
                                    variant="text"
                                    onClick={handleContinueShopping}
                                >
                                    쇼핑 계속하기
                                </Button>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper elevation={2} sx={{ p: 6, textAlign: "center" }}>
                            <ShoppingCartIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
                            <Typography variant="h5" sx={{ mb: 2, color: "#666" }}>
                                장바구니가 비어있습니다
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, color: "#999" }}>
                                원하는 상품을 장바구니에 담아보세요!
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleContinueShopping}
                                sx={{ px: 4, py: 1.5 }}
                            >
                                상품 둘러보기
                            </Button>
                        </Paper>
                    )}
                </Box>

                {/* 주문 요약 */}
                {cartItems.length > 0 && (
                    <Box sx={{ flex: "1 1 35%" }}>
                        <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 20 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                                주문 요약
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">선택된 상품</Typography>
                                    <Typography variant="body2">{getTotalItemCount()}개</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">상품 금액</Typography>
                                    <Typography variant="body2">{formatPrice(getTotalPrice())}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">배송비</Typography>
                                    <Typography variant="body2" color="success.main">
                                        무료
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    총 결제 금액
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                                    {formatPrice(getTotalPrice())}
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleCheckout}
                                disabled={loading || getSelectedItems().length === 0}
                                sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
                            >
                                {loading ? '처리 중...' : `${getTotalItemCount()}개 상품 주문하기`}
                            </Button>

                            {/* 추천 상품 섹션 */}
                            {recommendations.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                        추천 상품
                                    </Typography>
                                    {recommendations.slice(0, 3).map((product) => (
                                        <Box
                                            key={product.productId}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 2,
                                                p: 1,
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#f5f5f5" }
                                            }}
                                            onClick={() => navigate(`/product/${product.productId}`)}
                                        >
                                            <Box
                                                component="img"
                                                src={product.productImage || "/api/placeholder/60/60"}
                                                alt={product.productName}
                                                sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, mr: 2 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                                    {product.productName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {product.sellerName}
                                                </Typography>
                                                <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
                                                    {formatPrice(product.price)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}
            </Box>

            {/*/!* AI 상품 비교 모달 *!/*/}
            {/*<AIComparisonModal*/}
            {/*    open={comparisonOpen}*/}
            {/*    onClose={() => setComparisonOpen(false)}*/}
            {/*    selectedProducts={getSelectedItems().map(item => ({*/}
            {/*        id: item.productId,*/}
            {/*        name: item.productName,*/}
            {/*        price: item.price,*/}
            {/*        image: item.productImage,*/}
            {/*        seller: item.sellerName*/}
            {/*    }))}*/}
            {/*/>*/}

            {/* 스낵바 알림 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default ShoppingCart;