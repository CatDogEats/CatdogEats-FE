import { Box, Typography, useTheme } from '@mui/material';

interface SellerLogoAndBrandProps {
    onClick: () => void;
}

export const SellerLogoAndBrand = ({ onClick }: SellerLogoAndBrandProps) => {
    const theme = useTheme();

    return (
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
                onClick={onClick}
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
                    onClick={onClick}
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
    );
};