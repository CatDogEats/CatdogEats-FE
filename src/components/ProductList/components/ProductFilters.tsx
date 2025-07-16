import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, FormControl, FormLabel,
    RadioGroup, FormControlLabel, Radio, Divider, Button, useTheme
} from "@mui/material";
import {
    ProductFilters as ProductFiltersType,
    PET_TYPES,
    PRODUCT_TYPES,
} from "@/types/Product";

interface ProductFiltersProps {
    filters: ProductFiltersType;
    onFiltersChange: (filters: ProductFiltersType) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
                                                           filters, onFiltersChange
                                                       }) => {
    const theme = useTheme();

    // ✅ "로컬 상태"는 petType, productType만
    const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters);

    // 외부 변경시 로컬 상태 동기화
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // 로컬 필터 업데이트
    const updateLocalFilter = (key: keyof ProductFiltersType, value: any) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // 초기화
    const handleReset = () => {
        setLocalFilters({
            petType: null,
            productType: null,
        });
    };

    // 적용
    const handleApply = () => {
        onFiltersChange(localFilters);
    };

    return (
        <Paper sx={{
            p: 3, borderRadius: 3, height: "fit-content", position: "sticky", top: 20,
        }}>
            <Typography variant="h6" sx={{
                fontWeight: 700, mb: 3, color: theme.palette.text.primary,
            }}>
                상품 필터
            </Typography>

            {/* 반려동물 종류 */}
            <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{
                        fontWeight: 600, color: theme.palette.text.primary, mb: 1,
                        "&.Mui-focused": { color: theme.palette.text.primary },
                    }}>
                        반려동물 종류
                    </FormLabel>
                    <RadioGroup
                        value={localFilters.petType || ""}
                        onChange={(e) => updateLocalFilter("petType", e.target.value || null)}
                    >
                        <FormControlLabel
                            value=""
                            control={<Radio size="small" />}
                            label="전체"
                            sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                        />
                        {PET_TYPES.map((type) => (
                            <FormControlLabel
                                key={type}
                                value={type}
                                control={<Radio size="small" />}
                                label={type}
                                sx={{
                                    "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 상품 유형 */}
            <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{
                        fontWeight: 600, color: theme.palette.text.primary, mb: 1,
                        "&.Mui-focused": { color: theme.palette.text.primary },
                    }}>
                        상품 유형
                    </FormLabel>
                    <RadioGroup
                        value={localFilters.productType || ""}
                        onChange={(e) => updateLocalFilter("productType", e.target.value || null)}
                    >
                        {PRODUCT_TYPES.map((type) => (
                            <FormControlLabel
                                key={type}
                                value={type === "전체" ? "" : type}
                                control={<Radio size="small" />}
                                label={type}
                                sx={{
                                    "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Box>

            {/* 하단 버튼 */}
            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleReset}
                    sx={{
                        textTransform: "none",
                        borderColor: theme.palette.grey[300],
                        color: theme.palette.text.secondary,
                        "&:hover": {
                            borderColor: theme.palette.grey[400],
                            backgroundColor: theme.palette.grey[50],
                        },
                    }}
                >
                    초기화
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleApply}
                    sx={{
                        textTransform: "none",
                        backgroundColor: theme.palette.primary.main,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    적용
                </Button>
            </Box>
        </Paper>
    );
};

export default ProductFilters;
