"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/service/auth/AuthStore.ts"
import { authApi } from "@/service/auth/AuthAPI"

export const useAuthSync = () => {
    const { isAuthenticated, setAuth, setUserInfo, clearAuth, hasChecked } = useAuthStore()

    useEffect(() => {
        const syncAuthState = async () => {
            console.log("useAuthSync: 인증 상태 동기화 시작")
            try {
                // 쿠키 확인
                const response = await fetch("/auth/check", {
                    credentials: "include",
                })

                console.log("useAuthSync: /auth/check 응답 상태:", response.status)

                if (!response.ok) {
                    console.log("useAuthSync: 쿠키 체크 실패 (응답 OK 아님)")
                    if (isAuthenticated) {
                        clearAuth()
                    }
                    return
                }

                const data = await response.json()
                console.log("useAuthSync: /auth/check 응답 데이터:", data)
                const authenticated = data.isAuthenticated
                console.log(authenticated, "로그 나오는가")
                if (!authenticated && isAuthenticated) {
                    // 쿠키는 없지만 스토어에 정보가 있는 경우
                    console.log("useAuthSync: 쿠키 없음, 스토어 정보 초기화")
                    clearAuth()
                    return
                }

                if (authenticated && !isAuthenticated) {
                    // 쿠키는 있지만 스토어에 정보가 없는 경우
                    console.log("useAuthSync: 쿠키 있음, 사용자 정보 요청")
                    try {
                        const userData = await authApi.check()
                        console.log("useAuthSync: 사용자 정보 응답:", userData)
                        if (userData && userData.data.name && userData.data.role) {
                            setUserInfo(userData.data.name, userData.data.role)
                            setAuth(true)
                            console.log("useAuthSync: 인증 상태 동기화 완료:", userData)
                        } else {
                            // 사용자 정보가 불완전하거나 없는 경우, URL 경로에 따라 역할 결정
                            const path = window.location.pathname;
                            const role = path.startsWith('/seller') ? "ROLE_SELLER" : "ROLE_BUYER";
                            setUserInfo("사용자", role)
                            console.log(`useAuthSync: 사용자 정보 불완전, URL 기반으로 역할 설정: ${role}`)
                        }
                    } catch (error) {
                        console.error("useAuthSync: 사용자 정보 동기화 실패:", error)
                        // 에러가 발생해도 URL 경로에 따라 역할 결정
                        const path = window.location.pathname;
                        const role = path.startsWith('/seller') ? "ROLE_SELLER" : "ROLE_BUYER";
                        setUserInfo("사용자", role)
                        console.log(`useAuthSync: 사용자 정보 요청 실패, URL 기반으로 역할 설정: ${role}`)
                    }
                }
            } catch (error) {
                console.error("useAuthSync: 인증 상태 동기화 에러:", error)
            }
        }

        // 이미 인증 체크가 완료된 경우에만 동기화 실행
        if (hasChecked) {
            syncAuthState()
        }
    }, [isAuthenticated, setUserInfo, clearAuth, hasChecked])
}
