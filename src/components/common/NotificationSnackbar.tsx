// src/components/common/NotificationSnackbar.tsx
import React from 'react';
import {
    Snackbar,
    Alert,
    AlertProps,
    Slide,
    SlideProps,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// 슬라이드 트랜지션 컴포넌트
function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
    open: boolean;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationSnackbarProps {
    notification: NotificationState;
    onClose: () => void;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
    notification,
    onClose,
}) => {
    const { open, message, type, duration = 4000 } = notification;

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        onClose();
    };

    // 타입별 색상 및 아이콘 설정
    const getAlertSeverity = (): AlertProps['severity'] => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={handleClose}
            TransitionComponent={SlideTransition}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
            }}
            sx={{
                '& .MuiSnackbarContent-root': {
                    padding: 0,
                },
            }}
        >
            <Alert
                onClose={handleClose}
                severity={getAlertSeverity()}
                variant="filled"
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                        sx={{
                            p: 0.5,
                            color: 'inherit',
                            opacity: 0.8,
                            '&:hover': {
                                opacity: 1,
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{
                    width: '100%',
                    minWidth: '300px',
                    maxWidth: '500px',
                    fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    '& .MuiAlert-icon': {
                        fontSize: '1.2rem',
                    },
                    '& .MuiAlert-message': {
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    // 타입별 커스텀 색상 (프로젝트 테마에 맞게)
                    ...(type === 'success' && {
                        backgroundColor: '#4caf50',
                        color: '#ffffff',
                        '& .MuiAlert-icon': {
                            color: '#ffffff',
                        },
                    }),
                    ...(type === 'error' && {
                        backgroundColor: '#f44336',
                        color: '#ffffff',
                        '& .MuiAlert-icon': {
                            color: '#ffffff',
                        },
                    }),
                    ...(type === 'warning' && {
                        backgroundColor: '#e8a530', // 프로젝트 primary 색상
                        color: '#ffffff',
                        '& .MuiAlert-icon': {
                            color: '#ffffff',
                        },
                    }),
                    ...(type === 'info' && {
                        backgroundColor: '#2196f3',
                        color: '#ffffff',
                        '& .MuiAlert-icon': {
                            color: '#ffffff',
                        },
                    }),
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationSnackbar;