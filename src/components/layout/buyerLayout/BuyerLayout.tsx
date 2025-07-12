import { Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import BuyerHeader from './BuyerHeader';
import BuyerFooter from './BuyerFooter';
import { useAuth } from '@/service/auth/AuthAPI';


const BuyerLayout = () => {
    const { user, loading, isAuthenticated, logout } = useAuth();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <BuyerHeader user={user} isAuthenticated={isAuthenticated} loading={loading} logout={logout} />
            <Box component="main" sx={{ flex: 1 }}>
                <Outlet />
            </Box>
            <BuyerFooter />
        </Box>
    );
};

export default BuyerLayout;
