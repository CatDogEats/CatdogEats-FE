import { Box, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { MenuItem } from '@/components/layout/sellerLayout/types/seller.types';

interface SellerSidebarMenuProps {
    menuItems: MenuItem[];
    isActive: (path: string) => boolean;
    onMenuClick: (path: string, newWindow?: boolean) => void;
}

export const SellerSidebarMenu = ({ menuItems, isActive, onMenuClick }: SellerSidebarMenuProps) => {
    const theme = useTheme();

    return (
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
                            onClick={() => onMenuClick(item.path, item.newWindow)}
                            sx={{
                                py: 2,
                                px: 3,
                                cursor: 'pointer',
                                backgroundColor: active
                                    ? 'rgba(232, 152, 48, 0.1)'
                                    : 'transparent',
                                borderRight: active
                                    ? `3px solid ${theme.palette.primary.main}`
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
                                        fontWeight: active ? 600 : 400,
                                        color: active
                                            ? theme.palette.primary.main
                                            : theme.palette.text.primary,
                                        transition: 'all 0.2s ease'
                                    }
                                }}
                            />
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
};