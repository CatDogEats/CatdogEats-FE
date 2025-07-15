import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from '@/theme';
import AppRouter from '@/routes/Router.tsx';
import '@/styles/globals.css';
import { AuthProvider } from './service/auth/AuthProvider';

function App() {
    return (
        <AuthProvider>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppRouter />
        </ThemeProvider>
        </AuthProvider>
    );
}

export default App;