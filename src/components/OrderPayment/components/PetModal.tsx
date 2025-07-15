"use client";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from "@mui/material";
import { Close, Pets } from "@mui/icons-material";
import type { SavedPet, PetModalProps } from "../index";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 0,
  maxHeight: "80vh",
  overflow: "hidden",
};

export default function PetModal({
  open,
  onClose,
  onSelectPet,
  savedPets,
}: PetModalProps) {
  const handleSelectPet = (pet: SavedPet) => {
    onSelectPet(pet);
    onClose();
  };

  const formatCategory = (category: string) => {
    // ✅ 수정: formatBreed → formatCategory로 이름 변경
    if (!category) return "";
    if (category === "DOG") return "강아지";
    if (category === "CAT") return "고양이";
    return category;
  };

  const formatGender = (gender: string) => {
    if (!gender) return "";
    if (gender === "M") return "수컷";
    if (gender === "F") return "암컷";
    return gender;
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="pet-modal-title">
      <Box sx={modalStyle}>
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #f3eee7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            저장된 애완동물 선택하기
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <List sx={{ p: 0 }}>
            {savedPets.map((pet) => (
              <ListItem key={pet.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectPet(pet)}
                  sx={{
                    py: 2,
                    px: 3,
                    "&:hover": {
                      backgroundColor: "#fff8f0",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={pet.avatar} sx={{ bgcolor: "primary.main" }}>
                      <Pets />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    // 이름
                    primary={
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500 }}
                        component="span"
                      >
                        {pet.name}
                      </Typography>
                    }
                    primaryTypographyProps={{ component: "span" }}
                    // 상세 (카테고리, 품종, 나이, 성별, 알레르기)
                    secondary={
                      <Box component="span">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          {formatCategory(pet.category)} {pet.breed || ""} •{" "}
                          {pet.age || ""}세 • {formatGender(pet.gender)}
                        </Typography>
                        {pet.hasAllergies && (
                          <Chip
                            component="span"
                            label="알레르기 있음"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: "0.75rem", ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: "span" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Modal>
  );
}
