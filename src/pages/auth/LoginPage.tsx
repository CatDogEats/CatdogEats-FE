import { useState } from 'react';
import {
    LoginForm,
    LoginContainer
} from '@/components/Auth';
import { SocialProvider } from '@/components/Auth/types';
import { authApi } from '@/service/auth/AuthAPI.ts';

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialLogin =  async (provider: SocialProvider) => {
        setIsLoading(true);
        console.log(`${provider} 로그인 시도`);

        await authApi.socialLogin(provider);
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