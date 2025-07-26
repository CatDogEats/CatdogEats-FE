"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Button,
    useMediaQuery,
    useTheme,
    Badge, // 이 부분 추가
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Menu as MenuIcon, ShoppingCart as ShoppingCartIcon, MoreVert as MoreVertIcon } from "@mui/icons-material"
import { useAuthStore } from "@/service/auth/AuthStore"
import { authApi } from "@/service/auth/AuthAPI"
import DropdownMenu from "./DropdownMenu"
import SearchBar from "./SearchBar"
import MobileDrawer from "./MobileDrawer"
import ProfileMenu from "@/components/common/ProfileMenu"

interface Notification {
    id: string
    type: "order" | "delivery" | "inquiry"
    title: string
    message: string
    timestamp: string
    isRead: boolean
}

const BuyerHeader = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

    // Zustand 스토어에서 인증 상태 가져오기
    const { isAuthenticated, name, role, loading, clearAuth, setLoading } = useAuthStore()

    useEffect(() => {
        console.log("BuyerHeader 상태:", { isAuthenticated, name, role, loading })
    }, [isAuthenticated, name, role, loading])


    // 로컬 상태
    const [mobileOpen, setMobileOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // 임시 알림 데이터
    const [notifications] = useState<Notification[]>([
        {
            id: "1",
            type: "order",
            title: "주문이 접수되었습니다",
            message: "주문번호 #12345가 정상적으로 접수되었습니다.",
            timestamp: "2분 전",
            isRead: false,
        },
        {
            id: "2",
            type: "delivery",
            title: "배송이 시작되었습니다",
            message: "주문하신 상품이 배송을 시작했습니다.",
            timestamp: "1시간 전",
            isRead: false,
        },
        {
            id: "3",
            type: "inquiry",
            title: "문의 답변이 등록되었습니다",
            message: "상품 문의에 대한 답변이 등록되었습니다.",
            timestamp: "3시간 전",
            isRead: true,
        },
    ])


    // 로그아웃 핸들러
    const handleLogout = useCallback(async () => {
        try {
            setLoading(true)
            await authApi.logout()
            clearAuth()
            navigate("/")
        } catch (error) {
            console.error("로그아웃 실패:", error)
        } finally {
            setLoading(false)
        }
    }, [clearAuth, navigate, setLoading])

    // 검색 핸들러
    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()
            if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                setSearchQuery("")
            }
        },
        [searchQuery, navigate],
    )

    // ChatModal 핸들러
    const handleChatModalOpen = useCallback(() => {
        const chatWindow = window.open(
            "/chat", // 또는 채팅용 라우트
            "ChatWindow",
            "width=500,height=700,resizable=yes,scrollbars=yes"
        )
        if (chatWindow) {
            chatWindow.focus()
        }
    }, [])


    // 네비게이션 아이템
    const navigationItems = [
        {label: "베스트 상품", path: "/bestProducts"},
        {label: "특가 상품", path: "/specialProducts"},
        {
            label: "카테고리",
            path: "/productsList",
            subItems: [
                {
                    label: "강아지 간식",
                    path: "/productsList/dog",
                    subItems: [
                        { label: "수제품", path: "/productsList/dog/handmade" },
                        { label: "완제품", path: "/productsList/dog/finished" },
                    ],
                },
                {
                    label: "고양이 간식",
                    path: "/productsList/cat",
                    subItems: [
                        { label: "수제품", path: "/productsList/cat/handmade" },
                        { label: "완제품", path: "/productsList/cat/finished" },
                    ],
                },
            ],
        },
        { label: "판매자와 1:1채팅", action: handleChatModalOpen },
        { label: "고객센터", path: "/support" },
    ]

    // 드로어 토글
    const handleDrawerToggle = useCallback(() => {
        setMobileOpen(!mobileOpen)
    }, [mobileOpen])

    // 메뉴 토글
    const handleMenuToggle = useCallback(() => {
        setMenuOpen(!menuOpen)
        setHoveredCategory(null)
        setHoveredSubCategory(null)
    }, [menuOpen])

    // 프로필 메뉴 핸들러들
    const handleProfileEdit = useCallback(() => {
        navigate("/account")
    }, [navigate])

    // 네비게이션 아이템 클릭 핸들러
    const handleNavigationClick = useCallback(
        (item: any) => {
            if (item.action) {
                item.action()
            } else if (item.path) {
                navigate(item.path)
                setMobileOpen(false)
            }
        },
        [navigate],
    )

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: "white",
                    color: "text.primary",
                    boxShadow: "none",
                    borderBottom: "1px solid",
                    borderBottomColor: "grey.200",
                }}
            >
                <Toolbar
                    sx={{
                        justifyContent: "space-between",
                        py: { xs: 1, sm: 1.5 },
                        minHeight: "64px !important",
                        position: "relative",
                    }}
                >
                    {/* 왼쪽 영역: 햄버거 메뉴 + 로고 */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            onClick={handleMenuToggle}
                            size="small"
                            sx={{
                                color: "text.secondary",
                                mr: 2,
                                "&:hover": {
                                    color: "primary.main",
                                    backgroundColor: "grey.50",
                                },
                            }}
                        >
                            <MenuIcon fontSize="small" />
                        </IconButton>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#e89830",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mr: 1.5,
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate("/")}
                            >

                            </Box>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    fontWeight: 700,
                                    color: "text.primary",
                                    cursor: "pointer",
                                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                }}
                                onClick={() => navigate("/")}
                            >
                                CatDogEats
                            </Typography>
                        </Box>
                    </Box>

                    {/* 드롭다운 메뉴 */}
                    {!isMobile && (
                        <DropdownMenu
                            navigationItems={navigationItems}
                            menuOpen={menuOpen}
                            hoveredCategory={hoveredCategory}
                            hoveredSubCategory={hoveredSubCategory}
                            setHoveredCategory={setHoveredCategory}
                            setHoveredSubCategory={setHoveredSubCategory}
                            setMenuOpen={setMenuOpen}
                            onNavigationClick={handleNavigationClick}
                        />
                    )}


                    {/* 우측 영역: 검색창 및 메뉴 */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                        {/* 검색창 */}
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                            isSmall={isSmall}
                        />

                        {/* 로그인 상태에 따른 우측 버튼 영역 */}
                        {isAuthenticated ? (
                            <>
                                {/* 로그인된 경우: 알림 + 프로필 */}
                                <IconButton
                                    size="small"
                                    sx={{
                                        color: "text.secondary",
                                        "&:hover": {
                                            color: "primary.main",
                                            backgroundColor: "grey.50",
                                        },
                                    }}
                                >
                                    <Badge badgeContent={notifications.filter((n) => !n.isRead).length} color="error">
                    <span className="material-icons" style={{ fontSize: "20px" }}>
                      notifications
                    </span>
                                    </Badge>
                                </IconButton>

                                <ProfileMenu
                                    userInfo={{ name: name || "사용자" }}
                                    onProfileEdit={handleProfileEdit}
                                    onLogout={handleLogout}
                                />
                            </>

                        ) : (
                            <>
                                {/* 로그인하지 않은 경우: 로그인/회원가입 버튼 (데스크톱) */}
                                {!isMobile && (
                                    <>
                                        <Button
                                            variant="text"
                                            onClick={() => navigate("/login")}
                                            sx={{
                                                fontSize: "0.875rem",
                                                fontWeight: 400,
                                                color: "text.secondary",
                                                textTransform: "none",
                                                minWidth: "auto",
                                                px: 2,
                                                "&:hover": {
                                                    color: "text.primary",
                                                    backgroundColor: "transparent",
                                                },
                                            }}
                                        >
                                            로그인
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate("/login")}
                                            sx={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                backgroundColor: "#e89830",
                                                color: "white",
                                                textTransform: "none",
                                                borderRadius: "20px",
                                                px: 3,
                                                py: 1,
                                                "&:hover": {
                                                    backgroundColor: "#d18224",
                                                },
                                            }}
                                        >
                                            회원가입
                                        </Button>
                                    </>
                                )}
                            </>
                        )}

                        {/* 장바구니 아이콘 */}
                        <IconButton
                            size="small"
                            onClick={() => navigate("/cart")}
                            sx={{
                                color: "text.secondary",
                                "&:hover": {
                                    color: "primary.main",
                                    backgroundColor: "grey.50",
                                },
                            }}
                        >
                            <ShoppingCartIcon fontSize="small" />
                        </IconButton>

                        {/* 모바일 드로어 메뉴 버튼 */}
                        {isMobile && (
                            <IconButton
                                onClick={handleDrawerToggle}
                                size="small"
                                sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                        color: "primary.main",
                                        backgroundColor: "grey.50",
                                    },
                                }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 모바일 드로어 */}
            <MobileDrawer
                mobileOpen={mobileOpen}
                onClose={handleDrawerToggle}
                navigationItems={navigationItems}
                isAuthenticated={isAuthenticated}
                loading={loading}
                onNavigationClick={handleNavigationClick}
                onLogout={handleLogout}
            />

        </>
    )
}

export default BuyerHeader