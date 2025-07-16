"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Paper,
    Grid,
} from "@mui/material";
import { Add, Edit, Delete, Pets } from "@mui/icons-material";
import Pagination from "../common/Pagination";
import {
    fetchPets,
    deletePet,
    Pet,
} from "@/service/pet/PetAPI";
import PetDialog from "./PetDialog";

const ITEMS_PER_PAGE = 4;

const PetsView: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // 다이얼로그 상태
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [newPet, setNewPet] = useState<any>(null);

    // 데이터 불러오기
    const loadPets = async (pageToLoad = page) => {
        setLoading(true);
        try {
            const res = await fetchPets(pageToLoad, ITEMS_PER_PAGE);
            if (res.success) {
                setPets(res.data.content);
                setTotalPages(res.data.totalPages);
                setPage(res.data.page);
            } else {
                alert(res.message || "펫 목록 조회에 실패했습니다.");
            }
        } catch {
            alert("펫 목록 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 등록 다이얼로그 열기
    const handleAddPetClick = () => {
        setEditingPet(null);
        setNewPet({
            name: "",
            category: "",
            gender: "",
            age: "",
            breed: "",
            hasAllergies: false,
            healthCondition: "",
            specialRequests: "",
        });
        setDialogOpen(true);
    };

    // 수정 다이얼로그 열기
    const handleEditPetClick = (pet: Pet) => {
        setEditingPet(pet);
        setNewPet({
            ...pet,
            category: pet.petCategory === "DOG" ? "dogs" : "cats",
            gender: pet.gender === "M" ? "male" : "female",
            hasAllergies: pet.isAllergy,
            healthCondition: pet.healthState,
            specialRequests: pet.requestion,
        });
        setDialogOpen(true);
    };

    const handleDeletePet = async (petId: string) => {
        if (!window.confirm("정말로 삭제하시겠습니까?")) return;
        try {
            const res = await deletePet(petId);
            if (res.success) {
                alert("펫 정보가 삭제되었습니다.");
                loadPets(page);
            } else {
                alert(res.message || "펫 삭제에 실패했습니다.");
            }
        } catch {
            alert("펫 삭제 중 오류가 발생했습니다.");
        }
    };

    // 다이얼로그 등록/수정 완료 후 콜백
    const handleDialogSuccess = () => {
        setDialogOpen(false);
        loadPets(page);
    };

    const handlePageChange = (newPage: number) => {
        loadPets(newPage - 1); // 서버 0-based, UI 1-based이면 -1 필요
    };

    return (
        <Box>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <Typography variant="h4" style={{ fontWeight: "bold", color: "text.primary" }}>
                    나의 반려동물
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddPetClick}
                    disabled={loading}
                >
                    새 반려동물 추가
                </Button>
            </Box>

            {loading && (
                <Box sx={{ textAlign: "center", my: 4 }}>
                    <Typography>목록을 불러오는 중입니다...</Typography>
                </Box>
            )}
            {!loading && (
            <Grid container spacing={3}>
                {pets.map((pet) => (
                    <Grid size={{ xs: 6 }} key={pet.id}>
                        <Card style={{ height: "100%" }}>
                            <CardContent>
                                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                                    <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Pets color="primary" />
                                        <Typography variant="h6" style={{ fontWeight: 600 }}>
                                            {pet.name}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleEditPetClick(pet)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeletePet(pet.id)}>
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: 4 }}>
                                    카테고리: {pet.petCategory === "DOG" ? "강아지" : "고양이"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: 4 }}>
                                    나이: {pet.age}세 • 성별: {pet.gender === "M" ? "수컷" : "암컷"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: 4 }}>
                                    품종: {pet.breed}
                                </Typography>
                                {pet.isAllergy && (
                                    <Chip label="알레르기 있음" color="warning" size="small" style={{ marginBottom: 8 }} />
                                )}
                                {pet.healthState && (
                                    <Typography variant="body2" color="text.secondary" style={{ marginBottom: 4 }}>
                                        건강상태: {pet.healthState}
                                    </Typography>
                                )}
                                {pet.requestion && (
                                    <Typography variant="body2" color="text.secondary">
                                        특별요청: {pet.requestion}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {pets.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Paper
                            style={{
                                padding: 64,
                                textAlign: "center",
                                border: "2px dashed #d6d3d1",
                            }}
                        >
                            <Pets style={{ fontSize: 64, color: "text.secondary", marginBottom: 16 }} />
                            <Typography variant="h6" style={{ marginBottom: 8 }}>
                                등록된 반려동물이 없습니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary" style={{ marginBottom: 24 }}>
                                소중한 반려동물의 정보를 등록해보세요
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddPetClick}
                                disabled={loading}
                            >
                                첫 번째 반려동물 추가하기
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>
            )}
            {totalPages > 1 && (
                <Pagination
                    currentPage={page + 1}
                    totalItems={pets.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            )}

            {/* 등록/수정 다이얼로그 */}
            {dialogOpen && (
                <PetDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    editingPet={editingPet}
                    newPet={newPet}
                    setNewPet={setNewPet}
                    onSuccess={handleDialogSuccess}
                />
            )}
        </Box>
    );
};

export default PetsView;
