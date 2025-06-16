// src/components/ProductList/types/product.types.ts

// 전역 타입을 사용하도록 변경 - export type 사용
export type {
  Product,
  ProductFilters,
  SortOption,
  PetType,
  ProductType,
  ProductCategory
} from '@/types/Product';

// 상수들은 export로 유지 (값이므로)
export {
  PET_TYPES,
  PRODUCT_TYPES,
  SORT_OPTIONS,
  ALLERGEN_OPTIONS
} from '@/types/Product';