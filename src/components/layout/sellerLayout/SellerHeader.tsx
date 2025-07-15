import { AppBar, Toolbar, Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/components/layout/sellerLayout/types/seller.types';
import { useAuthStore } from "@/service/auth/AuthStore.ts";
import { authApi } from "@/service/auth/AuthAPI";
import { SellerLogoAndBrand } from './Logo';
import { SellerAuthenticatedNav } from './AuthenticationMenue';
import { SellerUnauthenticatedButtons } from './UnAuthentication';
import { useCallback, useEffect }from 'react';

interface SellerHeaderProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onAnnouncementClick: () => void;
    onFaqClick: () => void;
    onInquiryClick: () => void;
    onProfileEdit?: () => void; // Make optional as it's handled internally
}

const SellerHeader = ({
                          notifications,
                          onNotificationClick,
                          onAnnouncementClick,
                          onFaqClick,
                          onInquiryClick,
                          onProfileEdit,
                      }: SellerHeaderProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { isAuthenticated, name, loading, clearAuth, setLoading } = useAuthStore();

    useEffect(() => {
        console.log("SellerHeader 상태:", { isAuthenticated, name, loading });
    }, [isAuthenticated, name, loading]);

    const handleProfileEdit = () => {
        navigate('/seller/info');
        if (onProfileEdit) {
            onProfileEdit();
        }
    };

    // 로그아웃 핸들러
    const handleLogout = useCallback(async () => {
        try {
            setLoading(true);
            await authApi.logout();
            clearAuth();
            navigate("/");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        } finally {
            setLoading(false);
        }
    }, [clearAuth, navigate, setLoading]);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSellerSignup = () => {
        navigate('/login'); // Assuming seller signup also goes to login page or a specific signup page
    };

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: theme.zIndex.appBar
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                <SellerLogoAndBrand onClick={() => navigate('/seller')} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isAuthenticated ? (
                        <SellerAuthenticatedNav
                            notifications={notifications}
                            onNotificationClick={onNotificationClick}
                            onAnnouncementClick={onAnnouncementClick}
                            onFaqClick={onFaqClick}
                            onInquiryClick={onInquiryClick}
                            onLogout={handleLogout}
                            onProfileEdit={handleProfileEdit}
                            nameFromAuthStore={name}
                        />
                    ) : (
                        <SellerUnauthenticatedButtons
                            onLogin={handleLogin}
                            onSellerSignup={handleSellerSignup}
                        />
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default SellerHeader;
