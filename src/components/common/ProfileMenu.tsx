import React, { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    Box,
    Typography,
    Divider,
    useTheme
} from '@mui/material';

export interface UserInfo {
    name: string;
    profileImage?: string;
}

interface ProfileMenuProps {
    userInfo: UserInfo;
    onProfileEdit?: () => void;
    onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
                                                     userInfo,
                                                     onProfileEdit,
                                                     onLogout
                                                 }) => {
    const theme = useTheme();
    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

    const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setProfileAnchor(event.currentTarget);
    };

    const handleProfileClose = () => {
        setProfileAnchor(null);
    };

    const handleMenuItemClick = async (callback?: () => void) => {
        handleProfileClose(); // 1. 메뉴 닫기 먼저

        if (callback) {
            callback(); // 3. 페이지 이동 등 후처리는 마지막에
        }
    };

    // 전체 이름을 반환하는 함수
    const getDisplayName = (name: string) => {
        return name.trim();
    };

    return (
        <>
            <IconButton onClick={handleProfileClick} sx={{ p: 0.5 ,  fontSize: '1rem'}}  >
                <span style={{ textDecoration: 'underline'}}>
                    {getDisplayName(userInfo.name)}
                  </span>                {/*</Avatar>*/}
            </IconButton>

            <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={handleProfileClose}
                PaperProps={{
                    sx: {
                        width: 200,
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary
                        }}
                    >
                        {userInfo.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.text.secondary
                        }}
                    >
                    </Typography>
                </Box>

                <MenuItem
                    onClick={() => handleMenuItemClick(onProfileEdit)}
                    sx={{
                        color: theme.palette.text.primary,
                        '&:hover': {
                            backgroundColor: theme.palette.grey[100]
                        }
                    }}
                >
                    <span className="material-icons" style={{ marginRight: '8px', fontSize: '18px' }}>
                        person
                    </span>
                    마이페이지
                </MenuItem>


                <Divider />

                <MenuItem
                    onClick={() => handleMenuItemClick(onLogout)}
                    sx={{
                        color: '#f56565',
                        '&:hover': {
                            backgroundColor: 'rgba(245, 101, 101, 0.1)'
                        }
                    }}
                >
                    <span className="material-icons" style={{ marginRight: '8px', fontSize: '18px' }}>
                        logout
                    </span>
                    로그아웃
                </MenuItem>
            </Menu>
        </>
    );
};

export default ProfileMenu;