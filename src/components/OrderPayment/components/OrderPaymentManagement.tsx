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
  const [addressModalLoading, setAddressModalLoading] = useState(false);
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // 3) 훅에서 가져온 함수
  const {
    loading,
    error,
    setError,
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

  // 6) "저장된 주소 불러오기" 버튼 - ✅ 수정: 올바른 상태 이름 사용
  const handleOpenAddressModal = async () => {
    try {
      setAddressModalLoading(true); // ✅ 수정: 올바른 함수명
      console.log("주소 모달 열기 시작");

      const savedAddresses = await loadAllAddresses();
      console.log("불러온 주소 목록:", savedAddresses);

      setSavedAddresses(savedAddresses);
      setAddressModalOpen(true); // ✅ 수정: 올바른 함수명

      if (savedAddresses.length === 0) {
        console.log("저장된 주소가 없습니다.");
      }
    } catch (error) {
      console.error("주소 모달 열기 실패:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "주소를 불러오는데 실패했습니다.";

      // ✅ 에러 상황에서도 모달을 열어서 사용자가 새 주소를 추가할 수 있도록 함
      setSavedAddresses([]);
      setAddressModalOpen(true); // ✅ 수정: 올바른 함수명

      alert(
        `주소 불러오기 실패: ${errorMessage}\n\n새 주소를 직접 입력하실 수 있습니다.`
      );
    } finally {
      setAddressModalLoading(false); // ✅ 수정: 올바른 함수명
    }
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
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : 3000;
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

  //  클라이언트 사이드 검증 함수
  const validateOrderForm = (): string | null => {
    if (!petInfo.name.trim()) {
      return "반려동물 이름을 입력해주세요.";
    }
    if (!petInfo.category) {
      return "반려동물 종류를 선택해주세요.";
    }
    if (!petInfo.id) {
      return "반려동물을 선택해주세요. 저장된 반려동물 목록에서 선택하거나 새로 등록해주세요.";
    }

    // 배송 정보 검증
    if (!shippingInfo.fullName.trim()) {
      return "받는 사람 이름을 입력해주세요.";
    }
    if (!shippingInfo.phoneNumber.trim()) {
      return "연락처를 입력해주세요.";
    }
    if (!shippingInfo.postalCode.trim()) {
      return "우편번호를 입력해주세요.";
    }
    if (!shippingInfo.address.trim()) {
      return "배송 주소를 입력해주세요.";
    }

    // 약관 동의 검증
    if (!termsAccepted) {
      return "맞춤 제작 관련 약관에 동의해주세요.";
    }

    return null; // 검증 통과
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 추가: 클라이언트 사이드 검증
    const validationError = validateOrderForm();
    if (validationError) {
      setError(validationError);
      return; // 검증 실패시 서버 요청하지 않음
    }

    try {
      setError(null); // 이전 에러 메시지 초기화
      const { street, detail } = parseAddress(shippingInfo.address);

      const orderData: OrderCreateRequest = {
        orderItems: orderItems.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        paymentInfo: {
          orderName: generateOrderName(),
          sellerCoupons: selectedCoupon ? [selectedCoupon] : [],
          customerName: shippingInfo.fullName,
          customerEmail: "buyer@example.com",
        },
        shippingAddress: {
          recipientName: shippingInfo.fullName,
          recipientPhone: shippingInfo.phoneNumber,
          postalCode: shippingInfo.postalCode,
          streetAddress: street,
          detailAddress: detail,
          deliveryNote: "배송 요청사항",
        },
        petId: petInfo.id, // ✅ 추가: 선택된 반려동물 ID
      };

      // ✅ 수정: createOrder API 응답을 받아서 Toss 결제 페이지로 리다이렉트
      const response = await createOrder(orderData);

      if (response?.tossPaymentInfo) {
        // Toss 결제 페이지로 리다이렉트
        const {
          clientKey,
          tossOrderId,
          orderName,
          amount,
          customerName,
          customerEmail,
        } = response.tossPaymentInfo;

        // 동적으로 Toss Payments 스크립트 로드 및 결제 실행
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v2/standard";
        script.onload = () => {
          const tossPayments = window.TossPayments(clientKey);
          const payment = tossPayments.payment({
            customerKey: window.TossPayments.ANONYMOUS,
          });

          payment
            .requestPayment({
              method: "CARD",
              amount: {
                currency: "KRW",
                value: amount,
              },
              orderId: tossOrderId,
              orderName: orderName,
              successUrl: `${window.location.origin}/payment-success`,
              failUrl: `${window.location.origin}/payment-fail`,
              customerEmail: customerEmail,
              customerName: customerName,
            })
            .catch((error: any) => {
              console.error("결제 요청 실패:", error);
              setError("결제 요청에 실패했습니다. 다시 시도해주세요.");
            });
        };
        script.onerror = () => {
          setError(
            "결제 시스템을 불러오는데 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요."
          );
        };
        document.head.appendChild(script);
      } else {
        throw new Error("결제 정보를 받아오지 못했습니다.");
      }
    } catch (e) {
      console.error("주문 실패:", e);

      // ✅ 개선: 사용자 친화적 에러 메시지
      if (e instanceof Error) {
        if (e.message.includes("400")) {
          setError("입력하신 정보를 다시 확인해주세요.");
        } else if (e.message.includes("401")) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
        } else if (e.message.includes("500")) {
          setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          setError(e.message || "주문 처리 중 오류가 발생했습니다.");
        }
      } else {
        setError("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
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
        <Alert
          severity="error"
          sx={{
            mb: 3,
            mt: 2,
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontSize: "1rem",
              fontWeight: 500,
            },
          }}
          onClose={() => setError(null)}
        >
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
          addressModalLoading={addressModalLoading}
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
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShoppingCartCheckout />
              )
            }
            sx={{
              py: 2,
              mt: 2,
              fontSize: "1.1rem",
              fontWeight: 600,
              "&:disabled": {
                opacity: 0.7,
              },
            }}
          >
            {loading ? "주문 처리 중..." : "주문 및 결제"}
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
