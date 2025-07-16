"use client"

import React from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Grid,
    Box,
} from "@mui/material"
import { registerPet, updatePet } from "@/service/pet/PetAPI"

// newPet, editingPet, setNewPet 등의 타입은 부모에서 내려줌
export interface PetDialogProps {
    open: boolean
    onClose: () => void
    editingPet?: any
    newPet: any
    setNewPet: (pet: any) => void
    onSuccess?: () => void // 등록 후 부모에서 pets fetch하는 콜백
}

const PetDialog: React.FC<PetDialogProps> = ({
                                                 open,
                                                 onClose,
                                                 editingPet,
                                                 newPet,
                                                 setNewPet,
                                                 onSuccess
                                             }) => {
    // 변환하기
    const getPetCategory = (category: string) => {
        if (category === "dogs") return "DOG";
        if (category === "cats") return "CAT";
        return category; // 혹은 ""
    }
    const getGender = (gender: string) => {
        if (gender === "male") return "M";
        if (gender === "female") return "F";
        return gender; // 혹은 ""
    }
    // API에 맞춰서 필드 변환
    const buildRequest = () => ({
        name: newPet.name,
        petCategory: getPetCategory(newPet.category),
        gender: getGender(newPet.gender),
        breed: newPet.breed,
        age: Number(newPet.age),
        isAllergy: !!newPet.hasAllergies,
        healthState: newPet.healthCondition,
        requestion: newPet.specialRequests,
    })

    const validate = () => {
        if (
            !newPet.name ||
            !newPet.category ||
            !newPet.gender ||
            !newPet.age ||
            !newPet.breed
        ) {
            return false
        }
        return true
    }


    // 등록 핸들러
    const handleSubmit = async () => {
        // 먼저 유효성 체크
        if (!validate()) {
            alert("*항목 모두 입력해 주세요.")
            return
        }

        try {
            let response;
            if (editingPet) {
                // 수정
                response = await updatePet({
                    petId: editingPet.id,                       // 수정할 펫의 ID (반드시)
                    name: newPet.name,                          // 이름
                    petCategory: getPetCategory(newPet.category), // 카테고리(DOG/CAT)
                    gender: getGender(newPet.gender),           // 성별(M/F)
                    breed: newPet.breed,                        // 품종
                    age: Number(newPet.age),                    // 나이
                    isAllergy: !!newPet.hasAllergies,           // 알레르기 여부
                    healthState: newPet.healthCondition,        // 건강상태
                    requestion: newPet.specialRequests,         // 특별 요청사항
                });
            } else {
                // 등록
                response = await registerPet(buildRequest());
            }
            if (response.success) {
                alert(editingPet ? "펫 정보가 수정되었습니다." : "펫 정보가 등록되었습니다.");
                onClose();
                if (onSuccess) onSuccess();
            } else {
                alert(response.message || (editingPet ? "펫 정보 수정에 실패했습니다." : "펫 등록에 실패했습니다."));
            }
        } catch (err) {
            console.error(err);
            alert(editingPet ? "펫 정보 수정 중 오류가 발생했습니다." : "펫 등록 중 오류가 발생했습니다.");
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editingPet ? "반려동물 정보 수정" : "새 반려동물 추가"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label={
                            <span>
                                <span style={{ color: "red" }}>*</span> 이름
                            </span>
                            }
                            value={newPet.name}
                            onChange={e => setNewPet({ ...newPet, name: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl sx={{ width: "50%" }}>
                                <Select
                                    value={newPet.gender}
                                    onChange={e => setNewPet({ ...newPet, gender: e.target.value })}
                                    displayEmpty
                                >
                                    <MenuItem value=""><span style={{ color: "red" }}>*</span>성별 선택</MenuItem>
                                    <MenuItem value="male">수컷</MenuItem>
                                    <MenuItem value="female">암컷</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ width: "50%" }}>
                                <Select
                                    value={newPet.category}
                                    onChange={e => setNewPet({ ...newPet, category: e.target.value })}
                                    displayEmpty
                                    defaultValue=""
                                >
                                    <MenuItem value=""><span style={{ color: "red" }}>*</span>종 선택</MenuItem>
                                    <MenuItem value="dogs">강아지</MenuItem>
                                    <MenuItem value="cats">고양이</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label={
                                <span>
                                <span style={{ color: "red" }}>*</span> 나이
                            </span>
                            }
                            type="number"
                            value={newPet.age}
                            onChange={e => setNewPet({ ...newPet, age: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label={
                                <span>
                                <span style={{ color: "red" }}>*</span> 품종
                            </span>
                            }
                            value={newPet.breed}
                            onChange={e => setNewPet({ ...newPet, breed: e.target.value })}
                            placeholder="품종을 적어주세요"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!newPet.hasAllergies}
                                    onChange={e => setNewPet({ ...newPet, hasAllergies: e.target.checked })}
                                />
                            }
                            label="알레르기가 있습니다"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="건강상태"
                            multiline
                            rows={3}
                            value={newPet.healthCondition}
                            onChange={e => setNewPet({ ...newPet, healthCondition: e.target.value })}
                            placeholder="중성화 여부, 특별한 건강 상태 등을 입력해주세요"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="특별 요청사항"
                            multiline
                            rows={3}
                            value={newPet.specialRequests}
                            onChange={e => setNewPet({ ...newPet, specialRequests: e.target.value })}
                            placeholder="예: 작은 크기로, 부드럽게 등"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {editingPet ? "수정" : "추가"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default PetDialog