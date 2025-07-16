// 📁 파일 위치: src/pages/PaymentFailPage.tsx
// 🆕 새로 생성할 파일

import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Modal, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

const PaymentFailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 에러 정보 추출
  const errorCode = searchParams.get("code") || "";
  const errorMessage = searchParams.get("message") || "결제에 실패했습니다.";

  const handleRetry = () => {
    navigate("/cart"); // 장바구니로 돌아가기
  };

  return (
    <Modal open={true} onClose={() => {}}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1 }}>
          결제에 실패했습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {errorMessage}
        </Typography>
        {errorCode && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 3, display: "block" }}
          >
            오류 코드: {errorCode}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleRetry}
          fullWidth
        >
          장바구니로 돌아가기
        </Button>
      </Box>
    </Modal>
  );
};

export default PaymentFailPage;
