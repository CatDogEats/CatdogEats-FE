// src/pages/SellerDashboardPage/SellerInfoPage.tsx

import React from "react";
import { Box, Grid, Paper, Typography, Container, Alert } from "@mui/material";
import {
    BRAND_COLORS,
    PageHeader,
    ProfilePreviewCard,
    CompletionCard,
    BasicInfoForm,
    FormActions,
    useSellerInfo,
} from "@/components/SellerDashboard/SellerInfo";

const SellerInfoPage: React.FC = () => {
    const {
        data,
        originalData,
        isLoading,
        error,
        updateField,
        handleSave,
        handleCancel,
        handleBusinessNumberVerify,
        handleCustomerViewClick,
        handleImageUpload,
        handleImageDelete,
        addressValidation,
    } = useSellerInfo();

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* 페이지 제목 */}
            <Container maxWidth="lg" sx={{ mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontFamily: "'Noto Sans KR', sans-serif",
                            mb: 1,
                        }}
                    >
                        판매자 정보 관리
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontSize: "1rem"
                        }}
                    >
                        워크샵 정보를 관리하고 고객에게 보여질 프로필을 설정하세요.
                    </Typography>
                </Box>
            </Container>

            {/* 메인 콘텐츠 */}
            <Container maxWidth="lg" sx={{ width: '100%' }}>
                {/* 에러 메시지 */}
                {error && (
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="error">
                            {error}
                        </Alert>
                    </Box>
                )}


                <Paper
                    sx={{
                        p: { xs: 3, sm: 4, md: 5 },
                        borderRadius: 3,
                        border: `1px solid ${BRAND_COLORS.BORDER}`,
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {/* 페이지 헤더 */}
                    <PageHeader
                        title="기본 정보 설정"
                        onCustomerViewClick={handleCustomerViewClick}
                    />

                    {/* 카드 섹션 */}
                    <Box sx={{ mb: 5 }}>
                        <Grid container spacing={3}>
                            {/* 프로필 미리보기 카드 - 🔧 배송정보 추가 */}
                            <Grid item xs={12} lg={8}>
                                <ProfilePreviewCard
                                    workshopName={data.vendorName || "달콤한 우리집 간식공방"}
                                    rating={data.rating}
                                    avatarEmoji={data.avatarEmoji}
                                    profileImage={data.profileImage}
                                    tags={data.tags}
                                    operatingHours={{
                                        start: data.operatingHours.start,
                                        end: data.operatingHours.end,
                                        holidayInfo: data.closedDays.length > 0
                                            ? `${data.closedDays.join(', ')} 휴무`
                                            : data.operatingHours.holidayInfo
                                    }}
                                    deliveryFee={data.deliveryFee}
                                    freeShippingThreshold={data.freeShippingThreshold}
                                />
                            </Grid>

                            {/* 완성도 카드 */}
                            <Grid item xs={12} lg={4}>
                                <CompletionCard completionRate={data.completionRate} />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* 폼 섹션 */}
                    <Box>
                        <BasicInfoForm
                            data={{
                                vendorName: data.vendorName,
                                businessNumber: data.businessNumber,
                                settlementBank: data.settlementBank,
                                settlementAcc: data.settlementAcc,
                                postalCode: data.postalCode,
                                roadAddress: data.roadAddress,
                                detailAddress: data.detailAddress,
                                phoneNumber: data.phoneNumber,
                                tags: data.tags,
                                operatingHours: data.operatingHours,
                                closedDays: data.closedDays,
                                deliveryFee: data.deliveryFee,
                                freeShippingThreshold: data.freeShippingThreshold,
                                profileImage: data.profileImage,
                                _addressData: data._addressData,
                            }}
                            onChange={updateField}
                            onBusinessNumberVerify={handleBusinessNumberVerify}
                            onImageUpload={handleImageUpload}
                            onImageDelete={handleImageDelete}
                            addressValidation={addressValidation}
                        />

                        <FormActions
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                            addressValidation={addressValidation}
                        />
                    </Box>
                </Paper>

                {/* 추가 정보 섹션 */}
                <Box sx={{ mt: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${BRAND_COLORS.BORDER}` }}>
                        <Typography variant="h6" fontWeight="600" mb={2}>
                            💡 도움말
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, color: BRAND_COLORS.TEXT_SECONDARY }}>
                            <Typography component="li" variant="body2" mb={1}>
                                <strong>프로필 완성도:</strong> 모든 필수 정보를 입력하면 더 많은 고객에게 노출됩니다.
                            </Typography>
                            <Typography component="li" variant="body2" mb={1}>
                                <strong>주소 정보:</strong> 주소를 입력하시려면 모든 주소 필드(우편번호, 도로명주소, 상세주소, 전화번호)를 완전히 입력해주세요.
                            </Typography>
                            <Typography component="li" variant="body2" mb={1}>
                                <strong>프로필 이미지:</strong> 고품질 이미지(400x400px 권장)를 업로드하면 더 전문적인 인상을 줄 수 있습니다.
                            </Typography>
                            <Typography component="li" variant="body2" mb={1}>
                                <strong>배송 정보:</strong> 적절한 배송비와 무료배송 기준을 설정하여 고객 만족도를 높이세요.
                            </Typography>
                            <Typography component="li" variant="body2" mb={1}>
                                <strong>정산 계좌:</strong> 매출 정산을 위한 계좌이므로 정확히 입력해주세요.
                            </Typography>
                            <Typography component="li" variant="body2">
                                <strong>휴무일:</strong> 고객이 주문 시 참고할 수 있도록 정확한 휴무일을 설정해주세요.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default SellerInfoPage;