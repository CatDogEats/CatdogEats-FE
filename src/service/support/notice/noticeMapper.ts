import { Notice } from '@/types/notice';

// 기존 프론트엔드에서 사용하는 Announcement 타입 (AnnouncementsTab.tsx에서 가져옴)
export interface Announcement {
    id: string;
    category: string;
    categoryColor: string;
    textColor: string;
    title: string;
    content: string;
    date: string;
    views: number;
    importance: "일반" | "중요" | "긴급";
    attachments?: {
        name: string;
        url: string;
    }[];
}

/**
 * 백엔드 Notice 타입을 프론트엔드 Announcement 타입으로 변환
 */
export const convertNoticeToAnnouncement = (notice: Notice): Announcement => {
    return {
        id: notice.id, // string → number 변환
        category: "일반", // 백엔드에 카테고리가 없으므로 기본값
        categoryColor: "#e0e0e0", // 기본 회색
        textColor: "#575757", // 기본 텍스트 색상
        title: notice.title,
        content: notice.content,
        date: formatDate(notice.createdAt), // "yyyy-MM-dd HH:mm:ss" → "yyyy-MM-dd" 변환
        views: notice.viewCount,
        importance: "일반", // 백엔드에 중요도가 없으므로 기본값
        attachments: notice.attachments?.map(file => ({
            name: file.fileName,
            url: file.fileUrl
        })) || []
    };
};

/**
 * 백엔드 Notice 배열을 프론트엔드 Announcement 배열로 변환
 */
export const convertNoticesToAnnouncements = (notices: Notice[]): Announcement[] => {
    return notices.map(convertNoticeToAnnouncement);
};

/**
 * 날짜 형식 변환: "yyyy-MM-dd HH:mm:ss" → "yyyy-MM-dd"
 */
const formatDate = (dateTime: string): string => {
    try {
        // "2024-01-15 14:30:25" → "2024-01-15"
        return dateTime.split(' ')[0];
    } catch (error) {
        console.warn('날짜 형식 변환 실패:', dateTime);
        return dateTime;
    }
};

// ========== 향후 확장 가능한 매핑 함수들 ==========

/**
 * 중요도 매핑 (나중에 백엔드에서 중요도 필드 추가 시 사용)
 */
export const mapImportance = (backendImportance?: string): "일반" | "중요" | "긴급" => {
    switch (backendImportance?.toLowerCase()) {
        case 'urgent':
        case '긴급':
            return '긴급';
        case 'important':
        case '중요':
            return '중요';
        default:
            return '일반';
    }
};

/**
 * 카테고리별 색상 매핑 (나중에 백엔드에서 카테고리 필드 추가 시 사용)
 */
export const mapCategoryStyle = (category?: string) => {
    switch (category?.toLowerCase()) {
        case 'product':
        case '제품':
            return { categoryColor: "#ffe5c7", textColor: "#8a5318" };
        case 'subscription':
        case '정기배송':
            return { categoryColor: "#c7eaff", textColor: "#185f8a" };
        case 'delivery':
        case '배송':
            return { categoryColor: "#d1f7c4", textColor: "#2a7e14" };
        case 'account':
        case '계정':
            return { categoryColor: "#f7c4f6", textColor: "#7e147d" };
        default:
            return { categoryColor: "#e0e0e0", textColor: "#575757" };
    }
};