// src/types/notice.ts

// ========== 기본 타입들 ==========

/**
 * 공지사항 첨부파일 정보
 */
export interface NoticeAttachment {
    fileId: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string; // "yyyy-MM-dd HH:mm:ss" 형태
}

/**
 * 개별 공지사항 정보
 */
export interface Notice {
    id: string;
    title: string;
    content: string;
    createdAt: string; // "yyyy-MM-dd HH:mm:ss" 형태
    updatedAt: string; // "yyyy-MM-dd HH:mm:ss" 형태
    viewCount: number;
    attachments: NoticeAttachment[];
}

/**
 * 공지사항 목록 조회 응답
 */
export interface NoticeListResponse {
    notices: Notice[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// ========== API 요청 파라미터들 ==========

/**
 * 공지사항 목록 조회 파라미터
 */
export interface NoticeListParams {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: 'latest' | 'oldest' | 'views';
}

// ========== 공통 API 응답 래퍼 ==========

/**
 * 필드 에러 정보
 */
export interface FieldError {
    field: string;
    rejectedValue: unknown;
    defaultMessage: string;
}

/**
 * 전역 API 응답 포맷
 */
export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string | null;
    errors: FieldError[] | null;
}

// ========== 파일 다운로드 관련 ==========

/**
 * 파일 다운로드 응답 (Blob 형태로 받음)
 */
export interface FileDownloadResponse {
    blob: Blob;
    filename: string;
    contentType: string;
}

// ========== 에러 처리 ==========

/**
 * API 에러 응답
 */
export interface APIError {
    success: false;
    message: string;
    timestamp: string;
    path: string | null;
    errors: FieldError[] | null;
}