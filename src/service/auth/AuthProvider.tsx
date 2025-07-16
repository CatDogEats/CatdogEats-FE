import type { ReactNode } from "react"
import { useAuthInitialization } from "@/service/auth/AuthInitialization"
import { useAuthSync } from "@/service/auth/UseAuthSync"

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // 인증 초기화 및 동기화 훅 사용
    useAuthInitialization()
    useAuthSync()

    return <>{children}</>
}
