// src/components/SellerDashboard/SellerInfo/FormComponents.tsx

import React from "react";
import { Box, Typography, TextField, Stack, Grid, FormControl, FormGroup, FormControlLabel, Checkbox, InputAdornment } from "@mui/material";
import { BRAND_COLORS, PrimaryButton, SecondaryButton } from "./constants";
import { FormField } from "./BasicComponents";
import ProfileImageUpload from "./ProfileImageUpload";
import TagInput from "./TagInput";
import OperatingHours from "./OperatingHours";
import AddressInputSection from "./AddressInputSection";
import { WEEKDAYS } from "@/service/seller/SellerInfoAPI";

// ==================== 확장된 폼 데이터 타입 ====================
export interface BasicInfoFormData {
    vendorName: string;
    businessNumber: string;
    settlementBank: string;
    settlementAcc: string;
    postalCode: string;
    roadAddress: string;
    detailAddress: string;
    phoneNumber: string;
    tags: string[];
    operatingHours: {
        start: string;
        end: string;
        breakTime?: string;
        holidayInfo: string;
    };
    closedDays: string[];
    deliveryFee: number;
    freeShippingThreshold: number;
    profileImage: string | null;
    // 백엔드 API 전송용 주소 데이터
    _addressData?: {
        city: string;
        district: string;
        neighborhood: string;
        streetAddress: string;
    };
}

// ==================== 휴무일 선택 컴포넌트 ====================
interface ClosedDaysInputProps {
    closedDays: string[];
    onChange: (closedDays: string[]) => void;
}

const ClosedDaysInput: React.FC<ClosedDaysInputProps> = ({ closedDays, onChange }) => {
    const handleDayChange = (day: string, checked: boolean) => {
        if (checked) {
            onChange([...closedDays, day]);
        } else {
            onChange(closedDays.filter(d => d !== day));
        }
    };

    return (
        <Box>
            <Typography
                variant="body2"
                fontWeight="500"
                color={BRAND_COLORS.TEXT_PRIMARY}
                mb={1}
            >
                휴무일 선택
            </Typography>
            <FormControl component="fieldset">
                <FormGroup row>
                    {WEEKDAYS.map((weekday) => (
                        <FormControlLabel
                            key={weekday.value}
                            control={
                                <Checkbox
                                    checked={closedDays.includes(weekday.value)}
                                    onChange={(e) => handleDayChange(weekday.value, e.target.checked)}
                                    sx={{
                                        color: BRAND_COLORS.TEXT_SECONDARY,
                                        '&.Mui-checked': {
                                            color: BRAND_COLORS.PRIMARY,
                                        },
                                    }}
                                />
                            }
                            label={weekday.label}
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.875rem',
                                    color: BRAND_COLORS.TEXT_PRIMARY
                                }
                            }}
                        />
                    ))}
                </FormGroup>
            </FormControl>
            <Typography
                variant="caption"
                color={BRAND_COLORS.TEXT_SECONDARY}
                mt={1}
                display="block"
            >
                선택한 요일에는 휴무입니다.
            </Typography>
        </Box>
    );
};

// ==================== 배송 정보 입력 컴포넌트 ====================
interface DeliveryInfoInputProps {
    deliveryFee: number;
    freeShippingThreshold: number;
    onChange: (field: 'deliveryFee' | 'freeShippingThreshold', value: number) => void;
}

const DeliveryInfoInput: React.FC<DeliveryInfoInputProps> = ({
                                                                 deliveryFee,
                                                                 freeShippingThreshold,
                                                                 onChange
                                                             }) => {
    const handleNumberChange = (field: 'deliveryFee' | 'freeShippingThreshold', value: string) => {
        const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
        onChange(field, numValue);
    };

    return (
        <Box>
            <Typography
                variant="body2"
                fontWeight="500"
                color={BRAND_COLORS.TEXT_PRIMARY}
                mb={2}
            >
                배송 정보
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="기본 배송비"
                        placeholder="3000"
                        value={deliveryFee.toLocaleString()}
                        onChange={(e) => handleNumberChange('deliveryFee', e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">원</InputAdornment>
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                                "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="무료배송 기준금액"
                        placeholder="50000"
                        value={freeShippingThreshold.toLocaleString()}
                        onChange={(e) => handleNumberChange('freeShippingThreshold', e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">원</InputAdornment>
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                                "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                            }
                        }}
                    />
                </Grid>
            </Grid>
            <Typography
                variant="caption"
                color={BRAND_COLORS.TEXT_SECONDARY}
                mt={1}
                display="block"
            >
                기준금액 이상 주문 시 배송비가 무료가 됩니다.
            </Typography>
        </Box>
    );
};

// ==================== 정산 정보 입력 컴포넌트 ====================
interface SettlementInfoInputProps {
    settlementBank: string;
    settlementAcc: string;
    onChange: (field: 'settlementBank' | 'settlementAcc', value: string) => void;
}

const SettlementInfoInput: React.FC<SettlementInfoInputProps> = ({
                                                                     settlementBank,
                                                                     settlementAcc,
                                                                     onChange
                                                                 }) => {
    return (
        <Box>
            <Typography
                variant="body2"
                fontWeight="500"
                color={BRAND_COLORS.TEXT_PRIMARY}
                mb={2}
            >
                정산 계좌 정보
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="정산 은행"
                        placeholder="국민은행"
                        value={settlementBank}
                        onChange={(e) => onChange('settlementBank', e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                                "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <TextField
                        fullWidth
                        label="계좌번호"
                        placeholder="123456789012"
                        value={settlementAcc}
                        onChange={(e) => onChange('settlementAcc', e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                                "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                            }
                        }}
                    />
                </Grid>
            </Grid>
            <Typography
                variant="caption"
                color={BRAND_COLORS.TEXT_SECONDARY}
                mt={1}
                display="block"
            >
                매출 정산을 위한 계좌 정보입니다. 정확히 입력해주세요.
            </Typography>
        </Box>
    );
};

// ==================== 향상된 기본 정보 폼 ====================
interface BasicInfoFormProps {
    data: BasicInfoFormData;
    onChange: (field: keyof BasicInfoFormData, value: any) => void;
    onBusinessNumberVerify?: () => void;
    onImageUpload?: (file: File) => Promise<void>;
    onImageDelete?: () => Promise<void>;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
                                                                data,
                                                                onChange,
                                                                onBusinessNumberVerify,
                                                                onImageUpload,
                                                                onImageDelete
                                                            }) => {
    const handleAddressChange = (field: 'postalCode' | 'roadAddress' | 'detailAddress', value: string) => {
        onChange(field, value);
    };

    // 카카오 API에서 받은 상세 주소 데이터 저장
    const handleAddressDataChange = (addressData: Partial<{
        city: string;
        district: string;
        neighborhood: string;
        streetAddress: string;
        postalCode: string;
    }>) => {
        console.log("상세 주소 데이터 저장:", addressData);

        // 내부 주소 데이터 저장 (API 전송용)
        onChange('_addressData', {
            city: addressData.city || '',
            district: addressData.district || '',
            neighborhood: addressData.neighborhood || '',
            streetAddress: addressData.streetAddress || ''
        });
    };

    const handleDeliveryInfoChange = (field: 'deliveryFee' | 'freeShippingThreshold', value: number) => {
        onChange(field, value);
    };

    const handleSettlementInfoChange = (field: 'settlementBank' | 'settlementAcc', value: string) => {
        onChange(field, value);
    };

    return (
        <Box>
            <Stack spacing={4}>
                {/* 프로필 이미지 */}
                <ProfileImageUpload
                    currentImage={data.profileImage}
                    onChange={(image) => onChange('profileImage', image)}
                    onUpload={onImageUpload}
                    onDelete={onImageDelete}
                />

                {/* 워크샵 이름 */}
                <FormField
                    label="워크샵 이름"
                    placeholder="예: 냥멍이네 수제간식 공방"
                    value={data.vendorName}
                    onChange={(e) => onChange('vendorName', e.target.value)}
                />

                {/* 전화번호와 사업자 등록번호 */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <FormField
                            label="전화번호"
                            placeholder="02-1234-5678"
                            value={data.phoneNumber}
                            onChange={(e) => onChange('phoneNumber', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight="500"
                                color={BRAND_COLORS.TEXT_PRIMARY}
                                mb={1}
                            >
                                사업자 등록번호
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="123-45-67890"
                                value={data.businessNumber}
                                onChange={(e) => onChange('businessNumber', e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                        borderRadius: 2,
                                        "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight="500"
                                color="transparent"
                                mb={1}
                                sx={{ height: '20px' }}
                            >
                                사업자 등록번호
                            </Typography>
                            <SecondaryButton
                                fullWidth
                                onClick={onBusinessNumberVerify}
                                sx={{ height: 56 }}
                            >
                                인증요청
                            </SecondaryButton>
                        </Box>
                    </Grid>
                </Grid>

                {/* 주소 입력 섹션 */}
                <AddressInputSection
                    postalCode={data.postalCode}
                    roadAddress={data.roadAddress}
                    detailAddress={data.detailAddress}
                    onChange={handleAddressChange}
                    onAddressDataChange={handleAddressDataChange}
                />

                {/* 정산 계좌 정보 */}
                <SettlementInfoInput
                    settlementBank={data.settlementBank}
                    settlementAcc={data.settlementAcc}
                    onChange={handleSettlementInfoChange}
                />

                {/* 태그 입력 */}
                <TagInput
                    tags={data.tags}
                    onChange={(tags) => onChange('tags', tags)}
                />

                {/* 운영시간 */}
                <OperatingHours
                    hours={data.operatingHours}
                    onChange={(hours) => onChange('operatingHours', hours)}
                />

                {/* 휴무일 선택 */}
                <ClosedDaysInput
                    closedDays={data.closedDays}
                    onChange={(closedDays) => onChange('closedDays', closedDays)}
                />

                {/* 배송 정보 */}
                <DeliveryInfoInput
                    deliveryFee={data.deliveryFee}
                    freeShippingThreshold={data.freeShippingThreshold}
                    onChange={handleDeliveryInfoChange}
                />
            </Stack>
        </Box>
    );
};

// ==================== 폼 액션 버튼 ====================
interface FormActionsProps {
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
                                                            onSave,
                                                            onCancel,
                                                            isLoading = false
                                                        }) => (
    <Box pt={4} borderTop={`1px solid ${BRAND_COLORS.BORDER}`} mt={4}>
        <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
            <SecondaryButton
                onClick={onCancel}
                disabled={isLoading}
                sx={{ minWidth: 120, px: 3, py: 1.5 }}
            >
                변경 취소
            </SecondaryButton>
            <PrimaryButton
                onClick={onSave}
                disabled={isLoading}
                sx={{ minWidth: 120, px: 3, py: 1.5 }}
            >
                {isLoading ? "저장 중..." : "저장하기"}
            </PrimaryButton>
        </Box>
    </Box>
);