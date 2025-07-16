// 결제 확인 요청 타입
export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// 결제 확인 응답 타입
export interface PaymentConfirmResponse {
  paymentId: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "CANCELLED";
  paidAt?: string;
  tossPaymentKey?: string;
  message: string;
}
