import axios, {AxiosInstance} from 'axios';
// 인증 상태 관리를 위한 Custom Hook
import {useEffect, useState} from 'react';
import {useAuthStore} from './authStore';
import {UserRole} from "@/components/Auth";

const createApiInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: import.meta.env.MODE === 'development'
            ? '/api'
            : import.meta.env.VITE_API_PROXY_TARGET,

        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
        // 쿠키 기반 인증을 위한 설정
        withCredentials: true, // 쿠키를 포함하여 요청
    });

    // 요청 인터셉터
    instance.interceptors.request.use(
        (config) => {
            // 쿠키는 자동으로 포함되므로 별도의 헤더 설정 불필요
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // 인증 실패 시 로그인 페이지로 리다이렉트
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export const apiClient = createApiInstance();

const API_SERVER_URL = import.meta.env.MODE === 'development'
    ? '/api'
    : import.meta.env.VITE_API_PROXY_TARGET;

export const authApi = {
    socialLogin: (provider: string) => {
        window.location.href = `${API_SERVER_URL}/oauth2/authorization/${provider}`;
    },

    selectRole: async (role: UserRole) => {
        const response = await apiClient.post('/v1/auth/role', { role });
        return response.data;
    },

    logout: async () => {
        console.log("로그아웃 요청된")
        const response = await apiClient.post('/v1/auth/logout');
        return response.data;
    },

    refreshToken: async () => {
        const response = await apiClient.post('/v1/auth/refresh');
        return response.data;
    },
};

interface User {
    id: string;
    email: string;
    role?: string;
    hasSelectedRole: boolean;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 초기 로딩 시 사용자 정보 확인
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/auth/check');
            setUser(data);
            useAuthStore.getState().setAuth(true);
            setError(null);
        } catch (error: any) {
            setUser(null);
            useAuthStore.getState().setAuth(false);
            if (error.response?.status !== 401) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (provider: string) => {
        authApi.socialLogin(provider);
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
        }
    };

    const selectRole = async (role: UserRole) => {
        try {
            const result = await authApi.selectRole(role);
            setUser(prev => prev ? { ...prev, role, hasSelectedRole: true } : null);
            return result;
        } catch (error) {
            setError('역할 선택에 실패했습니다.');
            throw error;
        }
    };

    const refreshToken = async () => {
        try {
            const result = await authApi.refreshToken();
            setUser(prev => prev ? { ...prev, ...result.user } : null);
            return result;
        } catch (error) {
            setError("리프레시 토큰을 받아오는데 실패했습니다.")
            throw error;
        }
    };

    return {
        user,
        loading,
        error,
        login,
        logout,
        selectRole,
        checkAuthStatus,
        refreshToken,
        isAuthenticated: !!user,
    };
};