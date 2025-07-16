// ================================
// Enum 타입들 (백엔드 enum과 일치)
// ================================

export enum InquiryStatus {
    PENDING = 'PENDING',           // 답변 대기
    ANSWERED = 'ANSWERED',         // 답변 완료
    FOLLOWUP = 'FOLLOWUP',         // 추가 문의
    CLOSED = 'CLOSED',             // 종료 (사용자)
    FORCE_CLOSED = 'FORCE_CLOSED'  // 강제 종료 (관리자)
}

export enum InquiryType {
    PRODUCT = 'PRODUCT',     // 상품 문의
    ORDER = 'ORDER',         // 주문 문의
    PAYMENT = 'PAYMENT',     // 결제 문의
    DELIVERY = 'DELIVERY',   // 배송 문의
    RETURN = 'RETURN',       // 반품/교환 문의
    ACCOUNT = 'ACCOUNT',     // 계정 문의
    ETC = 'ETC'             // 기타 문의
}

export enum InquiryUrgentLevel {
    LOW = 'LOW',           // 낮음
    NORMAL = 'NORMAL',     // 보통
    HIGH = 'HIGH',         // 높음
    URGENT = 'URGENT'      // 긴급
}

export enum InquiryReceiveMethod {
    WEB = 'WEB',          // 문의내역 (디폴트)
    CALL = 'CALL',        // 전화
    SMS = 'SMS',          // 문자메시지
    NONE = 'NONE'         // 답변 불필요
}

export enum InquiryMessageType {
    QUESTION = 'QUESTION',           // 사용자 질문
    ANSWER = 'ANSWER',               // 관리자 답변
    USER_FOLLOWUP = 'USER_FOLLOWUP', // 사용자 추가 문의
    ADMIN_FOLLOWUP = 'ADMIN_FOLLOWUP' // 관리자 추가 답변
}

// ================================
// 기본 인터페이스들
// ================================

export interface InquiryAttachmentDTO {
    fileId: string;
    originalFileName: string;
    fileSize: number;
    uploadedAt: string; // ISO date string
}

export interface InquiryMessageDTO {
    messageId: string;
    content: string;
    messageType: string;         // 백엔드에서 displayName 문자열로 전달
    authorType: 'USER' | 'ADMIN';
    createdAt: string;
    attachments: InquiryAttachmentDTO[];
}

// ================================
// 응답 DTO들 (백엔드 Response)
// ================================

export interface InquiryListResponseDTO {
    inquiryId: string;
    inquiryNumber: string | null;     // 관리자용 (#001, #002, ...)
    title: string;
    contentPreview: string | null;    // content → contentPreview
    inquiryType: string;              // enum → string (백엔드에서 displayName 전달)
    inquiryStatus: string;            // enum → string (백엔드에서 displayName 전달)
    inquiryUrgentLevel: string | null; // enum → string | null
    createdAt: string;                // ISO date string
    userName: string | null;          // 관리자는 이름, 유저는 null
    hasReply: boolean;                // hasAttachment → hasReply
}

export interface InquiryDetailResponseDTO {
    inquiryId: string;
    title: string;
    content: string;
    inquiryType: string | null;           // ✅ enum → string | null
    inquiryStatus: string;                // ✅ enum → string
    inquiryReceiveMethod: string | null;  // ✅ enum → string | null
    urgentLevel: string | null;           // ✅ enum → string | null
    createdAt: string;
    updatedAt: string | null;             // ✅ 추가

    // 사용자 정보
    userName: string | null;              // ✅ null 허용

    // 주문 정보 (실제 응답과 일치)
    orderInfo: {                          // ✅ 구조 변경
        orderId: string;
        orderNumber: string;
        orderDate: string;
    } | null;

    // 메시지 스레드
    messages: InquiryMessageDTO[];

    // 첨부파일들
    attachments: InquiryAttachmentDTO[];

    // ✅ 백엔드에 없는 필드들 제거
    // totalMessages: number;    ← 제거
    // lastUpdatedAt: string;    ← 제거
}

export interface InquiryResponseDTO {
    inquiryId: string;
    message: string;
    timestamp: string; // ISO date string
}

// ================================
// 요청 DTO들 (백엔드 Request)
// ================================

export interface InquiryCreateRequestDTO {
    title: string;
    content: string;
    inquiryType: InquiryType;
    inquiryReceiveMethod: InquiryReceiveMethod;
    orderId?: string | null;
    imageFiles?: File[]; // 프론트엔드에서 File 객체 사용
}

export interface InquiryUserFollowupRequestDTO {
    inquiryId: string;
    content: string;
    imageFiles?: File[];
}

export interface InquiryUserCloseRequestDTO {
    inquiryId: string;
}

// ================================
// 프론트엔드 전용 인터페이스들
// ================================

export interface InquiryFormData {
    title: string;
    content: string;
    inquiryType: InquiryType;
    inquiryReceiveMethod: InquiryReceiveMethod;
    orderId: string;
    imageFiles: File[];
}

export interface InquiryReplyFormData {
    content: string;
    imageFiles: File[];
}

// 페이징 관련
export interface InquiryPageParams {
    page: number;
    size: number;
    sort: string;
    direction: 'asc' | 'desc';
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// API 응답 래퍼 (실제 백엔드 응답과 일치)
export interface APIResponse<T> {
    success: boolean;        // ✅ code → success로 변경
    message: string;
    data: T;
    timestamp: string;
    path?: string | null;    // ✅ 추가
    errors?: any[] | null;   // ✅ 추가
}

// ================================
// 상태 관리용 인터페이스들
// ================================

export interface InquiryListState {
    inquiries: InquiryListResponseDTO[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
}

export interface InquiryDetailState {
    inquiry: InquiryDetailResponseDTO | null;
    loading: boolean;
    error: string | null;
}

export interface InquiryFormState {
    loading: boolean;
    success: boolean;
    error: string | null;
}

// ================================
// 유틸리티 타입들
// ================================

export interface InquiryStatusDisplay {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    variant: 'filled' | 'outlined' | 'text';
}

export interface InquiryTypeDisplay {
    label: string;
    icon: string;
}

export interface InquiryUrgentLevelDisplay {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    priority: number;
}

// ================================
// 폼 검증용 인터페이스들
// ================================

export interface InquiryFormErrors {
    title?: string;
    content?: string;
    inquiryType?: string;
    inquiryReceiveMethod?: string;
    orderId?: string;
    imageFiles?: string;
}

export interface InquiryReplyFormErrors {
    content?: string;
    imageFiles?: string;
}

// ================================
// 파일 업로드 관련
// ================================

export interface FileUploadProgress {
    fileId: string;
    fileName: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export interface FileValidation {
    maxSize: number; // bytes
    allowedTypes: string[];
    maxFiles: number;
}

// ================================
// 필터링/검색 관련 (확장 가능)
// ================================

export interface InquiryFilter {
    status?: InquiryStatus[];
    type?: InquiryType[];
    urgentLevel?: InquiryUrgentLevel[];
    dateRange?: {
        startDate: string;
        endDate: string;
    };
    keyword?: string;
}