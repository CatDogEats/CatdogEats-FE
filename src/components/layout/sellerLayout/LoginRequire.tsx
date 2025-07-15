import { Box, Typography, useTheme } from '@mui/material';

interface SellerLoginRequiredMessageProps {
    onLoginClick: () => void;
}

export const SellerLoginRequiredMessage = ({ onLoginClick }: SellerLoginRequiredMessageProps) => {
    const theme = useTheme();

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
                        onClick={onLoginClick}
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
};