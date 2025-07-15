import type React from "react"
import { Outlet } from "react-router-dom"
import { Box, CircularProgress } from "@mui/material"
import BuyerHeader from "./BuyerHeader"
import BuyerFooter from "./BuyerFooter"
import { useAuthStore } from "@/service/auth/AuthStore.ts"

const BuyerLayout: React.FC = () => {
    const { loading, isInitializing } = useAuthStore()

    if (loading || isInitializing) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <BuyerHeader />
            <Box component="main" sx={{ flex: 1 }}>
                <Outlet />
            </Box>
            <BuyerFooter />
        </Box>
    )
}

export default BuyerLayout
