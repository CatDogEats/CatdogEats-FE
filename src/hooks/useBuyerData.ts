import { useState, useCallback } from "react";
import { buyerApi } from "@/service/api/buyerApi";
import type {
  OrderCreateRequest,
  OrderCreateResponse,
  ApiError,
} from "@/types/buyerApi.types";
import type { SavedPet, SavedAddress, Coupon } from "@/components/OrderPayment";

/**
 * 구매자 주문 결제 페이지용 데이터 관리 훅
 */
export const useBuyerOrderData = () => {
  // 로딩·에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 추가: 백엔드 데이터를 프론트엔드 형식으로 변환하는 헬퍼 함수들
  const mapPetCategoryToFrontend = (backendCategory: string): string => {
    switch (backendCategory) {
      case "DOG":
        return "dogs";
      case "CAT":
        return "cats";
      default:
        return "";
    }
  };

  const mapPetGenderToFrontend = (backendGender: string): string => {
    switch (backendGender) {
      case "M":
        return "male";
      case "F":
        return "female";
      default:
        return "";
    }
  };

  /**
   * 1) 저장된 반려동물 불러오기 (모달 버튼 클릭 시)
   */
  const loadPets = useCallback(async (): Promise<SavedPet[]> => {
    try {
      setError(null);
      const pets = await buyerApi.getPetInfo();
      return pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        category: mapPetCategoryToFrontend(pet.petCategory),
        breed: pet.breed,
        age: pet.age.toString(),
        gender: mapPetGenderToFrontend(pet.gender),
        hasAllergies: pet.isAllergy,
        healthCondition: pet.healthState,
        specialRequests: pet.requestion || "",
        avatar: "/placeholder.svg?height=40&width=40",
      }));
    } catch (err) {
      setError((err as ApiError).message);
      return [];
    }
  }, []);

  /**
   * 2) 저장된 주소 불러오기 (모달 버튼 클릭 시)
   * ✅ 수정: 백엔드 AddressResponseDto 구조에 맞춰 매핑 로직 개선
   */
  const loadAllAddresses = useCallback(async (): Promise<SavedAddress[]> => {
    try {
      setError(null);
      const addresses = await buyerApi.getAllAddresses();

      return addresses.map((addr) => ({
        id: addr.id,
        label: addr.title,
        fullName: "수취인명", // ✅ 백엔드에서 수취인명 정보가 없으므로 기본값 사용
        // ✅ 수정: district + neighborhood + streetAddress + detailAddress 조합
        address:
          `${addr.district} ${addr.neighborhood} ${addr.streetAddress} ${addr.detailAddress}`.trim(),
        city: addr.city,
        postalCode: addr.postalCode,
        phoneNumber: addr.phoneNumber,
      }));
    } catch (err) {
      const errorMessage = (err as ApiError).message;
      console.error("주소 목록 조회 실패:", errorMessage);
      setError(errorMessage);
      return [];
    }
  }, []);

  /**
   * 3) 사용 가능한 쿠폰 조회 (초기 렌더링)
   */
  const loadAvailableCoupons = useCallback(async (): Promise<Coupon[]> => {
    try {
      const couponData = await buyerApi.getAvailableCoupons();
      return couponData.selected.map((c) => ({
        id: c.code,
        name: c.couponName,
        type: c.discountType === "PERCENT" ? "percentage" : "fixed",
        value: c.discountValue,
        minAmount: 0,
        description: c.couponName,
      }));
    } catch {
      return [];
    }
  }, []);

  /**
   * 4) 주문 생성
   */
  const createOrder = useCallback(
    async (orderData: OrderCreateRequest): Promise<OrderCreateResponse> => {
      try {
        setLoading(true);
        setError(null);
        return await buyerApi.createOrder(orderData);
      } catch (err) {
        setError((err as ApiError).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 0) 초기 로딩: 쿠폰만
   */
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const coupons = await loadAvailableCoupons();
      return { coupons };
    } catch (err) {
      setError((err as ApiError).message);
      return { coupons: [] };
    } finally {
      setLoading(false);
    }
  }, [loadAvailableCoupons]);

  return {
    loading,
    error,
    loadPets,
    loadAllAddresses,
    loadAvailableCoupons,
    createOrder,
    loadAllData,
  };
};
