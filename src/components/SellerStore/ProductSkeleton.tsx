import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Skeleton,
    Stack,
} from '@mui/material';

interface ProductSkeletonProps {
    count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
    return (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid
                    key={index}
                    size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}
                >
                    <Card
                        sx={{
                            border: 1,
                            borderColor: 'grey.200',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* 이미지 스켈레톤 */}
                        <Box sx={{ position: 'relative' }}>
                            <Skeleton
                                variant="rectangular"
                                sx={{
                                    height: 0,
                                    paddingTop: '100%', // 1:1 aspect ratio
                                }}
                            />
                        </Box>

                        <CardContent sx={{
                            p: { xs: 1.5, sm: 2 },
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* 상품명 스켈레톤 */}
                            <Skeleton
                                variant="text"
                                sx={{
                                    fontSize: '1rem',
                                    mb: 1,
                                    flexGrow: 1,
                                }}
                            />
                            <Skeleton
                                variant="text"
                                sx={{
                                    fontSize: '1rem',
                                    mb: 2,
                                    width: '70%',
                                }}
                            />

                            <Box sx={{ mt: 'auto' }}>
                                {/* 가격 스켈레톤 */}
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <Skeleton variant="text" sx={{ fontSize: '1.125rem', width: '60%' }} />
                                </Stack>

                                {/* 평점과 리뷰 스켈레톤 */}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Skeleton variant="circular" width={14} height={14} />
                                    <Skeleton variant="text" sx={{ fontSize: '0.75rem', width: '80px' }} />
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductSkeleton;