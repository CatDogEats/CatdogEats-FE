"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Snackbar
} from "@mui/material"
import {
    LocalOffer,
    AccessTime,
    CheckCircle
} from "@mui/icons-material"
import CouponCard from "./CouponCard"
import Pagination from "../common/Pagination"
import type { CouponCategory } from "./index"
import {
    buyerCouponApi,
    couponUtils,
    type Coupon,
    type BuyerCouponListResponse,
} from "@/service/coupons/couponApi"
const CouponsView: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<CouponCategory>("all")
    const [couponCode, setCouponCode] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [couponCounts, setCouponCounts] = useState({
        available: 0,
        expiring: 0,
        usedExpired: 0,
        total: 0
    })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [alert, setAlert] = useState<{
        show: boolean
        message: string
        type: 'success' | 'error' | 'info'
    }>({ show: false, message: '', type: 'info' })

    const itemsPerPage = 6

    // API에서 쿠폰 데이터 로드
    const loadCoupons = async (category: CouponCategory = activeCategory, page: number = 0) => {
        try {
            setLoading(true)
            const filter = couponUtils.getFilterFromCategory(category)
            const response: BuyerCouponListResponse = await buyerCouponApi.getBuyerCoupons(filter, page)

            // 응답 구조 확인 및 안전한 접근
            if (response && response.selected && Array.isArray(response.selected)) {
                // 쿠폰 데이터 변환
                const transformedCoupons = response.selected.map(couponUtils.transformBuyerCoupon)
                setCoupons(transformedCoupons)
            } else {
                console.warn('Invalid response structure:', response)
                setCoupons([])
            }

            // 전체 카운트 정보가 필요한 경우 별도 API 호출
            await loadCouponCounts()

        } catch (error: any) {
            console.error('쿠폰 로드 실패:', error)
            setCoupons([]) // 에러 시 빈 배열로 설정
            showAlert('쿠폰 정보를 불러오는데 실패했습니다.', 'error')
        } finally {
            setLoading(false)
        }
    }

    // 각 카테고리별 쿠폰 개수 로드
    const loadCouponCounts = async () => {
        try {
            // 전체 쿠폰과 상세 카운트 정보를 한 번에 가져오기
            const [allResponse, detailResponse] = await Promise.all([
                buyerCouponApi.getBuyerCoupons('ALL', 0),
                buyerCouponApi.getBuyerCoupons('AVAILABLE', 0) // count 정보를 위해 하나만 호출
            ])

            // 백엔드에서 availableCount와 expiringSoonCount를 제공
            const countInfo = detailResponse?.count || { availableCount: 0, expiringSoonCount: 0 }

            // 전체 쿠폰에서 사용 완료/만료된 쿠폰 계산
            const allCoupons = allResponse?.selected || []
            const totalCount = allCoupons.length
            const usedExpiredCount = totalCount - countInfo.availableCount - countInfo.expiringSoonCount

            setCouponCounts({
                total: totalCount,
                available: countInfo.availableCount,
                expiring: countInfo.expiringSoonCount,
                usedExpired: Math.max(0, usedExpiredCount) // 음수 방지
            })
        } catch (error) {
            console.error('쿠폰 카운트 로드 실패:', error)
            // 에러 시 기본값 설정
            setCouponCounts({
                total: 0,
                available: 0,
                expiring: 0,
                usedExpired: 0
            })
        }
    }

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadCoupons('all', 0)
    }, [])

    // 카테고리 변경 시 데이터 다시 로드
    useEffect(() => {
        if (!loading) {
            loadCoupons(activeCategory, 0)
            setCurrentPage(1)
        }
    }, [activeCategory])

    const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
        setAlert({ show: true, message, type })
    }

    const handleCloseAlert = () => {
        setAlert({ ...alert, show: false })
    }

    const filteredCoupons = useMemo(() => {
        // API에서 이미 필터링된 데이터를 받으므로 그대로 사용
        return coupons
    }, [coupons])

    const paginatedCoupons = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredCoupons.slice(startIndex, endIndex)
    }, [filteredCoupons, currentPage])

    const handleCategoryChange = (_: React.SyntheticEvent, newValue: CouponCategory) => {
        setActiveCategory(newValue)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleCouponCodeSubmit = async () => {
        if (!couponCode.trim()) {
            showAlert('쿠폰 코드를 입력해주세요.', 'error')
            return
        }

        try {
            setSubmitting(true)
            await buyerCouponApi.createBuyerCoupon({ code: couponCode.trim() })

            showAlert('쿠폰이 성공적으로 등록되었습니다.', 'success')
            setCouponCode("")

            // 쿠폰 목록 새로고침
            await loadCoupons(activeCategory, 0)

        } catch (error: any) {
            console.error('쿠폰 등록 실패:', error)

            if (error.response?.status === 409) {
                showAlert('이미 보유한 쿠폰입니다.', 'error')
            } else if (error.response?.status === 400) {
                showAlert('쿠폰 정보를 찾을 수 없습니다. 코드를 확인해주세요.', 'error')
            } else {
                showAlert('쿠폰 등록에 실패했습니다. 다시 시도해주세요.', 'error')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleUseCoupon = (couponId: string) => {
        console.log("쿠폰 사용:", couponId)
        // 여기에 쿠폰 사용 로직 구현 (주문 페이지로 이동 등)
    }

    if (loading && coupons.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={4}>
                나의 쿠폰함
            </Typography>

            {/* 쿠폰 현황 카드 */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card style={{ height: "100%" }}>
                        <CardContent style={{ textAlign: "center", paddingTop: 32, paddingBottom: 32 }}>
                            <CheckCircle style={{ fontSize: 48, color: "#4CAF50", marginBottom: 16 }} />
                            <Typography variant="h6" mb={1}>
                                사용가능한 쿠폰
                            </Typography>
                            <Typography variant="h2" fontWeight={700} style={{ color: "#4CAF50" }}>
                                {couponCounts.available}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                개
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card style={{ height: "100%" }}>
                        <CardContent style={{ textAlign: "center", paddingTop: 32, paddingBottom: 32 }}>
                            <AccessTime style={{ fontSize: 48, color: "#FF9800", marginBottom: 16 }} />
                            <Typography variant="h6" mb={1}>
                                만료임박 쿠폰
                            </Typography>
                            <Typography variant="h2" fontWeight={700} style={{ color: "#FF9800" }}>
                                {couponCounts.expiring}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                개
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 쿠폰 코드 입력 */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" mb={2} sx={{ display: "flex", alignItems: "center" }}>
                        <LocalOffer sx={{ mr: 1 }} />
                        할인쿠폰 코드 입력란
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        보유하신 쿠폰 코드를 입력해주세요.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="쿠폰 코드를 입력하세요"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleCouponCodeSubmit()}
                            disabled={submitting}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCouponCodeSubmit}
                            disabled={submitting}
                            sx={{ minWidth: 100, backgroundColor: "#4CAF50" }}
                        >
                            {submitting ? <CircularProgress size={20} /> : '등록'}
                        </Button>
                    </Box>
                </CardContent>

                {/* 알림 스낵바 */}
                <Snackbar
                    open={alert.show}
                    autoHideDuration={4000}
                    onClose={handleCloseAlert}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseAlert}
                        severity={alert.type}
                        sx={{ width: '100%' }}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Card>

            {/* 카테고리 탭 */}
            <Box mb={3}>
                <Tabs
                    value={activeCategory}
                    onChange={handleCategoryChange}
                    TabIndicatorProps={{ style: { backgroundColor: "#FDBF60" } }}
                >
                    <Tab
                        label={`사용가능 (${couponCounts.available})`}
                        value="available"
                        sx={{
                            color: activeCategory === "available" ? "#4A2C2A" : undefined,
                            fontWeight: activeCategory === "available" ? 600 : undefined
                        }}
                    />
                    <Tab
                        label={`만료임박 (${couponCounts.expiring})`}
                        value="expiring"
                        sx={{
                            color: activeCategory === "expiring" ? "#4A2C2A" : undefined,
                            fontWeight: activeCategory === "expiring" ? 600 : undefined
                        }}
                    />
                    <Tab
                        label={`사용완료·기간만료 (${couponCounts.usedExpired})`}
                        value="used-expired"
                        sx={{
                            color: activeCategory === "used-expired" ? "#4A2C2A" : undefined,
                            fontWeight: activeCategory === "used-expired" ? 600 : undefined
                        }}
                    />
                    <Tab
                        label={`전체 쿠폰 (${couponCounts.total})`}
                        value="all"
                        sx={{
                            color: activeCategory === "all" ? "#4A2C2A" : undefined,
                            fontWeight: activeCategory === "all" ? 600 : undefined
                        }}
                    />
                </Tabs>
            </Box>

            {/* 쿠폰 목록 */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : paginatedCoupons.length > 0 ? (
                <>
                    <Grid container spacing={3}>
                        {paginatedCoupons.map((coupon) => (
                            <Grid key={coupon.id} size={{ xs: 12, md: 6, lg: 4 }}>
                                <CouponCard coupon={coupon} onUse={handleUseCoupon} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* 페이지네이션 */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredCoupons.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <LocalOffer sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        해당 카테고리에 쿠폰이 없습니다.
                    </Typography>
                </Box>
            )}
        </Box>
    )
}

export default CouponsView