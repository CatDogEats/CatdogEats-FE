"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/service/auth/AuthStore.ts"

export const useAuthInitialization = () => {
    const { initializeAuth, hasChecked, isInitializing } = useAuthStore()
    const hasRun = useRef(false)

    useEffect(() => {
        // 이미 실행했거나, 체크 완료했거나, 초기화 중이면 건너뛰기
        if (hasRun.current || hasChecked || isInitializing) {
            return
        }

        hasRun.current = true
        console.log("useAuthInitialization: 인증 초기화 시작")

        // 약간의 지연을 두어 다른 초기화 작업과 충돌 방지
        const timer = setTimeout(() => {
            initializeAuth()
        }, 100)

        return () => clearTimeout(timer)
    }, [initializeAuth, hasChecked, isInitializing])
}