// src/components/Home/components/ProductGrid.tsx

import { Grid } from '@mui/material';
import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types/Product';

interface ProductGridProps {
    products: Product[];
    onProductClick?: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
    return (
        <Grid container spacing={3}>
            {products.map((product) => (
                <Grid
                    key={product.productNumber}
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                        lg: 3
                    }}>
                    <ProductCard
                        product={product}
                        onClick={onProductClick}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductGrid;