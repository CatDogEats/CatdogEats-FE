// src/service/support/notice/noticeApi.ts

import axios from 'axios';
import {
    Notice,
    NoticeListResponse,
    NoticeListParams,
    APIResponse,
    FileDownloadResponse
} from '@/types/notice';

// 공지사항 전용 API 클라이언트 생성
const noticeApiClient = axios.create({
    baseURL: import.meta.env.MODE === 'development'
        ? '/api'
        : import.meta.env.VITE_API_PROXY_TARGET,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키 포함
});

// 응답 인터셉터 (에러 처리)
noticeApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * 공지사항 API 객체
 */
export const noticeApi = {

    // ========== 공지사항 목록 조회 ==========
    /**
     * 공지사항 목록을 조회합니다.
     * @param params 조회 파라미터 (page, size, search, sortBy)
     * @returns 공지사항 목록과 페이징 정보
     */
    getNotices: async (params: NoticeListParams = {}): Promise<NoticeListResponse> => {
        const {
            page = 0,
            size = 10,
            search,
            sortBy = 'latest'
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy
        });

        // search 파라미터가 있을 때만 추가
        if (search && search.trim()) {
            queryParams.append('search', search.trim());
        }

        const response = await noticeApiClient.get<APIResponse<NoticeListResponse>>(
            `/v1/notices?${queryParams.toString()}`
        );

        return response.data.data;
    },

    // ========== 공지사항 상세 조회 ==========
    /**
     * 특정 공지사항의 상세 정보를 조회합니다.
     * @param noticeId 공지사항 ID
     * @returns 공지사항 상세 정보
     */
    getNotice: async (noticeId: string): Promise<Notice> => {
        const response = await noticeApiClient.get<APIResponse<Notice>>(
            `/v1/notices/${noticeId}`
        );

        return response.data.data;
    },

    // ========== 첨부파일 다운로드 ==========
    /**
     * 공지사항 첨부파일을 다운로드합니다.
     * @param noticeId 공지사항 ID
     * @param fileId 파일 ID
     * @returns 파일 Blob과 메타데이터
     */
    downloadFile: async (noticeId: string, fileId: string): Promise<FileDownloadResponse> => {
        // 파일 다운로드는 별도 처리 (blob 응답)
        const response = await fetch(`/api/v1/notices/${noticeId}/files/${fileId}`, {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
        });

        if (!response.ok) {
            throw new Error(`파일 다운로드 실패: ${response.status}`);
        }

        // 헤더에서 파일 정보 추출
        const contentDisposition = response.headers.get('Content-Disposition');
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

        // 파일명 추출 (Content-Disposition: attachment; filename="파일명.pdf")
        let filename = 'download';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        const blob = await response.blob();

        return {
            blob,
            filename,
            contentType
        };
    },

    // ========== 파일 다운로드 헬퍼 함수 ==========
    /**
     * 브라우저에서 파일을 다운로드합니다.
     * @param noticeId 공지사항 ID
     * @param fileId 파일 ID
     * @param customFilename 사용자 지정 파일명 (선택사항)
     */
    downloadFileToDevice: async (
        noticeId: string,
        fileId: string,
        customFilename?: string
    ): Promise<void> => {
        try {
            const fileData = await noticeApi.downloadFile(noticeId, fileId);

            // Blob URL 생성
            const url = window.URL.createObjectURL(fileData.blob);

            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            link.href = url;
            link.download = customFilename || fileData.filename;
            document.body.appendChild(link);
            link.click();

            // 정리
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            throw error;
        }
    }
};