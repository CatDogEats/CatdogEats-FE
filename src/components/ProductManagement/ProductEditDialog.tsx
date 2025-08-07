import React, { useState, useRef } from "react";
import {
  Box, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Typography, IconButton, InputAdornment, CircularProgress
} from "@mui/material";
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { ProductFormData } from "@/service/product/ProductAPI.ts";
import { updateProduct, updateProductImage } from "@/service/product/ProductAPI.ts";

interface ProductEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: ProductFormData;
  onSuccess: () => void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
                                                               onClose, product, onSuccess
                                                             }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 이미지(url)
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || []);
  // 새로 업로드할 파일
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // 삭제할 이미지 id
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // 폼 데이터
  const [formData, setFormData] = useState<ProductFormData>({
    ...product,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ProductFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: (field === "price" || field === "stockQuantity") ? Number(value) || 0 : value
    }));
  };

  // 기존 이미지 삭제
  const handleImageRemove = (idx: number) => {
    if (idx < imageUrls.length) {
      const url = imageUrls[idx];
      const imageId = extractImageIdFromUrl(url);
      setRemovedImageIds(prev => [...prev, imageId]);
      setImageUrls(prev => prev.filter((_, i) => i !== idx));
    } else {
      // 새 파일
      const fileIdx = idx - imageUrls.length;
      setNewFiles(prev => prev.filter((_, i) => i !== fileIdx));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewFiles(prev => [...prev, ...files]);
    event.target.value = "";
  };

  // ★ 실제 imageUrl 구조에 맞게 구현 필요
  const extractImageIdFromUrl = (url: string) => {
    // 예: .../images/{imageId}.jpg
    const match = url.match(/([a-zA-Z0-9]+)(?=\.\w+$)/);
    return match ? match[1] : url;
  };

  // 저장(수정)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      // 1. 상품 정보 수정
      await updateProduct({
        productId: formData.id,
        title: formData.productName,
        petCategory: formData.category,
        productCategory: formData.productType,
        price: formData.price,
        stock: formData.stockQuantity,
      });

      // 2. 이미지 변경(있을 때만)
      if ((removedImageIds.length > 0 || newFiles.length > 0) && formData.id) {
        await updateProductImage(formData.id, removedImageIds, newFiles);
      }

      alert("상품이 수정되었습니다.");
      onClose();
      onSuccess(); // 목록 새로고침
    } catch (e: any) {
      alert(e?.message || "상품 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <Box sx={{ p: 3, minWidth: 480 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="상품명" value={formData.productName} onChange={handleInputChange("productName")} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>카테고리</InputLabel>
                <Select value={formData.category} label="카테고리"
                        onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as any }))}
                >
                  <MenuItem value="DOG">DOG</MenuItem>
                  <MenuItem value="CAT">CAT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>타입</InputLabel>
                <Select value={formData.productType} label="타입"
                        onChange={(e) => setFormData(f => ({ ...f, productType: e.target.value as any }))}
                >
                  <MenuItem value="FINISHED">FINISHED</MenuItem>
                  <MenuItem value="HANDMADE">HANDMADE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="가격" type="number" value={formData.price} onChange={handleInputChange("price")}
                         InputProps={{ endAdornment: <InputAdornment position="end">원</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="재고" type="number" value={formData.stockQuantity} onChange={handleInputChange("stockQuantity")}
                         InputProps={{ endAdornment: <InputAdornment position="end">개</InputAdornment> }} />
            </Grid>
            {/* 이미지 */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ mb: 1 }}>상품 이미지</Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                {imageUrls.map((url, idx) => (
                    <Box key={idx} sx={{ position: "relative", width: 80, height: 80 }}>
                      <Box component="img" src={url} alt={`img${idx}`} sx={{ width: 1, height: 1, objectFit: "cover", borderRadius: 1 }} />
                      <IconButton size="small" onClick={() => handleImageRemove(idx)}
                                  sx={{ position: "absolute", top: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                ))}
                {newFiles.map((file, idx) => (
                    <Box key={idx} sx={{ position: "relative", width: 80, height: 80 }}>
                      <Box component="img" src={URL.createObjectURL(file)} alt={`newimg${idx}`} sx={{ width: 1, height: 1, objectFit: "cover", borderRadius: 1 }} />
                      <IconButton size="small" onClick={() => handleImageRemove(idx + imageUrls.length)}
                                  sx={{ position: "absolute", top: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                ))}
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ height: 80 }}
                >
                  이미지 추가
                  <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose} sx={{ mr: 2 }} disabled={loading}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </Box>
        </Box>
      </form>
  );
};

export default ProductEditDialog;
