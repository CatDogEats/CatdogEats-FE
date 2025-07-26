// src/pages/ProductListPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {
    Container, Box, Grid, Button, useTheme, useMediaQuery,
    Dialog, DialogTitle, DialogContent, IconButton, alpha, CircularProgress
} from "@mui/material";
import {
    FilterList as FilterListIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import {
    ProductSorting, ProductGrid, MobileBottomNav,
} from "@/components/ProductList";
import ProductFilters from "@/components/ProductList/components/ProductFilters";
import { fetchProducts } from "@/service/product/ProductListAPI";
import type { Product } from "@/types/Product";
import type { ProductFilters as ProductFiltersType } from "@/types/Product";
import type { PetType, ProductType } from "@/types/Product";

// 백엔드 → 프론트 Product 변환 함수
function mapProduct(item: any): Product {
    let imageUrl = item.imageUrl;
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
        imageUrl = "https://" + imageUrl;
    }
    return {
        id: item.id,
        name: item.productName,
        brand: item.vendorName || "",
        price: item.discountedPrice,
        originalPrice: item.isDiscounted ? item.price : undefined,
        imageUrl: imageUrl,
        rating: item.averageStar ?? 0,
        category: item.productCategory === "HANDMADE" ? "수제 간식" : "완제품 간식",
        petType: item.petCategory === "DOG" ? "강아지" : "고양이",
        ingredients: [],
        healthBenefits: [],
        isFavorite: false,
        hasAllergens: false,
        productNumber: item.productNumber,
        reviewCount: item.reviewCount
    };
}

const PRODUCTS_PER_PAGE = 8;

function getFiltersFromParams(params: { pet?: string; type?: string }): ProductFiltersType {
    let petType: PetType | null = null;
    let productType: ProductType | null = null;
    if (params.pet === "dog") petType = "강아지";
    if (params.pet === "cat") petType = "고양이";
    if (params.type === "handmade") productType = "수제품";
    if (params.type === "finished") productType = "완제품";
    return { petType, productType };
}

const ProductListPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const params = useParams(); // { pet: 'dog'|'cat', type: 'handmade'|'finished' }
    const navigate = useNavigate();

    // URL 파라미터로부터 필터값 세팅
    const [filters, setFilters] = useState<ProductFiltersType>(() => getFiltersFromParams(params));

    // URL 파라미터가 바뀌면 filters도 바뀌게
    useEffect(() => {
        setFilters(getFiltersFromParams(params));
    }, [params.pet, params.type]);

    const [sortBy, setSortBy] = useState<"CREATED_AT" | "PRICE" | "AVERAGE_STAR">("CREATED_AT");
    const [sortDirection] = useState<"asc" | "desc">("desc"); // 백엔드에서 내림차순만 우선 지원
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // 한글 → API 파라미터 변환
    const getApiParams = useCallback(() => {
        const petCategory: "DOG" | "CAT" | undefined =
            filters.petType === "강아지" ? "DOG"
                : filters.petType === "고양이" ? "CAT"
                    : undefined;

        const productCategory: "HANDMADE" | "FINISHED" | undefined =
            filters.productType === "수제품"
                ? "HANDMADE"
                : filters.productType === "완제품"
                    ? "FINISHED"
                    : undefined;

        return {
            petCategory,
            productCategory,
            sortBy,
            page: currentPage - 1,
            size: PRODUCTS_PER_PAGE,
        };
    }, [filters, sortBy, currentPage]);

    useEffect(() => {
        setLoading(true);
        fetchProducts(getApiParams())
            .then((data) => {
                setProducts(data.content.map(mapProduct));
                setTotalPages(data.totalPages);
                setTotalCount(data.totalElements);
            })
            .catch(() => {
                setProducts([]);
                setTotalPages(1);
                setTotalCount(0);
            })
            .finally(() => setLoading(false));
    }, [filters, sortBy, currentPage, getApiParams]);

    // 필터 핸들러
    const handleFiltersChange = (newFilters: ProductFiltersType) => {
        let path = "/productsList";
        if (newFilters.petType === "강아지") path += "/dog";
        else if (newFilters.petType === "고양이") path += "/cat";

        if (newFilters.productType === "수제품") path += "/handmade";
        else if (newFilters.productType === "완제품") path += "/finished";

        navigate(path);
        // setFilters는 URL 바뀌면 자동 반영됨
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy as "CREATED_AT" | "PRICE" | "AVERAGE_STAR");
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleMobileFilterOpen = () => setIsFilterDialogOpen(true);
    const handleMobileFilterClose = () => setIsFilterDialogOpen(false);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/*<Breadcrumb items={breadcrumbItems} />*/}
            <Grid container spacing={4}>
                {/* 데스크탑 필터 */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
                    <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
                </Grid>
                {/* 메인 컨텐츠 */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <ProductSorting
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        totalCount={totalCount}
                        filters={filters}
                        onSortChange={handleSortChange}
                        onSortDirectionChange={() => {}}
                    />
                    {/* 모바일 필터 버튼 */}
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={handleMobileFilterOpen}
                        sx={{
                            display: { xs: "flex", md: "none" },
                            width: "100%",
                            mb: 3,
                            borderColor: theme.palette.grey[200],
                            color: theme.palette.text.primary,
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            textTransform: "none",
                            py: 1.5,
                            "&:hover": {
                                borderColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                        }}
                    >
                        필터 보기
                    </Button>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <ProductGrid
                            products={products}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            onFavoriteToggle={() => {}}
                            onProductClick={() => {}}
                        />
                    )}
                </Grid>
            </Grid>
            {/* 모바일 필터 다이얼로그 */}
            <Dialog
                open={isFilterDialogOpen}
                onClose={handleMobileFilterClose}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: isMobile ? 0 : 2,
                        maxHeight: isMobile ? "100%" : "80vh",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: `1px solid ${theme.palette.grey[200]}`,
                        color: theme.palette.text.primary,
                    }}
                >
                    <span>필터</span>
                    <IconButton onClick={handleMobileFilterClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3 }}>
                        <ProductFilters
                            filters={filters}
                            onFiltersChange={(newFilters) => {
                                handleFiltersChange(newFilters);
                                if (!isMobile) handleMobileFilterClose();
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
            <MobileBottomNav
                onSortClick={() => {}} // 추후 구현
                onFilterClick={handleMobileFilterOpen}
            />
        </Container>
    );
};

export default ProductListPage;
