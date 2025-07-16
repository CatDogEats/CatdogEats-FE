// src/components/common/ProductCard.tsx (수정된 버전)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Rating,
    alpha,
    useTheme,
} from "@mui/material";
import {
    FavoriteBorder as FavoriteIcon,
    Favorite as FilledFavoriteIcon,
    LocalShipping as ShippingIcon,
    Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { Product } from "@/types/Product";

interface ProductCardProps {
    product: Product;
    onFavoriteToggle?: (productId: string) => void;
    onClick?: (product: Product) => void; // 선택적: 커스텀 클릭 핸들러
    disableNavigation?: boolean; // 선택적: 네비게이션 비활성화
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     product,
                                                     onFavoriteToggle,
                                                     onClick,
                                                     disableNavigation = false,
                                                 }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
    const [isHovered, setIsHovered] = useState(false);

    const handleFavoriteClick = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsFavorite(!isFavorite);
        onFavoriteToggle?.(product.productNumber);
    };

    const handleCardClick = () => {
        // 네비게이션이 비활성화되지 않았다면 상품 상세 페이지로 이동
        if (!disableNavigation) {
            navigate(`/products/${product.productNumber}`);
        }

        // 커스텀 클릭 핸들러가 있으면 추가로 실행 (네비게이션 후)
        if (onClick) {
            onClick(product);
        }
    };

    const formatPrice = (price: number | null | undefined): string => {
        // null, undefined, 또는 숫자가 아닌 값 처리
        if (price == null || isNaN(price)) {
            return '₩0';
        }
        return `₩${price.toLocaleString()}`;
    };

    const renderStars = (rating: number) => {
        return (
            <Rating
                value={rating}
                precision={0.5}
                readOnly
                size="small"
                sx={{
                    color: theme.palette.primary.main,
                    "& .MuiRating-iconEmpty": {
                        color: theme.palette.grey[200],
                    },
                }}
            />
        );
    };

    const getShippingInfo = () => {
        if (product.isOutOfStock && product.restockDate) {
            return {
                icon: <ScheduleIcon sx={{ fontSize: 14 }} />,
                text: product.restockDate,
                color: theme.palette.primary.dark,
            };
        }
        return {
            icon: <ShippingIcon sx={{ fontSize: 14 }} />,
            text: product.shippingInfo || "무료배송",
            color: theme.palette.primary.main,
        };
    };

    const shippingInfo = getShippingInfo();

    // 할인율 계산
    const discountRate = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <Card
            sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow:
                    "0px 4px 12px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                        "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.07)",
                },
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            {/* 이미지 영역 */}
            <Box sx={{ position: "relative" }}>
                <CardMedia
                    component="img"
                    height="192"
                    image={product.imageUrl || product.image}
                    alt={product.name}
                    sx={{
                        objectFit: "cover",
                        transition: "transform 0.3s ease-in-out",
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                        opacity: product.isOutOfStock ? 0.5 : 1,
                    }}
                />

                {/* 찜하기 버튼 */}
                <IconButton
                    onClick={handleFavoriteClick}
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(4px)",
                        color: isFavorite
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        width: 32,
                        height: 32,
                        "&:hover": {
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    {isFavorite ? (
                        <FilledFavoriteIcon sx={{ fontSize: 18 }} />
                    ) : (
                        <FavoriteIcon sx={{ fontSize: 18 }} />
                    )}
                </IconButton>

                {/* 배지들 */}
                <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {product.isNew && (
                        <Chip
                            label="NEW"
                            size="small"
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                height: 24,
                            }}
                        />
                    )}

                    {(product.isBestseller || product.isBestSeller) && (
                        <Chip
                            label="베스트"
                            size="small"
                            sx={{
                                backgroundColor: "#48bb78",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                height: 24,
                            }}
                        />
                    )}

                    {discountRate > 0 && (
                        <Chip
                            label={`${discountRate}%`}
                            size="small"
                            sx={{
                                backgroundColor: "#f56565",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                height: 24,
                            }}
                        />
                    )}
                </Box>

                {/* 품절 오버레이 */}
                {product.isOutOfStock && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Chip
                            label="품절"
                            sx={{
                                backgroundColor: alpha(theme.palette.secondary.main, 0.8),
                                color: theme.palette.background.paper,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* 컨텐츠 영역 */}
            <CardContent
                sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
                {/* 브랜드 */}
                {product.brand && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                            mb: 0.5,
                        }}
                    >
                        {product.brand}
                    </Typography>
                )}

                {/* 상품명 */}
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        fontSize: "0.875rem",
                        mb: 1,
                        height: 40,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis",
                        lineHeight: 1.3,
                    }}
                >
                    {product.name}
                </Typography>

                {/* 평점 */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {renderStars(product.rating)}
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                            ml: 1,
                        }}
                    >
                        ({product.reviewCount})
                    </Typography>
                </Box>

                {/* 가격  */}
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 1, gap: 1 }}>
                    {product.originalPrice && product.originalPrice !== product.price && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.875rem",
                                textDecoration: "line-through",
                            }}
                        >
                            {formatPrice(product.originalPrice)}
                        </Typography>
                    )}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: product.isOutOfStock
                                ? theme.palette.text.primary
                                : theme.palette.primary.main,
                            fontSize: "1.125rem",
                        }}
                    >
                        {formatPrice(product.price)}
                    </Typography>
                </Box>

                {/* 배송 정보 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: "auto",
                    }}
                >
                    <Box sx={{ color: shippingInfo.color, mr: 0.5 }}>
                        {shippingInfo.icon}
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: shippingInfo.color,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                        }}
                    >
                        {shippingInfo.text}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;