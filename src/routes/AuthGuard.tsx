import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiClient } from "@/service/auth/AuthAPI";

const AuthGuard = () => {
    const [auth, setAuth] = useState<null | boolean>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await apiClient.get("/auth/check");
                setAuth(data.authenticated);
            } catch {
                setAuth(false);
            }
        };
        checkAuth();
    }, []);

    if (auth === null) return <div>로딩 중...</div>;
    if (!auth) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default AuthGuard;
