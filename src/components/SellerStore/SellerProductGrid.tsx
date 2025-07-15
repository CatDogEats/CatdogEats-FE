import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Grid,
    Chip,
    Stack,
    Pagination,
} from '@mui/material';
import {
    FavoriteBorder,
    Favorite,
    Star,
} from '@mui/icons-material';
import { SellerProduct } from '@/components/SellerStore/types';

interface SellerProductGridProps {
    products: SellerProduct[];
    onProductClick: (productId: string) => void;
    onToggleLike: (productId: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (event: unknown, page: number) => void;
}

const SellerProductGrid: React.FC<SellerProductGridProps> = ({
                                                                 products,
                                                                 onProductClick,
                                                                 onToggleLike,
                                                                 currentPage,
                                                                 totalPages,
                                                                 onPageChange,
                                                             }) => {
    return (
        <Box>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {products.map((product) => (
                    <Grid
                        key={product.id}
                        size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}
                    >
                        <Card
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-2px)',
                                },
                                border: 1,
                                borderColor: 'grey.200',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onClick={() => onProductClick(product.id)}
                        >
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="div"
                                    sx={{
                                        height: 0,
                                        paddingTop: '100%', // 1:1 aspect ratio
                                        backgroundImage: `url(${product.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        transition: 'transform 0.3s ease',
                                        backgroundColor: 'grey.100', // 이미지 로딩 실패 시 기본 배경
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                />

                                {/* 좋아요 버튼 */}
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleLike(product.id);
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(4px)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                        width: 32,
                                        height: 32,
                                    }}
                                >
                                    {product.isLiked ? (
                                        <Favorite sx={{ color: 'error.main', fontSize: 18 }} />
                                    ) : (
                                        <FavoriteBorder sx={{ color: 'error.main', fontSize: 18 }} />
                                    )}
                                </IconButton>

                                {/* 품절 표시 */}
                                {product.isOutOfStock && (
                                    <Chip
                                        label="품절"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                )}

                                {/* 할인율 표시 */}
                                {product.discountPercentage && product.discountPercentage > 0 && (
                                    <Chip
                                        label={`${product.discountPercentage}%`}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: product.isOutOfStock ? 48 : 8,
                                            left: 8,
                                            bgcolor: '#e37d11',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                )}
                            </Box>

                            <CardContent sx={{
                                p: { xs: 1.5, sm: 2 },
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Typography
                                    variant="body1"
                                    component="h3"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        lineHeight: 1.4,
                                        mb: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flexGrow: 1,
                                    }}
                                >
                                    {product.name}
                                </Typography>

                                <Box sx={{ mt: 'auto' }}>
                                    {/* 가격 */}
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                        <Typography
                                            variant="h6"
                                            component="span"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: product.isOutOfStock ? 'grey.400' : '#e37d11',
                                                fontSize: { xs: '1rem', sm: '1.125rem' },
                                            }}
                                        >
                                            {product.price.toLocaleString()}원
                                        </Typography>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    textDecoration: 'line-through',
                                                    color: 'grey.500',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {product.originalPrice.toLocaleString()}원
                                            </Typography>
                                        )}
                                    </Stack>

                                    {/* 평점과 리뷰 */}
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Star sx={{ color: '#ffc107', fontSize: 14 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            | 리뷰 {product.reviewCount}+
                                        </Typography>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 4,
                    mb: 2
                }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={onPageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '1rem',
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default SellerProductGrid;