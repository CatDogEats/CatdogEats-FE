"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ShoppingCartCheckout } from "@mui/icons-material";

import OrderSummary from "./OrderSummary";
import PetInformationForm from "./PetInformationForm";
import ShippingInformationForm from "./ShippingInformationForm";
import PaymentMethodSelection from "./PaymentMethodSelection";
import OrderTotal from "./OrderTotal";
import PetModal from "./PetModal";
import AddressModal from "./AddressModal";

import type {
  PetInfo,
  ShippingInfo,
  SavedPet,
  SavedAddress,
  Coupon,
  OrderCreateRequest,
} from "../types/orderPayment.types";

import { orderItems } from "@/data/mock-data";
import { useBuyerOrderData } from "@/hooks/useBuyerData";

const OrderPaymentManagement: React.FC = () => {
  // 1) 폼 상태
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

  // 2) 모달·API 상태
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // 3) 훅에서 가져온 함수
  const {
    loading,
    error,
    loadPets,
    loadAllAddresses,
    createOrder,
    loadAllData,
  } = useBuyerOrderData();

  // 4) 초기 렌더링: 쿠폰만 불러오기
  useEffect(() => {
    (async () => {
      try {
        const { coupons } = await loadAllData();
        setAvailableCoupons(coupons);
      } catch (e) {
        console.error("초기 쿠폰 로드 실패:", e);
      }
    })();
  }, [loadAllData]);

  // 5) “저장된 펫 불러오기” 버튼
  const handleOpenPetModal = async () => {
    const pets = await loadPets();
    setSavedPets(pets);
    setPetModalOpen(true);
  };

  // 6) “저장된 주소 불러오기” 버튼
  const handleOpenAddressModal = async () => {
    const addrs = await loadAllAddresses();
    setSavedAddresses(addrs);
    setAddressModalOpen(true);
  };

  // 7) 폼 핸들러들
  const handlePetInfoChange = (field: keyof PetInfo, value: any) =>
    setPetInfo((prev) => ({ ...prev, [field]: value }));

  const handleShippingInfoChange = (field: keyof ShippingInfo, value: string) =>
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

  const handleLoadPet = (pet: SavedPet) => {
    setPetInfo({ ...pet });
    setPetModalOpen(false);
  };

  const handleLoadAddress = (addr: SavedAddress) => {
    setShippingInfo({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      phoneNumber: addr.phoneNumber,
    });
    setAddressModalOpen(false);
  };

  // 8) 쿠폰 할인 계산
  const subtotal = orderItems.reduce((sum, i) => sum + i.price, 0);
  const shipping = 5.0;
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");
  const getSelectedCoupon = () =>
    availableCoupons.find((c) => c.id === selectedCoupon);
  const calculateDiscount = () => {
    const c = getSelectedCoupon();
    if (!c) return 0;
    return c.type === "percentage" ? (subtotal * c.value) / 100 : c.value;
  };
  const isCouponApplicable = (c: Coupon) => subtotal >= c.minAmount;

  // 9) 주문 생성
  const parseAddress = (full: string) => {
    const parts = full.split(" ");
    if (parts.length <= 2) return { street: full, detail: "" };
    return {
      street: parts.slice(0, -1).join(" "),
      detail: parts[parts.length - 1],
    };
  };
  const generateOrderName = () =>
    orderItems.length === 1
      ? orderItems[0].name
      : `${orderItems[0].name} 외 ${orderItems.length - 1}건`;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { street, detail } = parseAddress(shippingInfo.address);
      const orderData: OrderCreateRequest = {
        orderItems: orderItems.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        paymentInfo: {
          orderName: generateOrderName(),
          sellerCoupons: selectedCoupon ? [selectedCoupon] : [],
        },
        shippingAddress: {
          recipientName: shippingInfo.fullName,
          recipientPhone: shippingInfo.phoneNumber,
          postalCode: shippingInfo.postalCode,
          streetAddress: street,
          detailAddress: detail,
          deliveryNote: "배송 요청사항",
        },
      };
      await createOrder(orderData);
      console.log("주문 성공");
    } catch (e) {
      console.error("주문 실패:", e);
    }
  };

  const total = subtotal + shipping - calculateDiscount();

  return (
    <>
      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
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
          onOpenPetModal={handleOpenPetModal}
        />

        <ShippingInformationForm
          shippingInfo={shippingInfo}
          onShippingInfoChange={handleShippingInfoChange}
          onOpenAddressModal={handleOpenAddressModal}
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

        <Box mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
            }
            label="맞춤 제작이므로 판매자 확인이 필요할 수 있음을 이해합니다."
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!termsAccepted || loading}
            startIcon={<ShoppingCartCheckout />}
            sx={{ py: 2, mt: 2 }}
          >
            {loading ? "처리 중…" : "주문 및 결제"}
          </Button>
        </Box>
      </form>

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
