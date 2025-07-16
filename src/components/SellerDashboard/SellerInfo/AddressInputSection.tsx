// src/components/SellerDashboard/SellerInfo/AddressInputSection.tsx

import React, { useState } from "react";
import { Box, Typography, TextField, Stack } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { BRAND_COLORS, PrimaryButton } from "./constants";
import AddressSearchModal from "./AddressSearchModal";

// ==================== 인터페이스 ====================
interface AddressData {
    postalCode: string;
    roadAddress: string;
    city: string;
    district: string;
    neighborhood: string;
    streetAddress: string;
}

interface AddressInputSectionProps {
    postalCode: string;
    roadAddress: string;
    detailAddress: string;
    onChange: (field: 'postalCode' | 'roadAddress' | 'detailAddress', value: string) => void;
    onAddressDataChange?: (addressData: Partial<AddressData>) => void; // 상세 주소 데이터 전달용
}

// ==================== 주소 입력 섹션 컴포넌트 ====================
const AddressInputSection: React.FC<AddressInputSectionProps> = ({
                                                                     postalCode,
                                                                     roadAddress,
                                                                     detailAddress,
                                                                     onChange,
                                                                     onAddressDataChange,
                                                                 }) => {
    const [addressModalOpen, setAddressModalOpen] = useState(false);

    const handleAddressSelect = (addressData: AddressData) => {
        console.log("주소 선택됨:", addressData);

        // 기본 주소 필드 업데이트
        onChange('postalCode', addressData.postalCode);
        onChange('roadAddress', addressData.roadAddress);

        // 상세 주소 데이터를 부모 컴포넌트에 전달 (API 전송용)
        if (onAddressDataChange) {
            onAddressDataChange({
                city: addressData.city,
                district: addressData.district,
                neighborhood: addressData.neighborhood,
                streetAddress: addressData.streetAddress,
                postalCode: addressData.postalCode,
            });
        }

        console.log("상태 업데이트 완료");
    };

    const handleDetailAddressChange = (value: string) => {
        onChange('detailAddress', value);
    };

    return (
        <>
            <Box>
                <Typography
                    variant="body2"
                    fontWeight="500"
                    color={BRAND_COLORS.TEXT_PRIMARY}
                    mb={1}
                >
                    사업자 주소
                </Typography>
                <Stack spacing={2}>
                    <Box display="flex" gap={1}>
                        <TextField
                            placeholder="우편번호"
                            value={postalCode}
                            sx={{
                                width: 120,
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                    borderRadius: 2,
                                }
                            }}
                            InputProps={{ readOnly: true }}
                        />
                        <PrimaryButton
                            startIcon={<SearchIcon />}
                            onClick={() => setAddressModalOpen(true)}
                            sx={{ minWidth: 100 }}
                        >
                            주소검색
                        </PrimaryButton>
                    </Box>
                    <TextField
                        fullWidth
                        placeholder="도로명 주소"
                        value={roadAddress}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                            }
                        }}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        fullWidth
                        placeholder="상세 주소를 입력하세요"
                        value={detailAddress}
                        onChange={(e) => handleDetailAddressChange(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: BRAND_COLORS.BACKGROUND_INPUT,
                                borderRadius: 2,
                                "&.Mui-focused fieldset": { borderColor: BRAND_COLORS.PRIMARY }
                            }
                        }}
                    />
                </Stack>
            </Box>

            {/* 카카오 주소 검색 모달 */}
            <AddressSearchModal
                open={addressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                onSelect={handleAddressSelect}
            />
        </>
    );
};

export default AddressInputSection;