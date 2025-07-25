// src/data/index.ts

// Product 관련 데이터 (통합됨)
export {
    mockProducts,
    newProducts,
    bestSellerProducts,
    discountProducts,
    allergicFreeProducts,
    dentalCareProducts,
    popularProducts,
    getProductsByCategory,
    getProductsByPetType,
    getTotalProductCount
} from './products';

// Category 관련 데이터 (통합됨)
export {
    productCategories,
    contentCategories
} from './categories';

// Workshop 관련 데이터 (통합됨)
export {
    popularWorkshops
} from './workshops';

// Account 관련 데이터 (기존 유지)
export {
    savedPets,
    savedAddresses,
    mockCoupons,
    mockOrders,
    mockReturnOrders,
    extendedMockOrders,
    orderItems,
    mockWrittenReviews
} from './mock-data';

// 판매자 관련 데이터 (기존 유지)
// export {
//     customerInquiries,
//     customerChat,
//     productReviews
// } from './customerData';

export {
    sellerProductsData
} from './seller-products.data';

export {
    sellersData
} from './sellers.data';