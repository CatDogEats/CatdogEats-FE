import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SellerHeaderProps } from '@/components/layout/sellerLayout/types/seller.types.ts';
import { NotificationMenu, ProfileMenu } from '@/components/common';

// SellerHeaderProps 인터페이스를 확장하여 isLoggedIn 추가
interface ExtendedSellerHeaderProps extends SellerHeaderProps {
    isLoggedIn?: boolean;
}

const SellerHeader = ({
                          sellerInfo,
                          notifications,
                          onNotificationClick,
                          onAnnouncementClick,
                          onFaqClick,
                          onInquiryClick,
                          onProfileEdit,
                          onLogout,
                          isLoggedIn = true
                      }: ExtendedSellerHeaderProps) => {
    const theme = useTheme();
    const navigate = useNavigate();

    // 마이페이지로 이동하는 함수
    const handleProfileEdit = () => {
        navigate('/seller/info');
        // 기존 onProfileEdit 콜백이 있다면 함께 실행
        if (onProfileEdit) {
            onProfileEdit();
        }
    };

    // 로그인 핸들러
    const handleLogin = () => {
        navigate('/login');
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
                {/* 로고 및 브랜드 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/seller')}
                    >
                        <span className="material-icons" style={{ color: 'white', fontSize: '20px' }}>
                            pets
                        </span>
                    </Box>
                    <Box>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                cursor: 'pointer',
                                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                lineHeight: 1
                            }}
                            onClick={() => navigate('/seller')}
                        >
                            CatDogEats
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem'
                            }}
                        >
                            판매자 대시보드
                        </Typography>
                    </Box>
                </Box>

                {/* 우측 메뉴 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isLoggedIn ? (
                        <>
                            {/* 로그인된 상태: 네비게이션 메뉴 + 알림 + 프로필 */}
                            <Box sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                gap: 0.5,
                                mr: 2
                            }}>
                                <Button
                                    color="inherit"
                                    startIcon={<span className="material-icons">campaign</span>}
                                    onClick={onAnnouncementClick}
                                    sx={{
                                        textTransform: 'none',
                                        color: theme.palette.text.secondary,
                                        fontWeight: 400,
                                        fontSize: '0.875rem',
                                        minWidth: 'auto',
                                        px: 1,
                                        '&:hover': {
                                            color: theme.palette.text.primary,
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    공지사항
                                </Button>

                                <Button
                                    color="inherit"
                                    startIcon={<span className="material-icons">help</span>}
                                    onClick={onFaqClick}
                                    sx={{
                                        textTransform: 'none',
                                        color: theme.palette.text.secondary,
                                        fontWeight: 400,
                                        fontSize: '0.875rem',
                                        minWidth: 'auto',
                                        px: 1,
                                        '&:hover': {
                                            color: theme.palette.text.primary,
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    FAQ
                                </Button>

                                <Button
                                    color="inherit"
                                    startIcon={<span className="material-icons">support_agent</span>}
                                    onClick={onInquiryClick}
                                    sx={{
                                        textTransform: 'none',
                                        color: theme.palette.text.secondary,
                                        fontWeight: 400,
                                        fontSize: '0.875rem',
                                        minWidth: 'auto',
                                        px: 1,
                                        '&:hover': {
                                            color: theme.palette.text.primary,
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    1:1 문의
                                </Button>
                            </Box>

                            {/* 알림 메뉴 */}
                            <NotificationMenu
                                notifications={notifications}
                                onNotificationClick={onNotificationClick}
                            />

                            {/* 프로필 메뉴 */}
                            <ProfileMenu
                                userInfo={sellerInfo}
                                onProfileEdit={handleProfileEdit}
                                onLogout={onLogout}
                            />
                        </>
                    ) : (
                        <>
                            {/* 로그인되지 않은 상태: 로그인 버튼 */}
                            <Button
                                variant="text"
                                onClick={handleLogin}
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    color: theme.palette.text.secondary,
                                    textTransform: 'none',
                                    minWidth: 'auto',
                                    px: 2,
                                    '&:hover': {
                                        color: theme.palette.text.primary,
                                        backgroundColor: 'transparent',
                                    }
                                }}
                            >
                                로그인
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleLogin}
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: '20px',
                                    px: 3,
                                    py: 1,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    }
                                }}
                            >
                                판매자 가입
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default SellerHeader;