// src/hooks/useAuthCheck.ts
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/service/auth/AuthStore';

export interface UseAuthCheckReturn {
    isAuthenticated: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    isTemp: boolean;
    checkAuthAndRedirect: () => boolean;
    requireAuth: (callback: () => void) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, role } = useAuthStore();

    // 역할별 상태 확인
    const isBuyer = role === 'ROLE_BUYER';
    const isSeller = role === 'ROLE_SELLER';
    const isTemp = role === 'ROLE_TEMP';

    // 인증 확인 및 리다이렉트
    const checkAuthAndRedirect = useCallback((): boolean => {
        if (!isAuthenticated) {
            console.log('🔒 인증되지 않은 사용자, 로그인 페이지로 이동');
            navigate('/login', {
                replace: true,
                state: { from: location }
            });
            return false;
        }

        if (isTemp) {
            console.log('🔑 임시 권한 사용자, 역할 선택 페이지로 이동');
            navigate('/role-selection', { replace: true });
            return false;
        }

        return true;
    }, [isAuthenticated, isTemp, navigate, location]);

    // 인증 필요한 작업 실행
    const requireAuth = useCallback((callback: () => void) => {
        if (checkAuthAndRedirect()) {
            callback();
        }
    }, [checkAuthAndRedirect]);

    return {
        isAuthenticated,
        isBuyer,
        isSeller,
        isTemp,
        checkAuthAndRedirect,
        requireAuth,
    };
};