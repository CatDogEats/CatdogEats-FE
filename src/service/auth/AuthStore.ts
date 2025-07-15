import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { authApi } from "@/service/auth/AuthAPI"
import type { UserRole } from "@/components/Auth"

interface AuthState {
    isAuthenticated: boolean
    name: string | null
    role: UserRole | null
    hasChecked: boolean
    loading: boolean
    isInitializing: boolean

    // Actions
    setAuth: (auth: boolean) => void
    setUserInfo: (name: string, role: UserRole) => void
    setRole: (role: UserRole) => void
    clearAuth: () => void
    setHasChecked: (checked: boolean) => void
    setLoading: (loading: boolean) => void
    setInitializing: (initializing: boolean) => void
    logout: () => Promise<void>

    // 통합된 인증 초기화
    initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            name: null,
            role: null,
            hasChecked: false,
            loading: false,
            isInitializing: false,

            setAuth: (auth) => {
                console.log("AuthStore: setAuth 호출:", auth)
                set({ isAuthenticated: auth })
            },

            setUserInfo: (name, role) => {
                console.log("AuthStore: setUserInfo 호출:", { name, role })
                set({
                    name,
                    role,
                    isAuthenticated: true,
                    hasChecked: true,
                })
            },
            setRole: (role) => {
                console.log("AuthStore, setRole 호출", { role})
                set({
                    role: role
                })
            },

            clearAuth: () => {
                console.log("AuthStore: clearAuth 호출")
                set({
                    isAuthenticated: false,
                    name: null,
                    role: null,
                    hasChecked: true,
                    loading: false,
                })
            },

            setHasChecked: (checked) => set({ hasChecked: checked }),

            setLoading: (loading) => set({ loading }),

            setInitializing: (initializing) => set({ isInitializing: initializing }),

            logout: async () => {
                set({ loading: true })
                try {
                    await authApi.logout()
                    set({
                        isAuthenticated: false,
                        name: null,
                        role: null,
                        hasChecked: true,
                        loading: false,
                    })
                    console.log("AuthStore: 로그아웃 성공, 상태 초기화")
                } catch (error) {
                    console.error("AuthStore: 로그아웃 실패:", error)
                    set({ loading: false })
                    throw error
                }
            },

            // 통합된 인증 초기화 (한 번만 실행)
            initializeAuth: async () => {
                const state = get()

                // 이미 초기화 중이거나 완료된 경우 건너뛰기
                if (state.isInitializing) {
                    console.log("AuthStore: 인증 초기화 건너뛰기 (이미 초기화 중)")
                    return
                }

                console.log("AuthStore: 인증 초기화 시작")
                set({ isInitializing: true, loading: true })

                try {
                    // 1. 쿠키 체크
                    console.log("AuthStore: /auth/check API 호출 중...")
                    const response = await fetch("/auth/check", {
                        credentials: "include",
                    })
                    console.log("AuthStore: /auth/check 응답 상태:", response.status)

                    if (!response.ok) {
                        console.log("AuthStore: 쿠키 체크 실패 (응답 OK 아님)")
                        set({
                            isAuthenticated: false,
                            name: null,
                            role: null,
                            hasChecked: true,
                            loading: false,
                            isInitializing: false,
                        })
                        return
                    }

                    const data = await response.json()
                    console.log("AuthStore: /auth/check 응답 데이터:", data)
                    const { authenticated } = data

                    if (!authenticated) {
                        console.log("AuthStore: 쿠키 인증 실패 (authenticated: false)")
                        set({
                            isAuthenticated: false,
                            name: null,
                            role: null,
                            hasChecked: true,
                            loading: false,
                            isInitializing: false,
                        })
                        return
                    }

                    // 2. 사용자 정보 가져오기
                    try {
                        console.log("AuthStore: 사용자 정보 가져오는 중 (authApi.check)...")
                        const userData = await authApi.check()
                        console.log("AuthStore: 가져온 사용자 정보:", userData)

                        if (userData && userData.name && userData.role) {
                            set({
                                name: userData.name,
                                role: userData.role,
                                isAuthenticated: true,
                                hasChecked: true,
                                loading: false,
                                isInitializing: false,
                            })
                            console.log("AuthStore: 인증 초기화 완료 및 사용자 정보 설정:", {
                                name: userData.name,
                                role: userData.role,
                            })

                            // 소셜 로그인 후 리다이렉트 처리
                            const savedRedirect = localStorage.getItem('loginRedirect');
                            if (savedRedirect) {
                                localStorage.removeItem('loginRedirect');
                                window.location.href = savedRedirect;
                            }
                            return
                        } else {
                            console.log("AuthStore: 사용자 정보 불완전 또는 없음")
                        }
                    } catch (error) {
                        console.error("AuthStore: 사용자 정보 가져오기 실패:", error)
                        // 사용자 정보 가져오기 실패해도 계속 진행 (쿠키는 있음)
                    }

                    // 사용자 정보를 가져오지 못했거나 불완전한 경우
                    // 쿠키가 있으면 인증된 것으로 간주하고, URL 경로에 따라 역할 결정
                    const path = window.location.pathname;
                    const role = path.startsWith('/seller') ? "ROLE_SELLER" : "ROLE_BUYER";

                    set({
                        isAuthenticated: true, // 쿠키가 있으므로 인증됨으로 설정
                        name: "사용자", // 기본 이름 설정
                        role: role, // URL 기반으로 역할 설정
                        hasChecked: true,
                        loading: false,
                        isInitializing: false,
                    })
                    console.log(`AuthStore: 사용자 정보 없지만 쿠키 있어 인증됨으로 설정, URL 기반으로 역할 설정: ${role}`)
                } catch (error) {
                    console.error("AuthStore: 인증 초기화 실패 (에러 발생):", error)
                    set({
                        isAuthenticated: false,
                        name: null,
                        role: null,
                        hasChecked: true,
                        loading: false,
                        isInitializing: false,
                    })
                }
            },
        }),
        {
            name: "auth-session",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                name: state.name,
                role: state.role,
                hasChecked: state.hasChecked,
            }),
        },
    ),
)
