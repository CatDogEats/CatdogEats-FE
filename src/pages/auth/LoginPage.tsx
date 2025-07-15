import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LoginForm,
    LoginContainer
} from '@/components/Auth';
import { SocialProvider } from '@/components/Auth/types';
import { authApi } from '@/service/auth/AuthAPI.ts';
import { useAuthStore } from '@/service/auth/AuthStore.ts';

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, role, initializeAuth } = useAuthStore();

    // 이미 로그인된 경우 리다이렉트
    useEffect(() => {
        if (isAuthenticated && role) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, role, navigate, location]);

    // 소셜 로그인 후 돌아왔을 때 상태 업데이트
    useEffect(() => {
        const handleLoginCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const isCallback = urlParams.get('callback') === 'true';

            if (isCallback) {
                console.log('소셜 로그인 콜백 감지, 인증 상태 업데이트');
                try {
                    await initializeAuth();
                    // URL에서 callback 파라미터 제거
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error('로그인 콜백 처리 실패:', error);
                }
            }
        };

        handleLoginCallback();
    }, [initializeAuth]);

    const handleSocialLogin = async (provider: SocialProvider) => {
        setIsLoading(true);
        console.log(`${provider} 로그인 시도`);

        try {
            // 현재 위치를 localStorage에 저장 (소셜 로그인 후 돌아올 위치)
            const from = location.state?.from?.pathname || '/';
            localStorage.setItem('loginRedirect', from);

            await authApi.socialLogin(provider);
        } catch (error) {
            console.error('소셜 로그인 실패:', error);
            setIsLoading(false);
        }
    };

    return (
        <LoginContainer>
            <LoginForm
                onSocialLogin={handleSocialLogin}
                loading={isLoading}
            />
        </LoginContainer>
    );
};

export default LoginPage;