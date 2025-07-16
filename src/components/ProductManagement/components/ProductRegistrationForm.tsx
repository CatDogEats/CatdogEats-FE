// src/components/admin/ProductRegistrationForm.tsx

import React, { useState, useRef } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel, CircularProgress,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ProductFormData, PRODUCT_CATEGORIES, PRODUCT_TYPE_OPTIONS  } from "../types/product.types.ts";
import { registerProduct, uploadProductImages } from "@/service/product/ProductAPI";

interface ProductRegistrationFormProps {
  onSubmit?: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
}

const ProductRegistrationForm: React.FC<ProductRegistrationFormProps> = ({
                                                                           onSubmit,
                                                                           initialData,
                                                                         }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    subtitle: "",
    category: "DOG",
    productType: "FINISHED",
    price: 0,
    isDiscount: false,
    discountRate: 0,
    description: "",
    ingredients: "",
    images: [],
    stockQuantity: 0,
    salesStartDate: "",
    shippingCosts: 0,
    leadTime: 0,
    isActive: true,
    ...initialData,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 할인 여부 체크박스 핸들러
  const handleDiscountCheck = (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      isDiscount: event.target.checked,
      // 체크 해제 시 할인율 0으로 초기화
      discountRate: event.target.checked ? prev.discountRate : 0,
    }));
  };

  const handleInputChange =
      (field: keyof ProductFormData) =>
          (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = event.target.value;
            setFormData((prev) => ({
              ...prev,
              [field]:
                  field === "price" ||
                  field === "stockQuantity" ||
                  field === "shippingCosts" ||
                  field === "leadTime"
                      ? Number(value) || 0
                      : value,
            }));
          };

  const handleSelectChange = (field: keyof ProductFormData) => (event: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 이미지 파일만 허용
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
    }));

    // 프리뷰 생성
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 간단한 유효성 검사
    if (!formData.productName.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (!formData.subtitle.trim()) {
      alert("상품 부제를 입력해주세요.");
      return;
    }

    if (!formData.category) {
      alert("펫 카테고리를 선택해주세요.");
      return;
    }

    if (formData.price <= 0) {
      alert("올바른 가격을 입력해주세요.");
      return;
    }

    if (!formData.description.trim()) {
      alert("상품 정보를 입력해주세요.");
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      alert("상품 이미지를 1개 이상 업로드 해주세요.");
      return;
    }

    if (formData.stockQuantity <= 0) {
      alert("재고 수량을 0 초과로 입력해주세요.");
      return;
    }
    if (formData.leadTime <= 0) {
      alert("제조 리드타임을 0 초과로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 1. 상품 등록 → productId 반환
      const productId = await registerProduct(formData);

      // 2. 이미지 업로드
      await uploadProductImages(productId, formData.images);


      alert("상품이 성공적으로 등록되었습니다.");

      // 폼 초기화
      setFormData({
        productName: "",
        subtitle: "",
        category: "DOG",
        productType: "FINISHED",
        price: 0,
        isDiscount: false,
        discountRate: 0,
        description: "",
        ingredients: "",
        images: [],
        stockQuantity: 0,
        salesStartDate: "",
        shippingCosts: 0,
        leadTime: 0,
        isActive: true,
      });
      setImagePreviews([]);

      // 상위 onSubmit 콜백 호출(필요 시)
      onSubmit?.(formData);
    } catch (err: any) {
      alert(
          err?.response?.data?.message ||
          err.message ||
          "상품 등록 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };



  return (
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* 상품명과 카테고리 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                fullWidth
                label={
                  <span>
                상품명 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                placeholder="상품명을 입력하세요"
                value={formData.productName}
                onChange={handleInputChange("productName")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/* 상품 부제 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                fullWidth
                label={
                  <span>
                상품 부제 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                placeholder="상품 부제를 입력하세요"
                value={formData.subtitle}
                onChange={handleInputChange("subtitle")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                  },
                }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>
                펫 카테고리 <span style={{ color: "#ff7c15" }}>*</span>
              </InputLabel>
              <Select
                  value={formData.category}
                  onChange={handleSelectChange("category")}
                  label={
                    <span>
                  펫 카테고리 <span style={{ color: "#ff7c15" }}>*</span>
                </span>
                  }
                  sx={{
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  }}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 완제품/수제품 선택 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>
                상품 타입 <span style={{ color: "#ff7c15" }}>*</span>
              </InputLabel>
              <Select
                  value={formData.productType}
                  onChange={handleSelectChange("productType")}
                  label={
                    <span>
                  상품 타입 <span style={{ color: "#ff7c15" }}>*</span>
                </span>
                  }
                  sx={{
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                  }}
              >
                {PRODUCT_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>


          {/* 가격 */}
          <Grid size={{ xs: 12 }}>
            <TextField
                fullWidth
                label={
                  <span>
                가격 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                type="number"
                placeholder="가격을 입력하세요 (예: 9900)"
                value={formData.price}
                onChange={handleInputChange("price")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/* 할인 여부 & 할인율 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
                control={
                  <Checkbox
                      checked={formData.isDiscount}
                      onChange={handleDiscountCheck}
                  />
                }
                label="할인 적용 여부"
                sx={{ mt: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                fullWidth
                label="할인율 (%)"
                type="number"
                placeholder="할인율을 입력하세요 (예: 10)"
                value={formData.discountRate}
                onChange={handleInputChange("discountRate")}
                disabled={!formData.isDiscount}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: formData.isDiscount ? "#f9fafb" : "#eee",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ef9942" },
                  },
                }}
            />
          </Grid>
          {/* 상품 설명 */}
          <Grid size={{ xs: 12 }}>
            <TextField
                fullWidth
                label={
                  <span>
                상품 설명 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                multiline
                rows={4}
                placeholder="상품 설명을 상세 페이지에서 보이고 싶은 형식에 맞게 입력하세요."
                value={formData.description}
                onChange={handleInputChange("description")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/* 상품 정보 */}
          <Grid size={{ xs: 12 }}>
            <TextField
                fullWidth
                label={
                  <span>
                상품 정보 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                multiline
                rows={3}
                placeholder="상품 정보를 상세 페이지에서 보이고 싶은 형식에 맞게 입력하세요."
                value={formData.ingredients}
                onChange={handleInputChange("ingredients")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/* 이미지 업로드 */}
          <Grid size={{ xs: 12 }}>
            <Typography
                variant="h6"
                sx={{ mb: 2, color: "#2d2a27", fontWeight: 600 }}
            >
              상품 이미지 <span style={{ color: "#ff7c15", marginLeft: 4 }}>*</span>
            </Typography>
            <Paper
                sx={{
                  border: "2px dashed #F5EFEA",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  backgroundColor: "white",
                  cursor: "pointer",
                  transition: "border-color 0.3s ease",
                  "&:hover": {
                    borderColor: "#ef9942",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 60, color: "#a5d6a7", mb: 2 }} />
              <Typography variant="body2" sx={{ color: "#5c5752", mb: 2 }}>
                이미지를 드래그 앤 드롭하거나 파일을 찾아보세요. (여러 이미지
                지원)
              </Typography>
              <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#a5d6a7",
                    color: "#1f2937",
                    "&:hover": {
                      backgroundColor: "#81c784",
                    },
                  }}
              >
                파일 찾아보기
              </Button>
            </Paper>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
            />

            {/* 이미지 프리뷰 */}
            {imagePreviews.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {imagePreviews.map((preview, index) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                        <Box sx={{ position: "relative" }}>
                          <Box
                              component="img"
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: "1px solid #F5EFEA",
                              }}
                          />
                          <IconButton
                              size="small"
                              onClick={() => handleImageRemove(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "rgba(0,0,0,0.7)",
                                },
                              }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                  ))}
                </Grid>
            )}
          </Grid>

          {/* 재고 수량과 판매 시작일 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                fullWidth
                label={
                  <span>
                재고 수량 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                type="number"
                placeholder="재고 수량을 입력하세요"
                value={formData.stockQuantity}
                onChange={handleInputChange("stockQuantity")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/*<Grid size={{ xs: 12, md: 6 }}>*/}
          {/*  <TextField*/}
          {/*    fullWidth*/}
          {/*    label="판매 시작일"*/}
          {/*    type="date"*/}
          {/*    value={formData.salesStartDate}*/}
          {/*    onChange={handleInputChange("salesStartDate")}*/}
          {/*    InputLabelProps={{*/}
          {/*      shrink: true,*/}
          {/*    }}*/}
          {/*    sx={{*/}
          {/*      "& .MuiOutlinedInput-root": {*/}
          {/*        backgroundColor: "#f9fafb",*/}
          {/*        borderRadius: 2,*/}
          {/*        "&:hover .MuiOutlinedInput-notchedOutline": {*/}
          {/*          borderColor: "#ef9942",*/}
          {/*        },*/}
          {/*        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {*/}
          {/*          borderColor: "#ef9942",*/}
          {/*        },*/}
          {/*      },*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/* 배송비와 리드타임 */}
          {/*<Grid size={{ xs: 12, md: 6 }}>*/}
          {/*  <TextField*/}
          {/*    fullWidth*/}
          {/*    label="배송비"*/}
          {/*    type="number"*/}
          {/*    placeholder="배송비를 입력하세요 (예: 3000)"*/}
          {/*    value={formData.shippingCosts}*/}
          {/*    onChange={handleInputChange("shippingCosts")}*/}
          {/*    InputProps={{*/}
          {/*      endAdornment: <InputAdornment position="end">원</InputAdornment>,*/}
          {/*    }}*/}
          {/*    sx={{*/}
          {/*      "& .MuiOutlinedInput-root": {*/}
          {/*        backgroundColor: "#f9fafb",*/}
          {/*        borderRadius: 2,*/}
          {/*        "&:hover .MuiOutlinedInput-notchedOutline": {*/}
          {/*          borderColor: "#ef9942",*/}
          {/*        },*/}
          {/*        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {*/}
          {/*          borderColor: "#ef9942",*/}
          {/*        },*/}
          {/*      },*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</Grid>*/}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                fullWidth
                label={
                  <span>
                제조 리드타임 <span style={{ color: "#ff7c15" }}>*</span>
              </span>
                }
                type="number"
                placeholder="리드타임(일)을 입력하세요"
                value={formData.leadTime}
                onChange={handleInputChange("leadTime")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">일</InputAdornment>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ef9942",
                    },
                  },
                }}
            />
          </Grid>

          {/* 제출 버튼 */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
              <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    backgroundColor: "#ef9942",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "#e08830",
                    },
                  }}
                  disabled={loading}
              >
                {loading ? "등록중..." : "상품 등록"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
  );
};

export default ProductRegistrationForm;
