import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Drawer,
    useTheme,
    useMediaQuery,
    IconButton,
    Typography
} from '@mui/material';
import SellerHeader from './SellerHeader.tsx';
import { SellerInfo, Notification } from '@/components/layout/sellerLayout/types/seller.types.ts';
import { useAuth } from '@/service/auth/AuthAPI';

// 더미 데이터 (추후 전역 상태 관리로 이동)
const mockSellerInfo: SellerInfo = {
    id: 'seller-001',
    name: '김판매',
    email: 'seller@catdogeats.com',
    shopName: '사랑가득 엄마손길',
    shopDescription: '유기농 재료로 만드는 건강 간식 전문',
    joinDate: '2023-01-15'
};

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

const SellerLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation(); // 현재 위치 감지
    const navigate = useNavigate(); // 네비게이션 함수
    const { loading, isAuthenticated, logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };


    if (loading) {
            return (
                  <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
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

    const handleLogout = async () => {
        try {
            await logout();
            console.log('로그아웃 완료');
            // 로그아웃 후 로그인 페이지로 이동할 수도 있음
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        }
    };

    const menuItems = [
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
            id: 'info',
            label: '판매자 정보',
            icon: 'store',
            path: '/seller/info'
        }
    ];

    // 현재 활성화된 메뉴 항목 확인
    const isActive = (path: string) => {
        // 정확한 경로 매칭
        if (location.pathname === path) return true;

        // 하위 경로도 고려 (예: /seller/products/add도 products 활성화)
        if (path !== '/seller' && location.pathname.startsWith(path + '/')) return true;

        // /seller 루트 경로는 dashboard로 처리
        if (path === '/seller/dashboard' && location.pathname === '/seller') return true;

        return false;
    };

    // 현재 페이지 제목 가져오기
    const getCurrentPageTitle = () => {
        const currentItem = menuItems.find(item => isActive(item.path));
        return currentItem?.label || '판매자 대시보드';
    };

    // 메뉴 클릭 핸들러
    const handleMenuClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    // 로그인되지 않은 상태에서는 로그인 페이지로 리다이렉트하거나 로그인 폼 표시
    if (!isAuthenticated) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default
            }}>
                <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.primary }}>
                        판매자 로그인이 필요합니다
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                        판매자 대시보드에 접근하려면 로그인하세요.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            로그인하기
                        </button>
                    </Box>
                </Box>
            </Box>
        );
    }

    const drawer = (
        <Box sx={{
            height: '100%',
            backgroundColor: '#f8f9fa',
            pt: 0
        }}>
            <List sx={{ p: 0 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);

                    return (
                        <ListItem
                            key={item.id}
                            onClick={() => handleMenuClick(item.path)}
                            sx={{
                                py: 2,
                                px: 3,
                                cursor: 'pointer',
                                // 활성 상태 스타일링
                                backgroundColor: active
                                    ? 'rgba(232, 152, 48, 0.1)' // 연한 오렌지 배경
                                    : 'transparent',
                                borderRight: active
                                    ? `3px solid ${theme.palette.primary.main}` // 오른쪽 테두리
                                    : 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: active
                                        ? 'rgba(232, 152, 48, 0.15)'
                                        : 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 40,
                                    color: active
                                        ? theme.palette.primary.main
                                        : theme.palette.text.secondary,
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                <span className="material-icons">
                                    {item.icon}
                                </span>
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontSize: '0.95rem',
                                        fontWeight: active ? 600 : 400, // 활성 시 굵게
                                        color: active
                                            ? theme.palette.primary.main
                                            : theme.palette.text.primary,
                                        transition: 'all 0.2s ease'
                                    }
                                }}
                            />

                            {/* 활성 상태 표시 점 (선택사항) */}
                            {active && (
                                <Box
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.primary.main,
                                        ml: 1
                                    }}
                                />
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{
            height: '100vh',
            backgroundColor: theme.palette.background.default,
            overflow: 'hidden'
        }}>
            {/* 헤더 - 고정 위치 */}
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
                    sellerInfo={mockSellerInfo}
                    notifications={mockNotifications}
                    onNotificationClick={handleNotificationClick}
                    onAnnouncementClick={handleAnnouncementClick}
                    onFaqClick={handleFaqClick}
                    onInquiryClick={handleInquiryClick}
                    onLogout={handleLogout}
                    isAuthenticated={isAuthenticated}
                />
            </Box>

            {/* 모바일 메뉴 버튼 */}
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
                            {getCurrentPageTitle()} {/* 동적으로 현재 페이지 제목 표시 */}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* 사이드바 - 데스크톱 */}
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
                {drawer}
            </Box>

            {/* 사이드바 - 모바일 */}
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
                {drawer}
            </Drawer>

            {/* 메인 콘텐츠 - Outlet 사용 */}
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