// src/components/OrderPayment/components/OrderPaymentManagement.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ShoppingCartCheckout } from "@mui/icons-material";

// 컴포넌트 imports
import OrderSummary from "./OrderSummary";
import PetInformationForm from "./PetInformationForm";
import ShippingInformationForm from "./ShippingInformationForm";
import PaymentMethodSelection from "./PaymentMethodSelection";
import OrderTotal from "./OrderTotal";
import PetModal from "./PetModal";
import AddressModal from "./AddressModal";

// 타입 imports
import type {
  PetInfo,
  ShippingInfo,
  SavedPet,
  SavedAddress,
  Coupon,
  OrderCreateRequest,
} from "../types/orderPayment.types";

// 데이터 imports
import { orderItems } from "@/data/mock-data";

// API hooks
import { useBuyerOrderData } from "@/hooks/useBuyerData";

const OrderPaymentManagement: React.FC = () => {
  // ===== 기존 상태 유지 =====
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    category: "",
    breed: "",
    age: "",
    gender: "",
    hasAllergies: false,
    healthCondition: "",
    specialRequests: "",
  });

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");

  // ===== API 연동된 상태 =====
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // ===== API 훅 =====
  const { loading, error, loadAllData, createOrder } = useBuyerOrderData();

  // ===== 기존 계산 로직 유지 =====
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 5.0;

  // ===== 컴포넌트 마운트 시 데이터 로드 =====
  useEffect(() => {
    const initializeData = async () => {
      const data = await loadAllData();
      setSavedPets(data.pets);
      setSavedAddresses(data.addresses);
      setAvailableCoupons(data.coupons);

      // 기본 주소가 있으면 자동 설정
      if (data.defaultAddress) {
        setShippingInfo({
          fullName: data.defaultAddress.fullName,
          address: data.defaultAddress.address,
          city: data.defaultAddress.city,
          postalCode: data.defaultAddress.postalCode,
          phoneNumber: data.defaultAddress.phoneNumber,
        });
      }
    };

    initializeData();
  }, [loadAllData]);

  // ===== 기존 핸들러 함수들 유지 =====
  const handlePetInfoChange = (
    field: keyof PetInfo,
    value: string | boolean
  ) => {
    setPetInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingInfoChange = (
    field: keyof ShippingInfo,
    value: string
  ) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadPet = (pet: SavedPet) => {
    setPetInfo({
      name: pet.name,
      category: pet.category,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      hasAllergies: pet.hasAllergies,
      healthCondition: pet.healthCondition,
      specialRequests: pet.specialRequests,
    });
    setPetModalOpen(false);
  };

  const handleLoadAddress = (address: SavedAddress) => {
    setShippingInfo({
      fullName: address.fullName,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      phoneNumber: address.phoneNumber,
    });
    setAddressModalOpen(false);
  };

  // ===== 기존 쿠폰 로직 유지 =====
  const getSelectedCoupon = (): Coupon | undefined =>
    availableCoupons.find((coupon) => coupon.id === selectedCoupon);

  const calculateDiscount = () => {
    const coupon = getSelectedCoupon();
    if (!coupon) return 0;

    if (subtotal >= coupon.minAmount) {
      if (coupon.type === "percentage") {
        return subtotal * (coupon.value / 100);
      } else if (coupon.type === "fixed") {
        return coupon.value;
      }
    }

    return 0;
  };

  const isCouponApplicable = (coupon: Coupon) => subtotal >= coupon.minAmount;

  // ===== 주문 생성 로직 수정 =====
  const parseAddressComponents = (fullAddress: string) => {
    // 주소를 streetAddress와 detailAddress로 분리
    const parts = fullAddress.split(" ");
    if (parts.length <= 2) {
      return {
        streetAddress: fullAddress,
        detailAddress: "",
      };
    }

    // 마지막 부분을 detailAddress로, 나머지를 streetAddress로 처리
    const detailAddress = parts[parts.length - 1];
    const streetAddress = parts.slice(0, -1).join(" ");

    return { streetAddress, detailAddress };
  };

  const generateOrderName = () => {
    if (orderItems.length === 1) {
      return orderItems[0].name;
    }
    return `${orderItems[0].name} 외 ${orderItems.length - 1}건`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const { streetAddress, detailAddress } = parseAddressComponents(
        shippingInfo.address
      );

      const orderData: OrderCreateRequest = {
        orderItems: orderItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentInfo: {
          orderName: generateOrderName(),
          sellerCoupons: selectedCoupon ? [selectedCoupon] : [],
        },
        shippingAddress: {
          recipientName: shippingInfo.fullName,
          recipientPhone: shippingInfo.phoneNumber,
          postalCode: shippingInfo.postalCode,
          streetAddress,
          detailAddress,
          deliveryNote: "배송 요청사항", // 필요시 UI에 입력 필드 추가
        },
      };

      const response = await createOrder(orderData);

      // 결제 페이지로 리다이렉트 (실제 Toss Payments 연동)
      console.log("주문 생성 성공:", response);
      // TODO: Toss Payments 리다이렉트 처리
    } catch (error) {
      console.error("주문 생성 실패:", error);
    }
  };

  const total = subtotal + shipping - calculateDiscount();

  return (
    <>
      {/* 로딩 표시 */}
      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <OrderSummary orderItems={orderItems} />

        <PetInformationForm
          petInfo={petInfo}
          onPetInfoChange={handlePetInfoChange}
          onOpenPetModal={() => setPetModalOpen(true)}
        />

        <ShippingInformationForm
          shippingInfo={shippingInfo}
          onShippingInfoChange={handleShippingInfoChange}
          onOpenAddressModal={() => setAddressModalOpen(true)}
        />

        <PaymentMethodSelection
          availableCoupons={availableCoupons}
          selectedCoupon={selectedCoupon}
          onCouponSelect={setSelectedCoupon}
          isCouponApplicable={isCouponApplicable}
          discountAmount={calculateDiscount()}
        />

        <OrderTotal
          subtotal={subtotal}
          shipping={shipping}
          discount={calculateDiscount()}
          total={total}
        />

        <Box style={{ marginTop: 32 }}>
          <Box style={{ marginBottom: 24 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label="주문제작 간식들은 맞춤 제작되므로 판매자의 확인이 필요할 수 있음을 이해합니다."
              style={{ alignItems: "flex-start", margin: 0 }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!termsAccepted || loading}
            startIcon={<ShoppingCartCheckout />}
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              fontSize: "1.125rem",
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              textTransform: "none",
            }}
          >
            {loading ? "처리 중..." : "주문 및 결제"}
          </Button>
        </Box>
      </form>

      {/* Modals */}
      <PetModal
        open={petModalOpen}
        onClose={() => setPetModalOpen(false)}
        onSelectPet={handleLoadPet}
        savedPets={savedPets}
      />

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelectAddress={handleLoadAddress}
        savedAddresses={savedAddresses}
      />
    </>
  );
};

export default OrderPaymentManagement;
