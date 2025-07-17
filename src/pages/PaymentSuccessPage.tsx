// 📁 파일 위치: src/pages/PaymentSuccessPage.tsx
// 🆕 새로 생성할 파일

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Modal,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { buyerApi } from "../service/api/buyerApi";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // URL 파라미터에서 결제 정보 추출
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");

        if (!paymentKey || !orderId || !amount) {
          throw new Error("결제 정보가 올바르지 않습니다.");
        }

        // 백엔드 결제 확인 API 호출
        const response = await buyerApi.confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        setOrderNumber(response.orderNumber || "");
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "결제 확인 중 오류가 발생했습니다."
        );
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  const handleConfirm = () => {
    navigate("/account"); // 마이페이지 주문 목록으로 이동
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
        {loading ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">결제를 확인하고 있습니다...</Typography>
          </>
        ) : error ? (
          <>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              결제 확인 실패
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/cart")}
            >
              장바구니로 돌아가기
            </Button>
          </>
        ) : (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" sx={{ mb: 1 }}>
              결제가 완료되었습니다!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              주문번호: {orderNumber}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              fullWidth
            >
              주문 내역 확인하기
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default PaymentSuccessPage;
