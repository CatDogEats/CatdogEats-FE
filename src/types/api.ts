// src/types/api.ts

/**
 * 백엔드 API 공통 응답 형식
 * ResponseCode.java의 구조에 맞춘 타입 정의
 */
export interface APIResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

/**
 * API 에러 응답 타입
 */
export interface APIError {
    success: false;
    message: string;
    error?: string;
    status?: number;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

/**
 * 백엔드 API 엔드포인트 응답 코드
 */
export enum ResponseCode {
    // 성공
    SUCCESS = 'SUCCESS',
    CREATED = 'CREATED',

    // 장바구니 관련
    CART_SUCCESS = 'CART_SUCCESS',
    CART_ITEM_ADDED = 'CART_ITEM_ADDED',
    CART_ITEM_UPDATED = 'CART_ITEM_UPDATED',
    CART_ITEM_REMOVED = 'CART_ITEM_REMOVED',
    CART_CLEARED = 'CART_CLEARED',
    CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',

    // 에러
    INVALID_INPUT_VALUE = 'INVALID_INPUT_VALUE',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    ACCESS_DENIED = 'ACCESS_DENIED',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * HTTP 상태 코드
 */
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}