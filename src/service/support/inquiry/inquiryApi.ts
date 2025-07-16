import { apiClient } from '@/service/auth/AuthAPI';
import {
    InquiryListResponseDTO,
    InquiryDetailResponseDTO,
    InquiryCreateRequestDTO,
    InquiryUserFollowupRequestDTO,
    InquiryUserCloseRequestDTO,
    InquiryResponseDTO,
    PageResponse,
    APIResponse,
    InquiryPageParams
} from '@/types/inquiry';

// ================================
// API 기본 경로
// ================================
const INQUIRY_BASE_URL = '/v1/users/inquiries';

// ================================
// 사용자 1:1 문의 API 함수들
// ================================

export const inquiryApi = {

    // ===========================
    // 1. 문의 목록 조회
    // ===========================
    async getInquiries(params: Partial<InquiryPageParams> = {}): Promise<PageResponse<InquiryListResponseDTO>> {
        const {
            page = 0,
            size = 10,
            sort = 'createdAt',
            direction = 'desc'
        } = params;

        const response = await apiClient.get<APIResponse<PageResponse<InquiryListResponseDTO>>>(
            INQUIRY_BASE_URL,
            {
                params: {
                    page,
                    size,
                    sort,
                    direction
                }
            }
        );

        return response.data.data;
    },

    // ===========================
    // 2. 문의 상세 조회
    // ===========================
    async getInquiryDetail(inquiryId: string): Promise<InquiryDetailResponseDTO> {
        const response = await apiClient.get<APIResponse<InquiryDetailResponseDTO>>(
            `${INQUIRY_BASE_URL}/${inquiryId}`
        );

        return response.data.data;
    },

    // ===========================
    // 3. 문의 등록 (파일 포함)
    // ===========================
    async createInquiry(inquiryData: InquiryCreateRequestDTO): Promise<InquiryResponseDTO> {
        const formData = new FormData();

        // 텍스트 데이터 추가
        formData.append('title', inquiryData.title);
        formData.append('content', inquiryData.content);
        formData.append('inquiryType', inquiryData.inquiryType);
        formData.append('inquiryReceiveMethod', inquiryData.inquiryReceiveMethod);

        // 주문 ID가 있는 경우에만 추가
        if (inquiryData.orderId && inquiryData.orderId.trim()) {
            formData.append('orderId', inquiryData.orderId.trim());
        }

        // 이미지 파일들 추가
        if (inquiryData.imageFiles && inquiryData.imageFiles.length > 0) {
            inquiryData.imageFiles.forEach((file) => {
                formData.append('imageFiles', file);
            });
        }

        const response = await apiClient.post<APIResponse<InquiryResponseDTO>>(
            INQUIRY_BASE_URL,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data;
    },

    // ===========================
    // 4. 답글 등록 (파일 포함)
    // ===========================
    async createFollowup(followupData: InquiryUserFollowupRequestDTO): Promise<InquiryResponseDTO> {
        const formData = new FormData();

        // 텍스트 데이터 추가
        formData.append('inquiryId', followupData.inquiryId);
        formData.append('content', followupData.content);

        // 이미지 파일들 추가
        if (followupData.imageFiles && followupData.imageFiles.length > 0) {
            followupData.imageFiles.forEach((file) => {
                formData.append('imageFiles', file);
            });
        }

        const response = await apiClient.post<APIResponse<InquiryResponseDTO>>(
            `${INQUIRY_BASE_URL}/followup`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data;
    },

    // ===========================
    // 5. 문의 종료
    // ===========================
    async closeInquiry(inquiryId: string): Promise<InquiryResponseDTO> {
        const closeData: InquiryUserCloseRequestDTO = { inquiryId };

        const response = await apiClient.patch<APIResponse<InquiryResponseDTO>>(
            `${INQUIRY_BASE_URL}/close`,
            closeData
        );

        return response.data.data;
    },

    // ===========================
    // 6. 파일 다운로드
    // ===========================
    async downloadFile(inquiryId: string, fileId: string): Promise<Blob> {
        const response = await apiClient.get(
            `${INQUIRY_BASE_URL}/${inquiryId}/files/${fileId}`,
            {
                responseType: 'blob', // 파일 다운로드를 위한 blob 타입
            }
        );

        return response.data;
    },

    // ===========================
    // 7. 파일 다운로드 URL 생성 (브라우저에서 직접 다운로드)
    // ===========================
    getFileDownloadUrl(inquiryId: string, fileId: string): string {
        const baseURL = apiClient.defaults.baseURL || '';
        return `${baseURL}${INQUIRY_BASE_URL}/${inquiryId}/files/${fileId}`;
    }
};

// ================================
// 파일 관련 유틸리티 함수들
// ================================

export const fileUtils = {

    // ===========================
    // 파일 크기 검증
    // ===========================
    validateFileSize(file: File, maxSizeMB: number = 5): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },

    // ===========================
    // 파일 타입 검증
    // ===========================
    validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): boolean {
        return allowedTypes.includes(file.type);
    },

    // ===========================
    // 파일 이름 정리
    // ===========================
    sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    },

    // ===========================
    // 파일 크기 포맷팅
    // ===========================
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // ===========================
    // 이미지 파일인지 확인
    // ===========================
    isImageFile(file: File): boolean {
        return file.type.startsWith('image/');
    },

    // ===========================
    // 파일 다운로드 처리
    // ===========================
    async downloadFileFromBlob(blob: Blob, fileName: string): Promise<void> {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

// ================================
// 에러 처리 유틸리티
// ================================

export const inquiryErrorHandler = {

    // ===========================
    // API 에러 메시지 변환
    // ===========================
    getErrorMessage(error: any): string {
        // 백엔드에서 온 에러 메시지 확인
        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        // HTTP 상태 코드별 메시지
        switch (error.response?.status) {
            case 400:
                return '입력한 정보를 다시 확인해주세요.';
            case 401:
                return '로그인이 필요합니다.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return '문의를 찾을 수 없습니다.';
            case 413:
                return '파일 크기가 너무 큽니다.';
            case 500:
                return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            default:
                return '알 수 없는 오류가 발생했습니다.';
        }
    },

    // ===========================
    // 파일 업로드 에러 처리
    // ===========================
    getFileUploadErrorMessage(error: any): string {
        if (error.message?.includes('file size')) {
            return '파일 크기는 5MB 이하여야 합니다.';
        }
        if (error.message?.includes('file type')) {
            return '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP만 가능)';
        }
        return this.getErrorMessage(error);
    }
};

// ================================
// 요청 데이터 변환 유틸리티
// ================================

export const inquiryDataTransformer = {

    // ===========================
    // 폼 데이터를 요청 DTO로 변환
    // ===========================
    transformCreateRequest(formData: any): InquiryCreateRequestDTO {
        return {
            title: formData.title?.trim() || '',
            content: formData.content?.trim() || '',
            inquiryType: formData.inquiryType,
            inquiryReceiveMethod: formData.inquiryReceiveMethod,
            orderId: formData.orderId?.trim() || null,
            imageFiles: formData.imageFiles || []
        };
    },

    // ===========================
    // 답글 폼 데이터를 요청 DTO로 변환
    // ===========================
    transformFollowupRequest(inquiryId: string, formData: any): InquiryUserFollowupRequestDTO {
        return {
            inquiryId,
            content: formData.content?.trim() || '',
            imageFiles: formData.imageFiles || []
        };
    }
};

// ================================
// 기본 내보내기
// ================================
export default inquiryApi;