import React, { useEffect, useState } from "react"
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem, Card, CardContent, CardMedia,
    IconButton, Collapse, Chip, Rating, Pagination, CircularProgress, Tooltip
} from "@mui/material"
import { ExpandMore, FilterList, Sort, StarRate, Refresh } from "@mui/icons-material"
import { getSellerProductsOverview, getReviewsByProduct } from "@/service/seller/SellerOverviewAPI"
import ReviewStatistics from "./ReviewStatistics"

interface ProductItem {
    productId: string
    productNumber: string
    productName: string
    reviewCount: number
    averageStar: number
    imageId: string
    imageUrl: string
}
interface ReviewItem {
    id: string
    writerName: string
    petInfoDtoList: Array<{ breed: string; age: number; gender: string }>
    star: number
    contents: string
    updatedAt: string
    images: string[]
}
interface ReviewSummary {
    averageStar: number
    totalReviews: number
    starGroupCount: Record<string, number>
}
interface ProductOverviewResponse {
    products: {
        content: ProductItem[]
        page: number
        size: number
        totalElements: number
        totalPages: number
        last: boolean
    }
    reviewSummary: ReviewSummary
}

const PRODUCTS_PER_PAGE = 10
const REVIEWS_PER_PAGE = 5

interface ProductReviewListProps {
    reviewFilter: string
    reviewSort: string
    onFilterChange: (event: any) => void
    onSortChange: (event: any) => void
}

function normalizeImageUrl(url: string): string {
    if (url && !/^https?:\/\//.test(url)) {
        return "https://" + url
    }
    return url
}

const ProductReviewList: React.FC<ProductReviewListProps> = ({
                                                                 reviewFilter,
                                                                 reviewSort,
                                                                 onFilterChange,
                                                                 onSortChange,
                                                             }) => {
    const [products, setProducts] = useState<ProductItem[]>([])
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
    const [productReviews, setProductReviews] = useState<Record<string, ReviewItem[]>>({})
    const [reviewPages, setReviewPages] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingReview, setLoadingReview] = useState<string | null>(null) // productNumber 기준

    // 정렬 변환
    const getSortType = () => {
        switch (reviewSort) {
            case "latest": return "LATEST"
            case "rating-high": return "STAR"
            case "rating-low": return "STAR" // 프론트에서 역정렬 처리
            case "review-count": return "REVIEW"
            default: return "LATEST"
        }
    }

    // 상품 + 통계 fetch
    useEffect(() => {
        setLoading(true)
        setError(null)
        getSellerProductsOverview({
            page: currentPage - 1,
            size: PRODUCTS_PER_PAGE,
            sortType: getSortType(),
        })
            .then(res => {
                const data: ProductOverviewResponse = res.data
                let list = data.products.content
                list = list.map(item => ({
                    ...item,
                    imageUrl: normalizeImageUrl(item.imageUrl)
                }))
                if (reviewFilter !== "all") {
                    const target = Number(reviewFilter.replace("star", ""))
                    list = list.filter(item => Math.round(item.averageStar) === target)
                }
                if (reviewSort === "rating-low") {
                    list = [...list].sort((a, b) => a.averageStar - b.averageStar)
                }
                setProducts(list)
                setReviewSummary(data.reviewSummary)
                setLoading(false)
                setProductReviews({}) // 상품 새로 불러올 때 캐시 초기화(원하면 제거 가능)
            })
            .catch(() => {
                setError("상품/리뷰 통계 조회 실패")
                setLoading(false)
            })
    }, [reviewFilter, reviewSort, currentPage])

    // row 펼치기(최초 1회만 fetch)
    const handleProductToggle = (productNumber: string) => {
        if (expandedProduct === productNumber) {
            setExpandedProduct(null)
            return
        }
        setExpandedProduct(productNumber)
        setReviewPages(prev => ({ ...prev, [productNumber]: 1 }))
        if (!productReviews[productNumber]) {
            setLoadingReview(productNumber)
            getReviewsByProduct({ productNumber, page: 0, size: REVIEWS_PER_PAGE })
                .then(res => {
                    setProductReviews(prev => ({ ...prev, [productNumber]: res.data.content }))
                    setLoadingReview(null)
                })
                .catch(() => {
                    setProductReviews(prev => ({ ...prev, [productNumber]: [] }))
                    setLoadingReview(null)
                })
        }
    }

    // 새로고침 버튼(무조건 fetch, 캐시 갱신)
    const handleRefreshReviews = (productNumber: string) => {
        setLoadingReview(productNumber)
        getReviewsByProduct({ productNumber, page: (reviewPages[productNumber] || 1) - 1, size: REVIEWS_PER_PAGE })
            .then(res => {
                setProductReviews(prev => ({ ...prev, [productNumber]: res.data.content }))
                setLoadingReview(null)
            })
            .catch(() => {
                setProductReviews(prev => ({ ...prev, [productNumber]: [] }))
                setLoadingReview(null)
            })
    }

    // 리뷰 페이지네이션(캐시 갱신)
    const handleReviewPageChange = (productNumber: string) => (_: any, page: number) => {
        setReviewPages(prev => ({ ...prev, [productNumber]: page }))
        setLoadingReview(productNumber)
        getReviewsByProduct({ productNumber, page: page - 1, size: REVIEWS_PER_PAGE })
            .then(res => {
                setProductReviews(prev => ({ ...prev, [productNumber]: res.data.content }))
                setLoadingReview(null)
            })
            .catch(() => {
                setProductReviews(prev => ({ ...prev, [productNumber]: [] }))
                setLoadingReview(null)
            })
    }

    const handleProductPageChange = (_: any, page: number) => {
        setCurrentPage(page)
        setExpandedProduct(null)
        setProductReviews({})
        setReviewPages({})
    }

    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE))

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                판매자 평점
            </Typography>

            {reviewSummary && <ReviewStatistics stats={{
                averageRating: reviewSummary.averageStar,
                totalReviews: reviewSummary.totalReviews,
                ratingCounts: {
                    5: reviewSummary.starGroupCount["5"] || 0,
                    4: reviewSummary.starGroupCount["4"] || 0,
                    3: reviewSummary.starGroupCount["3"] || 0,
                    2: reviewSummary.starGroupCount["2"] || 0,
                    1: reviewSummary.starGroupCount["1"] || 0,
                }
            }} />}

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>평점 필터</InputLabel>
                    <Select value={reviewFilter} label="평점 필터" onChange={onFilterChange} startAdornment={<FilterList sx={{ mr: 1 }} />}>
                        <MenuItem value="all">전체 평점</MenuItem>
                        <MenuItem value="5star">5점대 제품만</MenuItem>
                        <MenuItem value="4star">4점대 제품만</MenuItem>
                        <MenuItem value="3star">3점대 제품만</MenuItem>
                        <MenuItem value="2star">2점대 제품만</MenuItem>
                        <MenuItem value="1star">1점대 제품만</MenuItem>
                        <MenuItem value="0star">0점대 제품만</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>정렬</InputLabel>
                    <Select value={reviewSort} label="정렬" onChange={onSortChange} startAdornment={<Sort sx={{ mr: 1 }} />}>
                        <MenuItem value="latest">최신 리뷰순</MenuItem>
                        <MenuItem value="rating-high">평점 높은순</MenuItem>
                        <MenuItem value="rating-low">평점 낮은순</MenuItem>
                        <MenuItem value="review-count">리뷰 많은순</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                    총 {products.length}개의 제품 (페이지 {currentPage}/{totalPages})
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : error ? (
                <Box sx={{ textAlign: "center", py: 8 }}><Typography color="error">{error}</Typography></Box>
            ) : products.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <StarRate sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">해당 조건의 제품이 없습니다.</Typography>
                </Box>
            ) : (
                products.map(product => {
                    const isExpanded = expandedProduct === product.productNumber
                    const reviews = productReviews[product.productNumber] || []
                    const reviewPage = reviewPages[product.productNumber] || 1
                    const totalReviewPages = Math.ceil(product.reviewCount / REVIEWS_PER_PAGE)

                    return (
                        <Card key={product.productNumber} sx={{ mb: 3 }}>
                            <CardContent sx={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <CardMedia component="img" sx={{ width: 64, height: 64, borderRadius: 2 }} image={product.imageUrl} alt={product.productName} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" gutterBottom>{product.productName}</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Rating value={Math.round(product.averageStar)} readOnly size="small" />
                                            <Typography variant="body2" fontWeight="medium">{product.averageStar.toFixed(1)}</Typography>
                                            <Typography variant="body2" color="text.secondary">리뷰 {product.reviewCount}개</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Chip label={`리뷰 ${product.reviewCount}개`} size="small" variant="outlined" color="primary" />
                                        <IconButton onClick={() => handleProductToggle(product.productNumber)} sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
                                            <ExpandMore />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                                        <Tooltip title="리뷰 새로고침">
                                            <span>
                                                <IconButton
                                                    onClick={() => handleRefreshReviews(product.productNumber)}
                                                    disabled={loadingReview === product.productNumber}
                                                    size="small"
                                                >
                                                    <Refresh />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                    {loadingReview === product.productNumber ? (
                                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
                                    ) : (
                                        <>
                                            {totalReviewPages > 1 && (
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">리뷰 {reviewPage}/{totalReviewPages} 페이지</Typography>
                                                    <Typography variant="body2" color="text.secondary">{REVIEWS_PER_PAGE}개씩 보기</Typography>
                                                </Box>
                                            )}
                                            {reviews.length === 0 ? (
                                                <Typography color="text.secondary" sx={{ my: 3 }}>등록된 리뷰가 없습니다.</Typography>
                                            ) : (
                                                reviews.map(review => (
                                                    <Box key={review.id} sx={{ mb: 3, pb: 3, borderBottom: "1px solid #f0f0f0" }}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="medium">{review.writerName}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{review.updatedAt}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Rating value={review.star} readOnly size="small" />
                                                                <Typography variant="caption" color="text.secondary">({review.star}.0)</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ mb: 2 }}>{review.contents}</Typography>
                                                    </Box>
                                                ))
                                            )}
                                            {totalReviewPages > 1 && (
                                                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                                    <Pagination
                                                        count={totalReviewPages}
                                                        page={reviewPage}
                                                        onChange={handleReviewPageChange(product.productNumber)}
                                                        color="primary"
                                                        size="medium"
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Collapse>
                        </Card>
                    )
                })
            )}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handleProductPageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    )
}

export default ProductReviewList