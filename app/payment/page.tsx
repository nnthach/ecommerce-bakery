"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    if (!orderCode) {
      router.replace("/order/fail");
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `/api/order/payment-status?orderCode=${orderCode}`,
        );

        const data = await res.json();

        if (!data.success) {
          router.replace("/order/fail");
          return;
        }

        switch (data.data.status) {
          case "paid":
            router.replace(`/order/success?orderId=${data.data.order_id}`);
            break;

          case "failed":
          case "cancelled":
            router.replace(`/order/fail?orderId=${data.data.order_id}`);
            break;

          default:
            // pending -> check lại sau 2s
            setTimeout(checkPayment, 2000);
        }
      } catch (error) {
        console.error(error);
        router.replace("/order/fail");
      }
    };

    checkPayment();
  }, [orderCode, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Đang xác nhận thanh toán...</h2>

        <p className="mt-2 text-sm text-gray-500">
          Vui lòng đợi trong giây lát.
        </p>
      </div>
    </div>
  );
}
