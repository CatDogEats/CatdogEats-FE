// src/hooks/useBuyerData.ts

import { useState, useCallback } from "react";
import { buyerApi } from "@/service/api/buyerApi";
import type {
  PetResponse,
  AddressResponse,
  DefaultAddressResponse,
  CouponResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  ApiError,
} from "@/types/buyerApi.types";
import type { SavedPet, SavedAddress, Coupon } from "@/components/OrderPayment";

/**
 * 구매자 주문 결제 페이지용 데이터 관리 훅
 */
export const useBuyerOrderData = () => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 반려동물 정보 조회
  const loadPets = useCallback(async (): Promise<SavedPet[]> => {
    try {
      setError(null);
      const pets = await buyerApi.getPetInfo();

      // API 응답을 프론트엔드 타입으로 변환
      return pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        category: pet.category,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        hasAllergies: pet.hasAllergies,
        healthCondition: pet.healthCondition,
        specialRequests: pet.specialRequests,
        avatar: "/placeholder.svg?height=40&width=40", // 기본 아바타
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      return [];
    }
  }, []);

  // 모든 주소 정보 조회 (모달용)
  const loadAllAddresses = useCallback(async (): Promise<SavedAddress[]> => {
    try {
      setError(null);
      const addresses = await buyerApi.getAllAddresses();

      // API 응답을 프론트엔드 타입으로 변환
      return addresses.map((addr) => ({
        id: addr.id,
        label: addr.title,
        fullName: "수취인명", // API에서 제공하지 않으므로 기본값
        address: `${addr.streetAddress} ${addr.detailAddress}`.trim(),
        city: addr.city,
        postalCode: addr.postalCode,
        phoneNumber: addr.phoneNumber,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      return [];
    }
  }, []);

  // 기본 주소 정보 조회 (자동 로드용)
  const loadDefaultAddress =
    useCallback(async (): Promise<SavedAddress | null> => {
      try {
        setError(null);
        const defaultAddr = await buyerApi.getDefaultAddress();

        if (!defaultAddr) return null;

        // API 응답을 프론트엔드 타입으로 변환
        return {
          id: "default",
          label: "기본 주소",
          fullName: defaultAddr.recipientName,
          address:
            `${defaultAddr.streetAddress} ${defaultAddr.detailAddress}`.trim(),
          city: defaultAddr.city,
          postalCode: defaultAddr.postalCode,
          phoneNumber: defaultAddr.phoneNumber,
        };
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        return null;
      }
    }, []);

  // 사용 가능한 쿠폰 조회
  const loadAvailableCoupons = useCallback(async (): Promise<Coupon[]> => {
    try {
      setError(null);
      const couponData = await buyerApi.getAvailableCoupons();

      // API 응답을 프론트엔드 타입으로 변환
      return couponData.selected.map((apiCoupon) => ({
        id: apiCoupon.code,
        name: apiCoupon.couponName,
        type:
          apiCoupon.discountType === "PERCENT"
            ? ("percentage" as const)
            : ("fixed" as const),
        value: apiCoupon.discountValue,
        minAmount: 0, // API에서 제공하지 않으면 기본값
        description: apiCoupon.couponName,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      return [];
    }
  }, []);

  // 주문 생성
  const createOrder = useCallback(
    async (orderData: OrderCreateRequest): Promise<OrderCreateResponse> => {
      try {
        setLoading(true);
        setError(null);

        const response = await buyerApi.createOrder(orderData);
        return response;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 통합 데이터 로드 함수
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pets, addresses, defaultAddress, coupons] = await Promise.all([
        loadPets(),
        loadAllAddresses(),
        loadDefaultAddress(),
        loadAvailableCoupons(),
      ]);

      return {
        pets,
        addresses,
        defaultAddress,
        coupons,
      };
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      return {
        pets: [],
        addresses: [],
        defaultAddress: null,
        coupons: [],
      };
    } finally {
      setLoading(false);
    }
  }, [loadPets, loadAllAddresses, loadDefaultAddress, loadAvailableCoupons]);

  return {
    loading,
    error,
    loadPets,
    loadAllAddresses,
    loadDefaultAddress,
    loadAvailableCoupons,
    createOrder,
    loadAllData,
  };
};
