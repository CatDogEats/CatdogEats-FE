// src/components/OrderPayment/components/PetInformationForm.tsx
"use client";

import type React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
} from "@mui/material";
import { Pets } from "@mui/icons-material";
import type { PetInformationFormProps } from "../types/orderPayment.types";

const PetInformationForm: React.FC<PetInformationFormProps> = ({
  petInfo,
  onPetInfoChange,
  onOpenPetModal,
}) => {
  return (
    <Card
      style={{ marginBottom: 32, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <CardContent style={{ padding: 32 }}>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            style={{ fontWeight: 600, color: "#1b150e" }}
          >
            반려동물 정보
          </Typography>
          <Button
            startIcon={<Pets />}
            color="primary"
            variant="text"
            size="small"
            onClick={onOpenPetModal}
            style={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            저장된 반려동물 불러오기
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="이름"
              value={petInfo.name}
              onChange={(e) => onPetInfoChange("name", e.target.value)}
              placeholder="반려동물 이름을 입력하세요"
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth>
              <InputLabel>종류</InputLabel>
              <Select
                value={petInfo.category}
                label="종류"
                onChange={(e) => onPetInfoChange("category", e.target.value)}
              >
                <MenuItem value="dogs">강아지</MenuItem>
                <MenuItem value="cats">고양이</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="품종"
              value={petInfo.breed}
              onChange={(e) => onPetInfoChange("breed", e.target.value)}
              placeholder="품종을 입력하세요"
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="나이"
              value={petInfo.age}
              onChange={(e) => onPetInfoChange("age", e.target.value)}
              placeholder="나이를 입력하세요"
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth>
              <InputLabel>성별</InputLabel>
              <Select
                value={petInfo.gender}
                label="성별"
                onChange={(e) => onPetInfoChange("gender", e.target.value)}
              >
                <MenuItem value="male">수컷</MenuItem>
                <MenuItem value="female">암컷</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={petInfo.hasAllergies}
                  onChange={(e) =>
                    onPetInfoChange("hasAllergies", e.target.checked)
                  }
                  color="primary"
                />
              }
              label="알레르기 있음"
              style={{ marginTop: 8 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="건강 상태"
              value={petInfo.healthCondition}
              onChange={(e) =>
                onPetInfoChange("healthCondition", e.target.value)
              }
              placeholder="건강 상태를 입력하세요 (예: 중성화 완료, 건강함)"
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="특별 요청사항"
              value={petInfo.specialRequests}
              onChange={(e) =>
                onPetInfoChange("specialRequests", e.target.value)
              }
              placeholder="특별한 요청사항이 있으시면 입력하세요"
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PetInformationForm;
