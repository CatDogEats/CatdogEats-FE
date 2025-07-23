"use client"

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Box, CircularProgress } from "@mui/material"

import { useAuthStore } from "@/service/auth/AuthStore.ts"

interface AuthGuardProps {
    allowedRoles: string | string[]
}

const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
    const location = useLocation()
    const { isAuthenticated, role, hasChecked, loading, isInitializing, initializeAuth } = useAuthStore()
    const [localLoading, setLocalLoading] = useState(true)

    useEffect( () => {
        const checkAuth = async () => {
            // 아직 초기화되지 않았다면 초기화 실행
            if (!hasChecked && !isInitializing) {
                console.log("AuthGuard: 인증 초기화 필요")
                await initializeAuth() // initializeAuth가 완료될 때까지 기다림
            }
            setLocalLoading(false) // initializeAuth 완료 후 localLoading 해제
        }

        checkAuth()
    }, [hasChecked, isInitializing, initializeAuth])

    // 로딩 중이면 로딩 표시
    if (loading || isInitializing || localLoading || !hasChecked) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px",
                }}
            >
                <CircularProgress />
            </Box>
        )
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = isAuthenticated ? role ?? "" : "GUEST";

    // 인증되지 않았으면 로그인 페이지로
    if (!isAuthenticated && !roles.includes("GUEST")) {
        console.log("AuthGuard: 인증되지 않음, 로그인 페이지로 이동")
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (userRole === 'ROLE_TEMP') {
        console.log("권한 부여 페이지로 이동")
        return <Navigate to="/role-selection"></Navigate>
    }

    // 권한이 없으면 로그인 페이지로


    if (!roles.includes(userRole)) {
        switch (userRole) {
            case "ROLE_BUYER":
            case "GUEST":
                return <Navigate to="/" replace />;
            case "ROLE_SELLER":
                return <Navigate to="/seller" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }





    console.log("AuthGuard: 인증 및 권한 확인 완료")
    return <Outlet />
}

export default AuthGuard
