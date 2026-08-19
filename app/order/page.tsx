"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, QrCode, ShoppingBag } from "lucide-react";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import CustomerOrderInfo from "@/components/sections/order/CustomerOrderInfo";
import OrderSummary from "@/components/sections/order/OrderSummary";
import VisaIcon from "@/components/icons/VisaIcon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import { getStripe } from "@/lib/stripe/client";
import { Elements } from "@stripe/react-stripe-js";
import {
  createShippingSchema,
  ShippingFormData,
} from "@/lib/validations/order";
import CheckOutForm from "@/components/sections/order/CheckOutForm";
import toast from "react-hot-toast";

const SHIPPING_FEE = 1000;
const FREE_SHIPPING_THRESHOLD = 300000;

export default function OrderPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items, totalPrice } = useCart();

  const shippingSchema = createShippingSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: user?.full_name ?? "",
      phone: "",
      city: "",
      district: "",
      ward: "",
      address: "",
      note: "",
      paymentMethod: "",
    },
  });

  const [isVisaOpen, setIsVisaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // visa
  const handleVisaOpenChange = (open: boolean) => {
    setIsVisaOpen(open);
    if (open) setValue("paymentMethod", "visa", { shouldValidate: false });
  };
  // end visa

  // qr
  const handleQrOpenChange = (open: boolean) => {
    setIsQrOpen(open);
    if (open) setValue("paymentMethod", "qr", { shouldValidate: false });
  };
  // end qr

  const shippingFee =
    totalPrice === 0 || totalPrice >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;
  const grandTotal = totalPrice + shippingFee;

  // payload
  const createOrderPayload = (data: ShippingFormData) => ({
    name: data.name,
    phone: data.phone,
    address: data.address,
    note: data.note,
    city: data.city,
    district: data.district,
    ward: data.ward,
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
  });

  // payos submit
  const onSubmit = async (data: ShippingFormData) => {
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createOrderPayload(data),
          paymentMethod: "payos",
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error);
      }

      window.location.href = resData.data.payment_link;
    } catch (error) {
      console.error(error);
      toast.error(t("orderPage.toastError"));
    }
  };

  return (
    <div className="flex h-screen flex-col bg-sand">
      <Header forceScrolled />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-y-auto px-6 pb-4 pt-24 lg:overflow-hidden lg:pt-28">
        {!user ? (
          <div className="m-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-8 py-14 text-center shadow-sm">
            <ShoppingBag className="h-10 w-10 text-charcoal/25" />
            <h2 className="text-lg font-semibold text-charcoal">
              {t("orderPage.signInRequired.title")}
            </h2>
            <p className="text-sm text-charcoal/55">
              {t("orderPage.signInRequired.message")}
            </p>
            <Link href="/signin" className="mt-2">
              <Button variant="accent" className="font-semibold">
                {t("headerButton.signin")}
              </Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
              {/* LEFT: shipping form */}
              <div className="custom-scrollbar space-y-4 lg:col-span-3 lg:overflow-y-auto lg:pr-1">
                <CustomerOrderInfo
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  isSubmitting={isSubmitting}
                />

                <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                    {t("orderPage.payment.title")}
                  </h2>

                  <div className="mt-4 space-y-3">
                    {/* Card / Visa payment */}
                    <Collapsible
                      open={isVisaOpen}
                      onOpenChange={handleVisaOpenChange}
                      className="rounded-xl border border-charcoal/10"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left">
                        <div className="flex items-center gap-3">
                          <VisaIcon className="h-6 w-9 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-charcoal">
                              {t("orderPage.payment.visa.title")}
                            </p>
                            <p className="text-xs text-charcoal/50">
                              {t("orderPage.payment.visa.description")}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-charcoal/40 transition-transform ${
                            isVisaOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 border-t border-charcoal/10 p-4">
                        {grandTotal > 0 && (
                          <Elements
                            stripe={getStripe()}
                            options={{
                              mode: "payment",
                              amount: grandTotal,
                              currency: "vnd",
                              paymentMethodTypes: ["card"],
                            }}
                          >
                            <CheckOutForm
                              handleSubmit={handleSubmit}
                              isSubmitting={isSubmitting}
                              createOrderPayload={createOrderPayload}
                            />
                          </Elements>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* QR code / PayOS payment */}
                    <Collapsible
                      open={isQrOpen}
                      onOpenChange={handleQrOpenChange}
                      className="rounded-xl border border-charcoal/10"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left">
                        <div className="flex items-center gap-3">
                          <QrCode className="h-6 w-6 shrink-0 text-charcoal" />
                          <div>
                            <p className="text-sm font-semibold text-charcoal">
                              {t("orderPage.payment.payos.title")}
                            </p>
                            <p className="text-xs text-charcoal/50">
                              {t("orderPage.payment.payos.description")}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-charcoal/40 transition-transform ${
                            isQrOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t border-charcoal/10 p-4">
                        <Button onClick={handleSubmit(onSubmit)}>
                          Payment with PayOS
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </section>
              </div>

              {/* RIGHT: order summary */}
              <OrderSummary shippingFee={shippingFee} grandTotal={grandTotal} />
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
