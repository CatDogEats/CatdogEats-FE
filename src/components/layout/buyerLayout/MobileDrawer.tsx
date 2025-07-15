"use client"

import type React from "react"
import { Box, Typography, Drawer, List, ListItem, ListItemText, Divider, Button, CircularProgress } from "@mui/material"
import { useNavigate } from "react-router-dom"

interface NavigationItem {
    label: string
    path?: string
    action?: () => void
    subItems?: any[]
}

interface MobileDrawerProps {
    mobileOpen: boolean
    onClose: () => void
    navigationItems: NavigationItem[]
    isAuthenticated: boolean
    loading: boolean
    onNavigationClick: (item: NavigationItem) => void
    onLogout: () => void
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
                                                       mobileOpen,
                                                       onClose,
                                                       navigationItems,
                                                       isAuthenticated,
                                                       loading,
                                                       onNavigationClick,
                                                       onLogout,
                                                   }) => {
    const navigate = useNavigate()

    const drawer = (
        <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                    CatDogEats
                </Typography>
            </Box>
            <Divider />
            <List>
                {navigationItems.map((item) => (
                    <ListItem
                        key={item.label}
                        onClick={() => onNavigationClick(item)}
                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.100" } }}
                    >
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                {!isAuthenticated ? (
                    <>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 1 }}
                            onClick={() => {
                                navigate("/login")
                                onClose()
                            }}
                        >
                            로그인
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                navigate("/login")
                                onClose()
                            }}
                        >
                            회원가입
                        </Button>
                    </>
                ) : (
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                            onLogout()
                            onClose()
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "로그아웃"}
                    </Button>
                )}
            </Box>
        </Box>
    )

    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={onClose}
            ModalProps={{
                keepMounted: true,
            }}
        >
            {drawer}
        </Drawer>
    )
}

export default MobileDrawer
