import axios, {AxiosInstance} from 'axios';
import {useAuthStore} from './AuthStore.ts';
import {UserRole} from "@/components/Auth";

const createApiInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: import.meta.env.MODE === "development" ? "/api" : import.meta.env.VITE_API_PROXY_TARGET,

        timeout: 10000,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    })

    // 요청 인터셉터
    instance.interceptors.request.use(
        (config) => {
            return config
        },
        (error) => Promise.reject(error),
    )

    // 응답 인터셉터
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                const { clearAuth } = useAuthStore.getState()
                clearAuth()
                window.location.href = "/login"
            }
            return Promise.reject(error)
        },
    )

    return instance
}

export const apiClient = createApiInstance()

const API_SERVER_URL = import.meta.env.MODE === "development" ? "/api" : import.meta.env.VITE_API_PROXY_TARGET

export const authApi = {
    socialLogin: (provider: string) => {
        window.location.href = `${API_SERVER_URL}/oauth2/authorization/${provider}`
    },

    selectRole: async (role: UserRole) => {
        const response = await apiClient.post("/v1/auth/role", { role })

        // 역할 선택 후 스토어 업데이트
        const { setUserInfo } = useAuthStore.getState()
        const userData = response.data
        if (userData.name && userData.role) {
            setUserInfo(userData.name, userData.role)
        }

        return response.data
    },

    logout: async () => {
        console.log("로그아웃 요청")
        const response = await apiClient.post("/v1/auth/logout")

        // 로그아웃 후 스토어 클리어
        const { clearAuth } = useAuthStore.getState()
        clearAuth()

        return response.data
    },

    refreshToken: async () => {
        const response = await apiClient.post("/v1/auth/refresh")
        return response.data
    },

    check: async () => {
        try {
            console.log("AuthAPI: /v1/auth/me 요청 시작")
            const response = await apiClient.post("/v1/auth/me")
            console.log("AuthAPI: /v1/auth/me 응답:", response.data)

            // 사용자 정보가 있으면 Zustand 스토어 업데이트
            const userData = response.data
            if (userData && userData.name && userData.role) {
                const { setUserInfo, setAuth } = useAuthStore.getState()
                setUserInfo(userData.name, userData.role)
                setAuth(true)
                console.log("AuthAPI: 사용자 정보로 스토어 업데이트:", userData)
            }

            return response.data
        } catch (error) {
            console.error("AuthAPI: /v1/auth/me 요청 실패:", error)
            // 에러가 발생해도 기본 사용자 정보 반환
            console.log("AuthAPI: 기본 사용자 정보 반환")
            return {
                name: "사용자",
                role: " ",
                hasSelectedRole: true
            }
        }
    },
}

export interface User {
    name?: string
    role?: string
    hasSelectedRole: boolean
}

// useAuth 훅은 더 이상 사용하지 않음 (Zustand로 통합)
export const useAuth = () => {
    const { isAuthenticated, name, role, loading } = useAuthStore()

    return {
        user: isAuthenticated ? { name, role, hasSelectedRole: !!role } : null,
        loading,
        error: null,
        login: authApi.socialLogin,
        logout: async () => {
            const { logout } = useAuthStore.getState()
            await logout()
        },
        selectRole: authApi.selectRole,
        refreshToken: authApi.refreshToken,
        isAuthenticated,
    }
}
