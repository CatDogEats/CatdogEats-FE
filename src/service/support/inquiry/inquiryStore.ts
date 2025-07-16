import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    InquiryListResponseDTO,
    InquiryDetailResponseDTO,
    InquiryCreateRequestDTO,
    InquiryUserFollowupRequestDTO,
    InquiryResponseDTO,
    InquiryPageParams,
    InquiryListState,
    InquiryDetailState,
    InquiryFormState,
    FileUploadProgress,
    InquiryStatus
} from '@/types/inquiry';
import { inquiryApi, inquiryErrorHandler } from './inquiryApi';

// ================================
// 문의 목록 상태 관리
// ================================

interface InquiryListStore extends InquiryListState {
    // Actions
    fetchInquiries: (params?: Partial<InquiryPageParams>) => Promise<void>;
    refreshInquiries: () => Promise<void>;
    clearInquiries: () => void;

    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    // Utils
    getInquiry: (inquiryId: string) => InquiryListResponseDTO | undefined;
}

export const useInquiryListStore = create<InquiryListStore>()(
    devtools(
        (set, get) => ({
            // Initial State
            inquiries: [],
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            loading: false,
            error: null,

            // ===========================
            // Actions
            // ===========================

            fetchInquiries: async (params = {}) => {
                const currentParams = {
                    page: get().currentPage,
                    size: 10,
                    ...params
                };

                set({ loading: true, error: null });

                try {
                    const response = await inquiryApi.getInquiries(currentParams);

                    set({
                        inquiries: response.content,
                        totalElements: response.totalElements,
                        totalPages: response.totalPages,
                        currentPage: response.number,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    const errorMessage = inquiryErrorHandler.getErrorMessage(error);
                    set({
                        loading: false,
                        error: errorMessage,
                        inquiries: [],
                        totalElements: 0,
                        totalPages: 0
                    });
                    console.error('문의 목록 조회 실패:', error);
                }
            },

            refreshInquiries: async () => {
                await get().fetchInquiries({ page: get().currentPage });
            },

            clearInquiries: () => {
                set({
                    inquiries: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    loading: false,
                    error: null
                });
            },

            // ===========================
            // Pagination
            // ===========================

            setPage: (page: number) => {
                set({ currentPage: page });
                get().fetchInquiries({ page });
            },

            setPageSize: (size: number) => {
                set({ currentPage: 0 });
                get().fetchInquiries({ page: 0, size });
            },

            // ===========================
            // Utils
            // ===========================

            getInquiry: (inquiryId: string) => {
                return get().inquiries.find(inquiry => inquiry.inquiryId === inquiryId);
            }
        }),
        { name: 'inquiry-list-store' }
    )
);

// ================================
// 문의 상세 상태 관리 (수정된 버전)
// ================================

interface InquiryDetailStore extends InquiryDetailState {
    // Actions
    fetchInquiryDetail: (inquiryId: string) => Promise<void>;
    clearInquiryDetail: () => void;

    // Reply Management
    addReply: (reply: InquiryResponseDTO) => void;

    // Status Updates
    updateInquiryStatus: (status: InquiryStatus) => void;  // ✅ 수정
}

export const useInquiryDetailStore = create<InquiryDetailStore>()(
    devtools(
        (set, get) => ({
            // Initial State
            inquiry: null as InquiryDetailResponseDTO | null,  // ✅ 추가
            loading: false,
            error: null,

            // ===========================
            // Actions
            // ===========================

            fetchInquiryDetail: async (inquiryId: string) => {
                set({ loading: true, error: null });

                try {
                    const inquiry: InquiryDetailResponseDTO = await inquiryApi.getInquiryDetail(inquiryId);  // ✅ 수정

                    set({
                        inquiry,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    const errorMessage = inquiryErrorHandler.getErrorMessage(error);
                    set({
                        loading: false,
                        error: errorMessage,
                        inquiry: null
                    });
                    console.error('문의 상세 조회 실패:', error);
                }
            },

            clearInquiryDetail: () => {
                set({
                    inquiry: null,
                    loading: false,
                    error: null
                });
            },

            // ===========================
            // Reply Management
            // ===========================

            addReply: (reply: InquiryResponseDTO) => {
                const currentInquiry = get().inquiry;
                if (currentInquiry) {
                    // 실제로는 새로고침이 필요할 수 있지만,
                    // 여기서는 간단히 상태 업데이트 표시
                    set({
                        inquiry: {
                            ...currentInquiry,
                            totalMessages: currentInquiry.totalMessages + 1,
                            lastUpdatedAt: reply.timestamp
                        }
                    });
                }
            },

            // ===========================
            // Status Updates
            // ===========================

            updateInquiryStatus: (status: InquiryStatus) => {  // ✅ 수정
                const currentInquiry = get().inquiry;
                if (currentInquiry) {
                    set({
                        inquiry: {
                            ...currentInquiry,
                            inquiryStatus: status  // ✅ 수정 (as any 제거)
                        }
                    });
                }
            }
        }),
        { name: 'inquiry-detail-store' }
    )
);

// ================================
// 문의 작성 폼 상태 관리
// ================================

interface InquiryFormStore extends InquiryFormState {
    // Actions
    createInquiry: (inquiryData: InquiryCreateRequestDTO) => Promise<InquiryResponseDTO | null>;
    createFollowup: (followupData: InquiryUserFollowupRequestDTO) => Promise<InquiryResponseDTO | null>;
    closeInquiry: (inquiryId: string) => Promise<InquiryResponseDTO | null>;

    // Form State Management
    setLoading: (loading: boolean) => void;
    setSuccess: (success: boolean) => void;
    setError: (error: string | null) => void;
    resetFormState: () => void;

    // File Upload Progress
    fileUploadProgress: FileUploadProgress[];
    setFileUploadProgress: (progress: FileUploadProgress[]) => void;
    updateFileProgress: (fileId: string, progress: Partial<FileUploadProgress>) => void;
}

export const useInquiryFormStore = create<InquiryFormStore>()(
    devtools(
        (set, get) => ({
            // Initial State
            loading: false,
            success: false,
            error: null,
            fileUploadProgress: [],

            // ===========================
            // Actions
            // ===========================

            createInquiry: async (inquiryData: InquiryCreateRequestDTO) => {
                set({ loading: true, error: null, success: false });

                try {
                    const response = await inquiryApi.createInquiry(inquiryData);

                    set({
                        loading: false,
                        success: true,
                        error: null
                    });

                    // 문의 목록 새로고침 (다른 스토어 연동)
                    useInquiryListStore.getState().refreshInquiries();

                    return response;
                } catch (error) {
                    const errorMessage = inquiryErrorHandler.getFileUploadErrorMessage(error);
                    set({
                        loading: false,
                        success: false,
                        error: errorMessage
                    });
                    console.error('문의 생성 실패:', error);
                    return null;
                }
            },

            createFollowup: async (followupData: InquiryUserFollowupRequestDTO) => {
                set({ loading: true, error: null, success: false });

                try {
                    const response = await inquiryApi.createFollowup(followupData);

                    set({
                        loading: false,
                        success: true,
                        error: null
                    });

                    // 문의 상세 새로고침
                    useInquiryDetailStore.getState().fetchInquiryDetail(followupData.inquiryId);

                    // 문의 목록도 새로고침
                    useInquiryListStore.getState().refreshInquiries();

                    return response;
                } catch (error) {
                    const errorMessage = inquiryErrorHandler.getFileUploadErrorMessage(error);
                    set({
                        loading: false,
                        success: false,
                        error: errorMessage
                    });
                    console.error('답글 생성 실패:', error);
                    return null;
                }
            },

            closeInquiry: async (inquiryId: string) => {
                set({ loading: true, error: null, success: false });

                try {
                    const response = await inquiryApi.closeInquiry(inquiryId);

                    set({
                        loading: false,
                        success: true,
                        error: null
                    });

                    // 관련 스토어들 새로고침
                    useInquiryDetailStore.getState().updateInquiryStatus(InquiryStatus.CLOSED);  // ✅ 수정된 부분
                    useInquiryListStore.getState().refreshInquiries();

                    return response;
                } catch (error) {
                    const errorMessage = inquiryErrorHandler.getErrorMessage(error);
                    set({
                        loading: false,
                        success: false,
                        error: errorMessage
                    });
                    console.error('문의 종료 실패:', error);
                    return null;
                }
            },

            // ===========================
            // Form State Management
            // ===========================

            setLoading: (loading: boolean) => {
                set({ loading });
            },

            setSuccess: (success: boolean) => {
                set({ success });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            resetFormState: () => {
                set({
                    loading: false,
                    success: false,
                    error: null,
                    fileUploadProgress: []
                });
            },

            // ===========================
            // File Upload Progress
            // ===========================

            setFileUploadProgress: (progress: FileUploadProgress[]) => {
                set({ fileUploadProgress: progress });
            },

            updateFileProgress: (fileId: string, progress: Partial<FileUploadProgress>) => {
                const currentProgress = get().fileUploadProgress;
                const updatedProgress = currentProgress.map(item =>
                    item.fileId === fileId ? { ...item, ...progress } : item
                );
                set({ fileUploadProgress: updatedProgress });
            }
        }),
        { name: 'inquiry-form-store' }
    )
);

// ================================
// 파일 다운로드 상태 관리
// ================================

interface FileDownloadStore {
    downloadingFiles: Set<string>;
    downloadFile: (inquiryId: string, fileId: string, fileName: string) => Promise<void>;
    isDownloading: (fileId: string) => boolean;
}

export const useFileDownloadStore = create<FileDownloadStore>()(
    devtools(
        (set, get) => ({
            downloadingFiles: new Set(),

            downloadFile: async (inquiryId: string, fileId: string, fileName: string) => {
                const { downloadingFiles } = get();

                if (downloadingFiles.has(fileId)) {
                    return; // 이미 다운로드 중
                }

                // 다운로드 시작
                set({
                    downloadingFiles: new Set([...downloadingFiles, fileId])
                });

                try {
                    const blob = await inquiryApi.downloadFile(inquiryId, fileId);

                    // 파일 다운로드 처리
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                } catch (error) {
                    console.error('파일 다운로드 실패:', error);
                    alert('파일 다운로드에 실패했습니다.');
                } finally {
                    // 다운로드 완료
                    const newDownloadingFiles = new Set(get().downloadingFiles);
                    newDownloadingFiles.delete(fileId);
                    set({ downloadingFiles: newDownloadingFiles });
                }
            },

            isDownloading: (fileId: string) => {
                return get().downloadingFiles.has(fileId);
            }
        }),
        { name: 'file-download-store' }
    )
);

// ================================
// 통합 훅 (선택적 사용)
// ================================

export const useInquiry = () => {
    const listStore = useInquiryListStore();
    const detailStore = useInquiryDetailStore();
    const formStore = useInquiryFormStore();
    const fileStore = useFileDownloadStore();

    return {
        // List
        inquiries: listStore.inquiries,
        totalElements: listStore.totalElements,
        totalPages: listStore.totalPages,
        currentPage: listStore.currentPage,
        listLoading: listStore.loading,
        listError: listStore.error,
        fetchInquiries: listStore.fetchInquiries,
        refreshInquiries: listStore.refreshInquiries,
        setPage: listStore.setPage,

        // Detail
        inquiry: detailStore.inquiry,
        detailLoading: detailStore.loading,
        detailError: detailStore.error,
        fetchInquiryDetail: detailStore.fetchInquiryDetail,
        clearInquiryDetail: detailStore.clearInquiryDetail,

        // Form
        formLoading: formStore.loading,
        formSuccess: formStore.success,
        formError: formStore.error,
        createInquiry: formStore.createInquiry,
        createFollowup: formStore.createFollowup,
        closeInquiry: formStore.closeInquiry,
        resetFormState: formStore.resetFormState,

        // File Download
        downloadFile: fileStore.downloadFile,
        isDownloading: fileStore.isDownloading
    };
};