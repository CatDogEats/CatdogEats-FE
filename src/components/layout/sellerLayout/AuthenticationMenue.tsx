import { Box, Button, useTheme } from '@mui/material';
import { NotificationMenu, ProfileMenu } from '@/components/common'; // Assuming these are existing components
import { Notification } from '@/components/layout/sellerLayout/types/seller.types';


interface SellerAuthenticatedNavProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onAnnouncementClick: () => void;
    onFaqClick: () => void;
    onInquiryClick: () => void;
    onLogout: () => void;
    onProfileEdit: () => void;
    nameFromAuthStore: string | null;
}

export const SellerAuthenticatedNav = ({
                                           notifications,
                                           onNotificationClick,
                                           onAnnouncementClick,
                                           onFaqClick,
                                           onInquiryClick,
                                           onLogout,
                                           onProfileEdit,
                                           nameFromAuthStore,
                                       }: SellerAuthenticatedNavProps) => {
    const theme = useTheme();


    const getDisplayName = () => {
        if (nameFromAuthStore) return nameFromAuthStore;
        return '';
    };

    const userInfo = {
        name: getDisplayName(),
    };

    return (
        <>
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

            <NotificationMenu
                notifications={notifications}
                onNotificationClick={onNotificationClick}
            />

            <ProfileMenu
                userInfo={userInfo}
                onProfileEdit={onProfileEdit}
                onLogout={onLogout}
            />
        </>
    );
};