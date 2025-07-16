// Window 객체에 TossPayments 타입 추가
declare global {
  interface Window {
    TossPayments: {
      ANONYMOUS: string; // ✅ TossPayments 자체의 속성
      (clientKey: string): {
        // ✅ 함수 호출 시 반환되는 객체
        payment: (options: { customerKey: string }) => {
          requestPayment: (paymentRequest: {
            method: string;
            amount: { currency: string; value: number };
            orderId: string;
            orderName: string;
            successUrl: string;
            failUrl: string;
            customerEmail: string;
            customerName: string;
          }) => Promise<void>;
        };
      };
    };
  }
}

export {};
