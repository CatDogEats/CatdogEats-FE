// src/components/SellerDashboard/SellerInfo/useSellerInfo.ts

import { useState, useCallback, useEffect } from "react";
import {
    sellerInfoApi,
    transformResponseToFormData,
    SellerInfoFormData
} from "@/service/seller/SellerInfoAPI";

export interface SellerInfoData {
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
    completionRate: number;
    rating: number;
    avatarEmoji: string;
    // 백엔드 API 전송용 주소 데이터
    _addressData?: {
        city: string;
        district: string;
        neighborhood: string;
        streetAddress: string;
    };
}

const initialData: SellerInfoData = {
    vendorName: "",
    businessNumber: "",
    settlementBank: "",
    settlementAcc: "",
    postalCode: "",
    roadAddress: "",
    detailAddress: "",
    phoneNumber: "",
    tags: [],
    operatingHours: {
        start: "09:00",
        end: "18:00",
        holidayInfo: "주말 및 공휴일 휴무",
    },
    closedDays: [],
    deliveryFee: 3000,
    freeShippingThreshold: 50000,
    profileImage: null,
    completionRate: 30,
    rating: 4.5,
    avatarEmoji: "🐾",
};

export const useSellerInfo = () => {
    const [data, setData] = useState<SellerInfoData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("basic-info");
    const [error, setError] = useState<string | null>(null);

    // 초기 데이터 로드
    useEffect(() => {
        loadSellerInfo();
    }, []);

    const loadSellerInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await sellerInfoApi.getSellerInfo();

            if (response) {
                // 백엔드 응답을 프론트엔드 형식으로 변환
                const formData = transformResponseToFormData(response);

                setData(prev => ({
                    ...prev,
                    vendorName: formData.vendorName,
                    businessNumber: formData.businessNumber,
                    settlementBank: formData.settlementBank,
                    settlementAcc: formData.settlementAcc,
                    postalCode: formData.postalCode,
                    roadAddress: formData.roadAddress,
                    detailAddress: formData.detailAddress,
                    phoneNumber: formData.phoneNumber,
                    tags: formData.tags,
                    operatingHours: {
                        start: formData.operatingStartTime,
                        end: formData.operatingEndTime,
                        holidayInfo: prev.operatingHours.holidayInfo, // 기존 값 유지
                    },
                    closedDays: formData.closedDays,
                    deliveryFee: formData.deliveryFee,
                    freeShippingThreshold: formData.freeShippingThreshold,
                    profileImage: formData.profileImage,
                    completionRate: calculateCompletionRate({
                        ...prev,
                        vendorName: formData.vendorName,
                        businessNumber: formData.businessNumber,
                        settlementBank: formData.settlementBank,
                        settlementAcc: formData.settlementAcc,
                        postalCode: formData.postalCode,
                        roadAddress: formData.roadAddress,
                        detailAddress: formData.detailAddress,
                        phoneNumber: formData.phoneNumber,
                        tags: formData.tags,
                        closedDays: formData.closedDays,
                        profileImage: formData.profileImage,
                    }),
                }));
            }
        } catch (err) {
            console.error('판매자 정보 로드 실패:', err);
            setError('판매자 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateField = useCallback((field: keyof SellerInfoData, value: any) => {
        setData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };

            // 완성도 재계산
            newData.completionRate = calculateCompletionRate(newData);

            return newData;
        });
    }, []);

    // 완성도 계산 함수
    const calculateCompletionRate = useCallback((data: SellerInfoData) => {
        const fields = [
            data.vendorName,
            data.businessNumber,
            data.settlementBank,
            data.settlementAcc,
            data.roadAddress,
            data.detailAddress,
            data.phoneNumber,
            data.operatingHours.start,
            data.operatingHours.end,
            data.operatingHours.holidayInfo,
        ];

        const imageBonus = data.profileImage ? 1 : 0;
        const tagBonus = data.tags.length > 0 ? 1 : 0;
        const deliveryBonus = data.deliveryFee > 0 ? 1 : 0;
        const closedDaysBonus = 1; // 휴무일은 선택하지 않아도 완성으로 간주

        const filledFields = fields.filter(field => field && field.toString().trim() !== "").length;
        const totalFields = fields.length + 4; // 이미지, 태그, 배송비, 휴무일 포함

        return Math.round(((filledFields + imageBonus + tagBonus + deliveryBonus + closedDaysBonus) / totalFields) * 100);
    }, []);

    const handleSave = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 프론트엔드 데이터를 백엔드 형식으로 변환
            const formData: SellerInfoFormData = {
                vendorName: data.vendorName,
                businessNumber: data.businessNumber,
                settlementBank: data.settlementBank,
                settlementAcc: data.settlementAcc,
                tags: data.tags,
                operatingStartTime: data.operatingHours.start,
                operatingEndTime: data.operatingHours.end,
                closedDays: data.closedDays,
                deliveryFee: data.deliveryFee,
                freeShippingThreshold: data.freeShippingThreshold,
                postalCode: data.postalCode,
                roadAddress: data.roadAddress,
                detailAddress: data.detailAddress,
                phoneNumber: data.phoneNumber,
                profileImage: data.profileImage,
                _addressData: data._addressData,
            };

            // API 호출
            const response = await sellerInfoApi.upsertSellerInfo(formData);

            console.log('판매자 정보 저장 성공:', response);

            // 성공 시 완성도 업데이트
            const newCompletionRate = calculateCompletionRate(data);
            setData(prev => ({ ...prev, completionRate: newCompletionRate }));

            alert('판매자 정보가 성공적으로 저장되었습니다.');

        } catch (error) {
            console.error("판매자 정보 저장 실패:", error);
            setError('판매자 정보 저장에 실패했습니다. 다시 시도해주세요.');
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }, [data, calculateCompletionRate]);

    const handleCancel = useCallback(() => {
        setData(initialData);
        setError(null);
        loadSellerInfo(); // 원래 데이터로 되돌리기
    }, [loadSellerInfo]);

    const handleBusinessNumberVerify = useCallback(async () => {
        if (!data.businessNumber) {
            alert("사업자 등록번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            console.log("사업자 등록번호 인증:", data.businessNumber);

            // TODO: 실제 사업자 등록번호 인증 API 호출
            // const result = await verifyBusinessNumber(data.businessNumber);

            // 임시로 성공 처리
            setTimeout(() => {
                alert("사업자 등록번호 인증이 완료되었습니다.");
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.error("인증 실패:", error);
            alert("인증에 실패했습니다. 다시 시도해주세요.");
            setIsLoading(false);
        }
    }, [data.businessNumber]);

    const handleCustomerViewClick = useCallback(() => {
        if (!data.vendorName) {
            alert("워크샵 이름을 먼저 설정해주세요.");
            return;
        }

        console.log("고객 화면으로 이동:", data.vendorName);

        // TODO: 고객 화면으로 이동 로직
        // 예시: navigate(`/seller/${encodeURIComponent(data.vendorName)}`);

        // 임시로 새 탭에서 열기
        const customerUrl = `/seller/${encodeURIComponent(data.vendorName)}`;
        window.open(customerUrl, '_blank');
    }, [data.vendorName]);

    // 이미지 업로드 처리
    const handleImageUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await sellerInfoApi.uploadBrandImage(file);

            // 업로드된 이미지 URL로 상태 업데이트
            setData(prev => ({
                ...prev,
                profileImage: response.vendorProfileImage,
                completionRate: calculateCompletionRate({
                    ...prev,
                    profileImage: response.vendorProfileImage
                })
            }));

            console.log('이미지 업로드 성공:', response);

        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            setError('이미지 업로드에 실패했습니다.');
            alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }, [calculateCompletionRate]);

    // 이미지 삭제 처리
    const handleImageDelete = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await sellerInfoApi.deleteBrandImage();

            // 이미지 삭제 후 상태 업데이트
            setData(prev => ({
                ...prev,
                profileImage: null,
                completionRate: calculateCompletionRate({
                    ...prev,
                    profileImage: null
                })
            }));

            console.log('이미지 삭제 성공:', response);

        } catch (error) {
            console.error('이미지 삭제 실패:', error);
            setError('이미지 삭제에 실패했습니다.');
            alert('이미지 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }, [calculateCompletionRate]);

    return {
        data,
        isLoading,
        error,
        activeSection,
        setActiveSection,
        updateField,
        handleSave,
        handleCancel,
        handleBusinessNumberVerify,
        handleCustomerViewClick,
        handleImageUpload,
        handleImageDelete,
        loadSellerInfo,
    };
};