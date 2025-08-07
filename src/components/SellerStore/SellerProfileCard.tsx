import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Button,
    IconButton,
    Chip,
    Box,
    Grid as Grid,
    Divider,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import {
    ChatBubbleOutline,
    Favorite,
    Share,
    Star,
    LocalOffer,
    Close,
} from '@mui/icons-material';

// Import API and types
import { sellerCouponApi, buyerCouponApi, couponUtils, type Coupon } from '@/service/coupons/couponApi';
import {useParams} from "react-router-dom";

// SellerProfile 타입 정의
export interface SellerProfile {
    id: string;
    name: string;
    profileImage: string;
    establishedDate: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
    tags: string[];
    operatingHours: string;
    closedDays: string;
    address: string;
    deliveryDays: string;
    deliveryFee: string;
    freeShippingInfo: string;
    isVerified: boolean;
    isSafetyChecked: boolean;
    vendorName?: string; // API 연동을 위한 vendorName 추가
}

interface SellerProfileCardProps {
    seller: SellerProfile;
    onContactSeller: () => void;
    onToggleLike: () => void;
    onShare: () => void;
    isLiked: boolean;
}

const SellerProfileCard: React.FC<SellerProfileCardProps> = ({
                                                                 seller,
                                                                 onContactSeller,
                                                                 onToggleLike,
                                                                 onShare,
                                                                 isLiked,
                                                             }) => {
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [issuingCoupons, setIssuingCoupons] = useState(false);
    const { sellerId } = useParams<{ sellerId: string }>();
    const decodedName = sellerId ? decodeURIComponent(sellerId) : "";

    // 쿠폰 목록 조회
    const fetchCoupons = async () => {
        if (!decodedName) {
            console.warn('Vendor name is required to fetch coupons');
            return;
        }

        setLoading(true);
        try {
            const coupons = await sellerCouponApi.getSellerCouponsByVendor(decodedName);

            // 현재 사용 가능한 쿠폰만 필터링
            const now = new Date();
            const filteredCoupons = coupons
                .filter(coupon => {
                    const startDate = new Date(coupon.startDate);
                    const endDate = new Date(coupon.endDate);
                    return now >= startDate && now <= endDate;
                })
                .map(coupon => ({
                    ...coupon,
                    // SellerProfileCard에서 사용하는 형식으로 변환
                    id: coupon.id,
                    title: coupon.couponName,
                    description: `${couponUtils.formatDiscount(coupon.discountType, coupon.discountValue)} 할인쿠폰`,
                    expiryDate: coupon.endDate,
                    minOrderAmount: 0, // 백엔드에서 제공하지 않는 경우 기본값
                    status: 'available' as const,
                    isExpiringSoon: false, // 실제로는 만료일 기준으로 계산해야 함
                }));

            setAvailableCoupons(filteredCoupons);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            setSnackbarMessage('쿠폰 목록을 불러오는데 실패했습니다.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // 쿠폰 모달이 열릴 때 쿠폰 목록 조회
    useEffect(() => {
        if (couponModalOpen) {
            fetchCoupons();
        }
    }, [couponModalOpen, seller.vendorName]);

    const handleCouponSelect = (couponId: string) => {
        setSelectedCoupons(prev =>
            prev.includes(couponId)
                ? prev.filter(id => id !== couponId)
                : [...prev, couponId]
        );
    };

    const handleIssueCoupons = async () => {
        if (selectedCoupons.length === 0) {
            setSnackbarMessage('발급받을 쿠폰을 선택해주세요.');
            setSnackbarOpen(true);
            return;
        }

        setIssuingCoupons(true);
        try {
            // 선택된 쿠폰들을 순차적으로 발급
            const selectedCouponObjects = availableCoupons.filter(coupon =>
                selectedCoupons.includes(coupon.id)
            );

            const issuePromises = selectedCouponObjects.map(coupon =>
                buyerCouponApi.createBuyerCoupon({ code: coupon.code })
            );

            await Promise.all(issuePromises);

            setSnackbarMessage(`${selectedCoupons.length}개의 쿠폰이 발급되었습니다!`);
            setSnackbarOpen(true);
            setCouponModalOpen(false);
            setSelectedCoupons([]);
        } catch (error: any) {
            console.error('Failed to issue coupons:', error);
            if (error.response?.status === 409) {
                setSnackbarMessage(`해당 쿠폰 이미 등록되어 있습니다.`);
                setSnackbarOpen(true);
                return;
            }
            setSnackbarMessage('쿠폰 발급에 실패했습니다. 다시 시도해주세요.');
            setSnackbarOpen(true);
        } finally {
            setIssuingCoupons(false);
        }
    };

    const formatDiscountValue = (coupon: Coupon) => {
        return couponUtils.formatDiscount(coupon.discountType, coupon.discountValue);
    };

    const formatExpiryDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 1, position: 'relative' }}>
                <CardContent sx={{ p: 0 }}>
                    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'center' }}>
                        {/* 프로필 이미지 */}
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                            <Box display="flex" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                <Avatar
                                    src={seller.profileImage}
                                    sx={{
                                        width: { xs: 96, sm: 128 },
                                        height: { xs: 96, sm: 128 },
                                        border: 2,
                                        borderColor: 'grey.200',
                                        boxShadow: 2,
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* 판매자 정보 */}
                        <Grid size={{ xs: 12, sm: 'grow' }}>
                            <Box textAlign={{ xs: 'center', sm: 'left' }}>
                                <Typography
                                    variant="h4"
                                    component="h2"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                                >
                                    {seller.name}
                                </Typography>

                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    justifyContent={{ xs: 'center', sm: 'flex-start' }}
                                    mb={1}
                                    sx={{ flexWrap: 'wrap' }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        운영 시작 {seller.establishedDate} •
                                    </Typography>
                                    <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {seller.rating} ({seller.reviewCount.toLocaleString()} 리뷰) • {seller.salesCount.toLocaleString()} 판매
                                    </Typography>
                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    flexWrap="wrap"
                                    justifyContent={{ xs: 'center', sm: 'flex-start' }}
                                    sx={{ mt: 1 }}
                                >
                                    {seller.tags.map((tag, index) => (
                                        <Chip
                                            key={`${tag}-${index}`}
                                            label={tag}
                                            size="small"
                                            sx={{
                                                fontSize: '0.75rem',
                                                height: 24,
                                                bgcolor: index === 0 ? 'warning.100' : index === 1 ? 'success.100' : 'info.100',
                                                color: index === 0 ? 'warning.800' : index === 1 ? 'success.800' : 'info.800',
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* 액션 버튼들 */}
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                            <Box display="flex" flexDirection={{ xs: 'column', sm: 'column' }} gap={1} alignItems="center">
                                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<ChatBubbleOutline />}
                                        onClick={onContactSeller}
                                        sx={{
                                            bgcolor: '#e37d11',
                                            '&:hover': { bgcolor: '#d16d01' },
                                            flex: { xs: 1, sm: 'none' },
                                            minWidth: { sm: 120 },
                                        }}
                                    >
                                        판매자 문의
                                    </Button>
                                    <IconButton
                                        onClick={onToggleLike}
                                        sx={{
                                            bgcolor: 'grey.100',
                                            '&:hover': { bgcolor: 'grey.200' },
                                            color: isLiked ? 'error.main' : 'grey.600',
                                        }}
                                    >
                                        <Favorite />
                                    </IconButton>
                                    <IconButton
                                        onClick={onShare}
                                        sx={{
                                            bgcolor: 'grey.100',
                                            '&:hover': { bgcolor: 'grey.200' },
                                            color: 'grey.700',
                                        }}
                                    >
                                        <Share />
                                    </IconButton>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: { xs: 2, sm: 3 } }} />

                    {/* 상세 정보 */}
                    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ fontSize: '0.875rem' }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>운영 시간:</strong> {seller.operatingHours}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>휴무일:</strong> {seller.closedDays || '없음'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>주소:</strong> {seller.address}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>배송 소요일:</strong> {seller.deliveryDays}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>배송비:</strong> {seller.deliveryFee}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>무료배송:</strong> {seller.freeShippingInfo}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>

                {/* 쿠폰 발급 버튼 */}
                <Button
                    variant="outlined"
                    startIcon={<LocalOffer />}
                    onClick={() => setCouponModalOpen(true)}
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        minWidth: { xs: 140, sm: 160 },
                        borderColor: '#e37d11',
                        color: '#e37d11',
                        bgcolor: 'white',
                        boxShadow: 1,
                        '&:hover': {
                            borderColor: '#d16d01',
                            bgcolor: 'rgba(227, 125, 17, 0.04)',
                            boxShadow: 2,
                        },
                    }}
                >
                    쿠폰 발급받기
                </Button>
            </Card>

            {/* 쿠폰 발급 모달 */}
            <Dialog
                open={couponModalOpen}
                onClose={() => setCouponModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <LocalOffer sx={{ color: '#e37d11' }} />
                        <Typography variant="h6" fontWeight="bold">
                            쿠폰 발급받기
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setCouponModalOpen(false)}
                        size="small"
                        sx={{ color: 'grey.500' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 1 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <CircularProgress size={40} sx={{ color: '#e37d11' }} />
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                쿠폰 목록을 불러오는 중...
                            </Typography>
                        </Box>
                    ) : availableCoupons.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            현재 발급 가능한 쿠폰이 없습니다.
                        </Alert>
                    ) : (
                        <List sx={{ width: '100%' }}>
                            {availableCoupons.map((coupon) => (
                                <ListItem key={coupon.id} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => handleCouponSelect(coupon.id)}
                                        sx={{
                                            border: 1,
                                            borderColor: selectedCoupons.includes(coupon.id) ? '#e37d11' : 'grey.300',
                                            borderRadius: 2,
                                            bgcolor: selectedCoupons.includes(coupon.id) ? 'rgba(227, 125, 17, 0.04)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedCoupons.includes(coupon.id) ? 'rgba(227, 125, 17, 0.08)' : 'grey.50',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={selectedCoupons.includes(coupon.id)}
                                                sx={{
                                                    color: '#e37d11',
                                                    '&.Mui-checked': {
                                                        color: '#e37d11',
                                                    },
                                                }}
                                            />
                                        </ListItemIcon>

                                        {/* ListItemText 대신 직접 구조 만들기 */}
                                        <Box sx={{ flex: 1 }}>
                                            {/* Primary content */}
                                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {coupon.title || coupon.couponName}
                                                </Typography>
                                                <Chip
                                                    label={formatDiscountValue(coupon)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#e37d11',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                                {coupon.isExpiringSoon && (
                                                    <Chip
                                                        label="만료 임박"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Secondary content */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" mb={0.5}>
                                                    {`${formatDiscountValue(coupon)} 할인쿠폰`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    만료일: {formatExpiryDate(coupon.expiryDate || coupon.endDate)}
                                                    {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                                                        <> • 최소 주문 금액: {coupon.minOrderAmount.toLocaleString()}원</>
                                                    )}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setCouponModalOpen(false)}
                        variant="outlined"
                        sx={{ color: 'grey.600', borderColor: 'grey.300' }}
                        disabled={issuingCoupons}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleIssueCoupons}
                        variant="contained"
                        disabled={selectedCoupons.length === 0 || issuingCoupons}
                        sx={{
                            bgcolor: '#e37d11',
                            '&:hover': { bgcolor: '#d16d01' },
                            '&:disabled': { bgcolor: 'grey.300' },
                        }}
                    >
                        {issuingCoupons ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                발급 중...
                            </>
                        ) : selectedCoupons.length > 0 ? (
                            `${selectedCoupons.length}개 쿠폰 발급받기`
                        ) : (
                            '쿠폰 발급받기'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 성공/실패 메시지 스낵바 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarMessage.includes('발급되었습니다') ? 'success' : 'error'}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SellerProfileCard;