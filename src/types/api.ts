export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    code?: string;
}

export enum ResponseCode {
    // 성공 응답
    SUCCESS = 'SUCCESS',
    CREATED = 'CREATED',

    // 장바구니 관련
    CART_SUCCESS = 'CART_SUCCESS',
    CART_ITEM_ADDED = 'CART_ITEM_ADDED',
    CART_ITEM_UPDATED = 'CART_ITEM_UPDATED',
    CART_ITEM_REMOVED = 'CART_ITEM_REMOVED',
    CART_CLEARED = 'CART_CLEARED',

    // 에러 응답
    INVALID_INPUT_VALUE = 'INVALID_INPUT_VALUE',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN'
}

// 페이지네이션 관련 타입
export interface Pageable {
    page: number;
    size: number;
    sort?: string[];
}

export interface PageResponse<T> {
    content: T[];
    pageable: Pageable;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
}