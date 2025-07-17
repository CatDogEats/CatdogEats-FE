// src/hooks/useNotification.ts
import { useState, useCallback } from 'react';
import { NotificationState, NotificationType } from '@/components/common/NotificationSnackbar';

export interface UseNotificationReturn {
    notification: NotificationState;
    showNotification: (message: string, type?: NotificationType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    hideNotification: () => void;
}

export const useNotification = (): UseNotificationReturn => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        type: 'info',
        duration: 4000,
    });

    // 기본 알림 표시 함수
    const showNotification = useCallback((
        message: string,
        type: NotificationType = 'info',
        duration: number = 4000
    ) => {
        setNotification({
            open: true,
            message,
            type,
            duration,
        });
    }, []);

    // 성공 알림
    const showSuccess = useCallback((message: string, duration: number = 4000) => {
        showNotification(message, 'success', duration);
    }, [showNotification]);

    // 에러 알림
    const showError = useCallback((message: string, duration: number = 5000) => {
        showNotification(message, 'error', duration);
    }, [showNotification]);

    // 경고 알림
    const showWarning = useCallback((message: string, duration: number = 4000) => {
        showNotification(message, 'warning', duration);
    }, [showNotification]);

    // 정보 알림
    const showInfo = useCallback((message: string, duration: number = 4000) => {
        showNotification(message, 'info', duration);
    }, [showNotification]);

    // 알림 숨기기
    const hideNotification = useCallback(() => {
        setNotification(prev => ({
            ...prev,
            open: false,
        }));
    }, []);

    return {
        notification,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
    };
};