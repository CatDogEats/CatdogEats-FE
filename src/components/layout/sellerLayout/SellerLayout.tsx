import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    useTheme,
    useMediaQuery,
    IconButton,
    Typography
} from '@mui/material';
import SellerHeader from './SellerHeader'; // Updated import path
import { Notification, MenuItem } from '@/components/layout/sellerLayout/types/seller.types'; // Updated import path
import { useAuthStore } from '@/service/auth/AuthStore'; // Using AuthStore directly
import { SellerSidebarMenu } from './Sidebar';
import { SellerLoginRequiredMessage } from './LoginRequire';

// 더미 데이터 (추후 전역 상태 관리로 이동)


const mockNotifications: Notification[] = [
    {
        id: 'noti-001',
        title: '새로운 주문이 들어왔습니다',
        message: '닭가슴살 간식 1개 주문이 접수되었습니다.',
        timestamp: '5분 전',
        isRead: false,
        type: 'order'
    },
    {
        id: 'noti-002',
        title: '배송이 완료되었습니다',
        message: '주문번호 #12345의 배송이 완료되었습니다.',
        timestamp: '1시간 전',
        isRead: false,
        type: 'delivery'
    },
    {
        id: 'noti-003',
        title: '고객 문의가 도착했습니다',
        message: '상품에 대한 문의가 1건 도착했습니다.',
        timestamp: '2시간 전',
        isRead: false,
        type: 'inquiry'
    }
];

const DRAWER_WIDTH = 240;

const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: '대시보드',
        icon: 'analytics',
        path: '/seller'
    },
    {
        id: 'products',
        label: '상품관리',
        icon: 'inventory',
        path: '/seller/products'
    },
    {
        id: 'orders',
        label: '주문/배송',
        icon: 'local_shipping',
        path: '/seller/orders'
    },
    {
        id: 'settlement',
        label: '정산관리',
        icon: 'account_balance_wallet',
        path: '/seller/settlement'
    },
    {
        id: 'customers',
        label: '고객관리',
        icon: 'people',
        path: '/seller/customers'
    },
    {
        id: 'chat',
        label: '고객 문의',
        icon: 'chat',
        path: '/chat',
        newWindow: true
    },
    {
        id: 'info',
        label: '판매자 정보',
        icon: 'store',
        path: '/seller/info'
    }
];

const SellerLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { loading, isAuthenticated } = useAuthStore();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    const handleNotificationClick = (notification: Notification) => {
        console.log('알림 클릭:', notification);
    };

    const handleAnnouncementClick = () => {
        console.log('공지사항 클릭');
    };

    const handleFaqClick = () => {
        console.log('FAQ 클릭');
    };

    const handleInquiryClick = () => {
        console.log('1:1 문의 클릭');
    };


    const isActive = (path: string) => {
        if (location.pathname === path) return true;
        if (path !== '/seller' && location.pathname.startsWith(path + '/')) return true;
        return path === '/seller' && location.pathname === '/seller';

    };

    const getCurrentPageTitle = () => {
        const currentItem = menuItems.find(item => isActive(item.path));
        return currentItem?.label || '판매자 대시보드';
    };

    const handleMenuClick = (path: string, newWindow=false) => {
        if (newWindow) {
            window.open(
                "/chat",
                "ChatWindow",
                "width=500,height=700,resizable=yes,scrollbars=yes"
            )
            return;
        }

        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    if (!isAuthenticated) {
        return <SellerLoginRequiredMessage onLoginClick={() => navigate('/login')} />;
    }

    return (
        <Box sx={{
            height: '100vh',
            backgroundColor: theme.palette.background.default,
            overflow: 'hidden'
        }}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    zIndex: theme.zIndex.appBar
                }}
            >
                <SellerHeader
                    notifications={mockNotifications}
                    onNotificationClick={handleNotificationClick}
                    onAnnouncementClick={handleAnnouncementClick}
                    onFaqClick={handleFaqClick}
                    onInquiryClick={handleInquiryClick}
                />
            </Box>

            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        height: 48,
                        zIndex: theme.zIndex.appBar - 1,
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.grey[200]}`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: '100%' }}>
                        <IconButton
                            color="inherit"
                            aria-label="메뉴 열기"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ color: theme.palette.text.primary, mr: 2 }}
                        >
                            <span className="material-icons">menu</span>
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 600,
                                fontSize: '1rem'
                            }}
                        >
                            {getCurrentPageTitle()}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'fixed',
                    left: 0,
                    top: 64,
                    width: DRAWER_WIDTH,
                    height: 'calc(100vh - 64px)',
                    backgroundColor: '#f8f9fa',
                    borderRight: `1px solid ${theme.palette.grey[200]}`,
                    overflowY: 'auto',
                    zIndex: theme.zIndex.drawer
                }}
            >
                <SellerSidebarMenu
                    menuItems={menuItems}
                    isActive={isActive}
                    onMenuClick={(path: string, newWindow?: boolean) => handleMenuClick(path, newWindow)}
                />
            </Box>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        top: 112,
                        height: 'calc(100vh - 112px)',
                        backgroundColor: '#f8f9fa'
                    },
                }}
            >
                <SellerSidebarMenu
                    menuItems={menuItems}
                    isActive={isActive}
                    onMenuClick={handleMenuClick}
                />
            </Drawer>

            <Box
                component="main"
                sx={{
                    position: 'fixed',
                    top: { xs: 112, md: 64 },
                    left: { xs: 0, md: DRAWER_WIDTH },
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.palette.background.default,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default SellerLayout;
