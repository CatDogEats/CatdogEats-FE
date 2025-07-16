import { Button, useTheme } from '@mui/material';

interface SellerUnauthenticatedButtonsProps {
    onLogin: () => void;
    onSellerSignup: () => void;
}

export const SellerUnauthenticatedButtons = ({ onLogin, onSellerSignup }: SellerUnauthenticatedButtonsProps) => {
    const theme = useTheme();

    return (
        <>
            <Button
                variant="text"
                onClick={onLogin}
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
                onClick={onSellerSignup}
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
    );
};