import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Divider,
    Alert,
    CircularProgress,
    Snackbar,
    Stack,
} from '@mui/material';
import {
    SellerProfileCard,
    SellerProductGrid,
    SimilarSellersGrid,
} from '@/components/SellerStore';
import {
    SellerProfile,
    SellerProduct,
    SimilarSeller,
    transformSellerInfo,
    transformProduct,
    FILTER_MAP
} from '@/components/SellerStore/types';
import { sellerStoreApi, SellerStoreParams, convertCategoriesToParams } from '@/service/seller/SellerStoreAPI.ts';
import ProductFilter from '@/components/SellerStore/ProductFilter.tsx';
import CategoryFilter from '@/components/SellerStore/CategoryFilter.tsx';
import ProductSkeleton from '@/components/SellerStore/ProductSkeleton.tsx';
import {chatApiService} from "@/service/chat/chatAPI.ts";

const SellerStorePage: React.FC = () => {
    const { sellerId } = useParams<{ sellerId: string }>();
    const navigate = useNavigate();

    // 상태 관리
    const [seller, setSeller] = useState<SellerProfile | null>(null);
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [similarSellers] = useState<SimilarSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [isSellerLiked, setIsSellerLiked] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // 필터 상태
    const [filters, setFilters] = useState({
        excludeOutOfStock: false,
        bestProducts: false,
        discountProducts: false,
        newProducts: false,
    });

    // 카테고리 필터 상태
    const [categoryFilters, setCategoryFilters] = useState({
        dog: false,
        cat: false,
        handmade: false,
        finished: false,
    });

    // 현재 활성화된 필터 계산
    const activeFilter = useMemo(() => {
        const activeFilters = Object.entries(filters)
            .filter(([, isActive]) => isActive)
            .map(([filterKey]) => FILTER_MAP[filterKey as keyof typeof FILTER_MAP]);

        // 하나의 필터만 적용 (여러 필터 동시 적용 시 첫 번째 것만)
        return activeFilters[0] || undefined;
    }, [filters]);



// API 데이터 로딩 함수
    const loadSellerData = useCallback(async (params: SellerStoreParams = {}, isInitialLoad = false) => {
        if (!sellerId) return;

        try {
            // 초기 로딩이 아닌 경우 상품만 로딩 상태로 설정
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setProductsLoading(true);
            }
            setError(null);

            // 카테고리 필터를 API 파라미터로 변환
            const categoryParams = convertCategoriesToParams(categoryFilters);

            const response = await sellerStoreApi.getSellerStorePage(sellerId, {
                page: params.page || currentPage,
                size: 10, // 페이지당 상품 수
                filter: activeFilter,
                ...categoryParams,
                ...params
            });

            // 판매자 정보 변환 (초기 로딩 시에만)
            if (isInitialLoad || !seller) {
                const transformedSeller = transformSellerInfo(response.sellerInfo);
                setSeller(transformedSeller);
            }

            // 상품 목록 변환 - sellerId 파라미터 추가
            const transformedProducts = response.products.content.map(product =>
                transformProduct(product, response.sellerInfo.sellerId)
            );
            setProducts(transformedProducts);
            setTotalProducts(response.products.totalElements);
            setTotalPages(response.products.totalPages);

        } catch (error: any) {
            console.error('판매자 스토어 데이터 로딩 오류:', error);

            let errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';
            if (error.response?.status === 404) {
                errorMessage = '판매자를 찾을 수 없습니다.';
            } else if (error.response?.status === 500) {
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }

            setError(errorMessage);
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setProductsLoading(false);
        }
    }, [sellerId, activeFilter, categoryFilters, seller]);
    // 초기 데이터 로딩 (sellerId 변경 시에만)
    useEffect(() => {
        setCurrentPage(1); // 새로운 판매자 페이지 진입 시 1페이지로 초기화
        loadSellerData({}, true); // 초기 로딩임을 표시
    }, [sellerId]);

    // 필터 변경 시 첫 페이지로 리셋하고 데이터 재로딩
    useEffect(() => {
        setCurrentPage(1);
        loadSellerData({ page: 1 }, false); // 상품만 로딩
    }, [activeFilter, categoryFilters]); // categoryFilters도 의존성에 추가

    // 페이지 변경 시 데이터 재로딩
    useEffect(() => {
        if (seller) { // 판매자 정보가 로드된 후에만 실행
            loadSellerData({ page: currentPage }, false); // 상품만 로딩
        }
    }, [currentPage]);

    // 이벤트 핸들러
    const handleContactSeller = async () => {
        if (!seller) return;
        setSnackbarMessage('판매자 채팅방으로 이동합니다.');
        setSnackbarOpen(true);
        await chatApiService.createChatRoom(seller.name)
        const chatWindow = window.open(
            "/chat", // 또는 채팅용 라우트
            "ChatWindow",
            "width=500,height=700,resizable=yes,scrollbars=yes"
        )
        if (chatWindow) {
            chatWindow.focus()
        }
    };

    const handleToggleSellerLike = () => {
        setIsSellerLiked(!isSellerLiked);
        setSnackbarMessage(isSellerLiked ? '관심 판매자에서 제거되었습니다.' : '관심 판매자로 등록되었습니다.');
        setSnackbarOpen(true);
    };

    const handleShareSeller = () => {
        if (navigator.share) {
            navigator.share({
                title: `${seller?.name} - 판매자 정보`,
                text: `${seller?.name} 판매자의 상품을 확인해보세요!`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setSnackbarMessage('링크가 클립보드에 복사되었습니다.');
            setSnackbarOpen(true);
        }
    };

    const handleProductClick = (productId: string) => {
        // 상품 상세 페이지로 이동
        navigate(`/product/${productId}`);
    };

    const handleToggleProductLike = (productId: string) => {
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId
                    ? { ...product, isLiked: !product.isLiked }
                    : product
            )
        );

        const product = products.find(p => p.id === productId);
        if (product) {
            setSnackbarMessage(
                product.isLiked
                    ? '관심 상품에서 제거되었습니다.'
                    : '관심 상품으로 등록되었습니다.'
            );
            setSnackbarOpen(true);
        }
    };

    const handleSimilarSellerClick = (similarSellerId: string) => {
        navigate(`/seller/${similarSellerId}`);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // 필터 변경 핸들러
    const handleFilterChange = (filterKey: string, value: boolean) => {
        setFilters(() => ({
            // 다른 필터들 모두 false로 설정 (단일 필터만 허용)
            excludeOutOfStock: false,
            bestProducts: false,
            discountProducts: false,
            newProducts: false,
            // 현재 선택된 필터만 활성화
            [filterKey]: value,
        }));
    };

    // 카테고리 필터 변경 핸들러
    const handleCategoryChange = (category: string, selected: boolean) => {
        setCategoryFilters(prev => ({
            ...prev,
            [category]: selected,
        }));
    };

    // 페이지네이션 핸들러 (SellerProductGrid에서 사용)
    const handlePageChange = (_: unknown, page: number) => {
        console.log('페이지 변경:', currentPage, '->', page); // 디버깅용 로그
        setCurrentPage(page);
        // 스크롤 위치 유지 - 필요한 경우에만 부드럽게 이동
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 로딩 상태
    if (loading && !seller) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    // 에러 상태
    if (error && !seller) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    // 판매자를 찾을 수 없는 경우
    if (!seller) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">
                    요청하신 판매자 정보를 찾을 수 없습니다.
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
                {/* 판매자 프로필 카드 */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <SellerProfileCard
                        seller={seller}
                        onContactSeller={handleContactSeller}
                        onToggleLike={handleToggleSellerLike}
                        onShare={handleShareSeller}
                        isLiked={isSellerLiked}
                    />
                </Box>

                <Divider sx={{ mb: { xs: 3, sm: 4 } }} />

                {/* 판매자 상품 섹션 */}
                <Box sx={{ mb: { xs: 4, sm: 6 } }}>
                    <Typography
                        variant="h5"
                        component="h2"
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            mb: { xs: 2, sm: 3 }
                        }}
                    >
                        {seller.name}의 상품 ({totalProducts})
                    </Typography>

                    {/* 필터 섹션 */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Stack spacing={3}>
                            {/* 카테고리 필터 */}
                            <CategoryFilter
                                selectedCategories={categoryFilters}
                                onCategoryChange={handleCategoryChange}
                            />

                            {/* 기존 필터들 */}
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                                    추가 필터
                                </Typography>
                                <ProductFilter
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    {/* 상품 그리드 */}
                    {loading && !seller ? (
                        // 초기 로딩 시 스켈레톤
                        <ProductSkeleton count={10} />
                    ) : productsLoading ? (
                        // 상품만 로딩 중일 때 스켈레톤
                        <ProductSkeleton count={10} />
                    ) : products.length > 0 ? (
                        <SellerProductGrid
                            products={products}
                            onProductClick={handleProductClick}
                            onToggleLike={handleToggleProductLike}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    ) : (
                        <Alert severity="info">
                            {totalProducts === 0 ? '등록된 상품이 없습니다.' : '필터 조건에 맞는 상품이 없습니다.'}
                        </Alert>
                    )}
                </Box>

                {/* 유사 판매자 섹션 (추후 API 연동 시 활성화) */}
                {similarSellers.length > 0 && (
                    <>
                        <Divider sx={{ mb: { xs: 3, sm: 4 } }} />
                        <Box>
                            <Typography
                                variant="h5"
                                component="h2"
                                fontWeight="bold"
                                gutterBottom
                                sx={{
                                    mb: { xs: 2, sm: 3 },
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                }}
                            >
                                비슷한 판매자
                            </Typography>

                            <SimilarSellersGrid
                                sellers={similarSellers}
                                onSellerClick={handleSimilarSellerClick}
                            />
                        </Box>
                    </>
                )}
            </Container>

            {/* 스낵바 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
};

export default SellerStorePage;