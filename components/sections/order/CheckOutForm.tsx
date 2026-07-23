"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UseFormHandleSubmit } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import { ShippingFormData } from "@/lib/validations/order";

interface CheckOutFormProps {
  handleSubmit: UseFormHandleSubmit<ShippingFormData>;
  isSubmitting: boolean;
  totalPrice: number;
  shippingFee: number;
  grandTotal: number;
}

export default function CheckOutForm({
  handleSubmit,
  isSubmitting,
  totalPrice,
  shippingFee,
  grandTotal,
}: CheckOutFormProps) {
  const { t } = useI18n();
  const { items, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const onSubmit = async (data: ShippingFormData) => {
    if (!stripe || !elements) return;

    // submit PaymentElement trước => Stripe bắt buộc
    const { error: submitError } = await elements.submit();

    if (submitError) {
      console.error("Stripe submit error:", submitError);
      toast.error(t("orderPage.toastError"));
      return;
    }

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          address: data.address,
          note: data.note,
          city: data.city,
          district: data.district,
          ward: data.ward,
          paymentMethod: data.paymentMethod,
          subtotal: totalPrice,
          shipping_fee: shippingFee,
          total: grandTotal,
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })),
        }),
      });

      const resData = await res.json();

      if (!res.ok) throw new Error("Failed to create order");

      // confirm bên frontend
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret: resData.data.clientSecret,
        elements,
        redirect: "if_required",
      });

      if (error || paymentIntent?.status !== "succeeded") {
        router.push("/order/fail");
        return;
      }

      clearCart();
      toast.success(t("orderPage.toastSuccess"));
      router.push(`/order/success?orderId=${resData.data.id}`);
    } catch (error) {
      console.error("Create order error:", error);
      toast.error(t("orderPage.toastError"));
      router.push("/order/fail");
    }
  };

  return (
    <>
      <PaymentElement options={{ wallets: { link: "never" } }} />

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={isSubmitting || items.length === 0}
        className="w-full font-semibold"
        onClick={handleSubmit(onSubmit)}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          t("orderPage.summary.placeOrder")
        )}
      </Button>
      <p className="text-center text-xs text-charcoal/40">
        {t("orderPage.summary.disclaimer")}
      </p>
    </>
  );
}
