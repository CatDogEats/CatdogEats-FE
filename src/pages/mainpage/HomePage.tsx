import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    HeroSection,
    RecommendationSection,
    WorkshopSection,
    ProductTabSection
} from '@/components/Home';
import { Workshop } from '@/components/Home/types';
import { popularWorkshops, contentCategories } from '@/data';
import { getMainProducts } from '@/service/product/BuyerProductAPI';
import { Product } from '@/types/Product';

const HomePage = () => {
    const navigate = useNavigate();

    // 각 탭별 상품 상태
    const [productSets, setProductSets] = useState<Product[][]>([[], [], []]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getMainProducts('NEW'),
            getMainProducts('BEST'),
            getMainProducts('DISCOUNT')
        ]).then(([newProducts, bestProducts, discountProducts]) => {
            setProductSets([
                newProducts,
                bestProducts,
                discountProducts
            ]);
            setLoading(false);
        });
    }, []);

    // 상품 클릭 시 상세페이지 이동 (productNumber 사용)
    const handleProductClick = (product: Product) => {
        navigate(`/products/${product.productNumber}`);
    };

    const handleWorkshopClick = (_workshop: Workshop) => {
        // ...
    };

    const handleShopNowClick = () => {
        navigate('/categories');
    };

    const handleStartRecommendation = () => {
        // ...
    };

    if (loading) return <Box>로딩중...</Box>;

    return (
        <Box>
            <HeroSection onShopNowClick={handleShopNowClick} />
            <ProductTabSection
                categories={contentCategories}
                productSets={productSets}
                onProductClick={handleProductClick}
            />
            <RecommendationSection onStartRecommendation={handleStartRecommendation} />
            <WorkshopSection
                workshops={popularWorkshops}
                onWorkshopClick={handleWorkshopClick}
            />
        </Box>
    );
};

export default HomePage;
