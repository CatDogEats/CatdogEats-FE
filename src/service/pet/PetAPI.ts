import { apiClient } from "@/service/auth/AuthAPI" // 인증 및 기본 설정된 axios 인스턴스 import

export interface APIResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
    path: string | null
    errors: any
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

// 1. 내 펫 등록
export interface RegisterPetRequest {
    name: any;
    petCategory: string;
    gender: string;
    breed: any;
    age: number;
    isAllergy: boolean;
    healthState: any;
    requestion: any;
}
export async function registerPet(pet: RegisterPetRequest) {
    const res = await apiClient.post("/v1/buyers/pet", pet)
    return res.data
}

// 2. 내 펫 목록 조회 (페이징)
export interface Pet {
    id: string;
    name: string;
    petCategory: "DOG" | "CAT";
    gender: "M" | "F";
    breed: string;
    age: number;
    isAllergy: boolean;
    healthState: string;
    requestion: string;
    updatedAt?: string;
}
export async function fetchPets(page = 0, size = 4): Promise<APIResponse<PageResponse<Pet>>> {
    const res = await apiClient.get<APIResponse<PageResponse<Pet>>>("/v1/buyers/pet", {
        params: { page, size }
    });
    return res.data;
}

// 3. 내 펫 정보 수정
export interface UpdatePetRequest {
    petId: string;
    name?: string;
    petCategory?: string;
    gender?: string;
    breed?: string;
    age?: number;
    isAllergy?: boolean;
    healthState?: string;
    requestion?: string;
}
export async function updatePet(data: UpdatePetRequest): Promise<APIResponse<null>> {
    const res = await apiClient.patch<APIResponse<null>>("/v1/buyers/pet", data);
    return res.data;
}

// 내 펫 정보 삭제
export async function deletePet(petId: string): Promise<APIResponse<null>> {
    const res = await apiClient.delete<APIResponse<null>>("/v1/buyers/pet", {
        data: { petId }
    });
    return res.data;
}