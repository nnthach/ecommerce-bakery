"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import InputFormField from "@/components/custom/InputFormField";
import VisaIcon from "@/components/icons/VisaIcon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import { useFetchCity } from "@/hooks/useFetchCity";
import {
  createShippingSchema,
  ShippingFormData,
} from "@/lib/validations/order";

const SHIPPING_FEE = 15000;
const FREE_SHIPPING_THRESHOLD = 300000;

const fieldClassName =
  "flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground";

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export default function OrderPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items, isLoading, totalPrice, updateQuantity, removeItem } =
    useCart();

  const shippingSchema = createShippingSchema(t);

  const {
    register,
    handleSubmit,
    watch,
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
      paymentMethod: "visa",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const cityCode = watch("city");
  const districtCode = watch("district");

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isVisaOpen, setIsVisaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const {
    cities,
    districts,
    wards,
    isCitiesLoading,
    isDistrictsLoading,
    isWardsLoading,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
    citySelectData,
    districtSelectData,
    wardSelectData,
  } = useFetchCity(t, cityCode, districtCode);

  // city
  const handleCityChange = (e: FieldChangeEvent) => {
    const code = e.target.value;
    setValue("city", code, { shouldValidate: true });
    setValue("district", "");
    setValue("ward", "");
    resetDistricts();
    resetWards();
    if (code) fetchDistricts(code);
  };

  const handleDistrictChange = (e: FieldChangeEvent) => {
    const code = e.target.value;
    setValue("district", code, { shouldValidate: true });
    setValue("ward", "");
    resetWards();
    if (code) fetchWards(code);
  };

  const handleWardChange = (e: FieldChangeEvent) => {
    setValue("ward", e.target.value, { shouldValidate: true });
  };
  // end city

  // visa
  const handleVisaOpenChange = (open: boolean) => {
    setIsVisaOpen(open);
    if (open) setValue("paymentMethod", "visa", { shouldValidate: false });
  };

  const handleQrOpenChange = (open: boolean) => {
    setIsQrOpen(open);
    if (open) setValue("paymentMethod", "qr", { shouldValidate: false });
  };

  const handleCardNumberChange = (e: FieldChangeEvent) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setValue("cardNumber", formatted, { shouldValidate: true });
  };

  const handleCardExpiryChange = (e: FieldChangeEvent) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setValue("cardExpiry", formatted, { shouldValidate: true });
  };

  const handleCardCvcChange = (e: FieldChangeEvent) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue("cardCvc", digits, { shouldValidate: true });
  };
  // end visa

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  const shippingFee =
    totalPrice === 0 || totalPrice >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;
  const grandTotal = totalPrice + shippingFee;

  // submit
  const onSubmit = async (data: ShippingFormData) => {
    if (data.paymentMethod === "qr") {
      toast(t("orderPage.payment.payos.comingSoon"));
      return;
    }

    const cityName =
      cities.find((city) => String(city.code) === data.city)?.name ?? data.city;
    const districtName =
      districts.find((district) => String(district.code) === data.district)
        ?.name ?? data.district;
    const wardName =
      wards.find((ward) => String(ward.code) === data.ward)?.name ?? data.ward;

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Order preview:", {
      ...data,
      city: cityName,
      district: districtName,
      ward: wardName,
      items,
      total: grandTotal,
    });
    toast.success(t("orderPage.toastSuccess"));
    setIsOrderPlaced(true);
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
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
              {/* LEFT: shipping form */}
              <div className="custom-scrollbar space-y-4 lg:col-span-3 lg:overflow-y-auto lg:pr-1">
                <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                    {t("orderPage.info.title")}
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <InputFormField
                        label={t("orderPage.info.fullName")}
                        type="text"
                        placeholder={t("orderPage.info.fullNamePlaceholder")}
                        required
                        disabled={isSubmitting}
                        error={errors.name?.message}
                        className={fieldClassName}
                        {...register("name")}
                      />
                    </div>
                    <InputFormField
                      label={t("orderPage.info.phone")}
                      type="text"
                      placeholder={t("orderPage.info.phonePlaceholder")}
                      required
                      disabled={isSubmitting}
                      error={errors.phone?.message}
                      className={fieldClassName}
                      {...register("phone")}
                    />
                    <InputFormField
                      label={t("orderPage.info.city")}
                      type="select"
                      name="city"
                      selectData={citySelectData}
                      value={cityCode}
                      onChange={handleCityChange}
                      required
                      disabled={isSubmitting || isCitiesLoading}
                      error={errors.city?.message}
                      className={fieldClassName}
                    />
                    <InputFormField
                      label={t("orderPage.info.district")}
                      type="select"
                      name="district"
                      selectData={districtSelectData}
                      value={districtCode}
                      onChange={handleDistrictChange}
                      required
                      disabled={isSubmitting || !cityCode || isDistrictsLoading}
                      error={errors.district?.message}
                      className={fieldClassName}
                    />
                    <InputFormField
                      label={t("orderPage.info.ward")}
                      type="select"
                      name="ward"
                      selectData={wardSelectData}
                      value={watch("ward")}
                      onChange={handleWardChange}
                      required
                      disabled={isSubmitting || !districtCode || isWardsLoading}
                      error={errors.ward?.message}
                      className={fieldClassName}
                    />
                    <div className="sm:col-span-2">
                      <InputFormField
                        label={t("orderPage.info.address")}
                        type="text"
                        placeholder={t("orderPage.info.addressPlaceholder")}
                        required
                        disabled={isSubmitting}
                        error={errors.address?.message}
                        className={fieldClassName}
                        {...register("address")}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InputFormField
                        label={t("orderPage.info.note")}
                        type="textarea"
                        rows={2}
                        placeholder={t("orderPage.info.notePlaceholder")}
                        disabled={isSubmitting}
                        error={errors.note?.message}
                        className={fieldClassName}
                        {...register("note")}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                    {t("orderPage.payment.title")}
                  </h2>

                  {isOrderPlaced ? (
                    <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-amber/40 bg-amber/5 p-4 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                      <p className="text-sm font-semibold text-charcoal">
                        {t("orderPage.summary.paymentSuccess")}
                      </p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatPrice(grandTotal)}
                      </p>
                      <p className="text-xs text-charcoal/40">
                        {t("orderPage.summary.disclaimer")}
                      </p>
                    </div>
                  ) : (
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
                          <InputFormField
                            label={t("orderPage.payment.visa.cardNumber")}
                            type="text"
                            name="cardNumber"
                            placeholder={t(
                              "orderPage.payment.visa.cardNumberPlaceholder",
                            )}
                            required
                            disabled={isSubmitting}
                            error={errors.cardNumber?.message}
                            className={fieldClassName}
                            value={watch("cardNumber")}
                            onChange={handleCardNumberChange}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <InputFormField
                              label={t("orderPage.payment.visa.cardExpiry")}
                              type="text"
                              name="cardExpiry"
                              placeholder={t(
                                "orderPage.payment.visa.cardExpiryPlaceholder",
                              )}
                              required
                              disabled={isSubmitting}
                              error={errors.cardExpiry?.message}
                              className={fieldClassName}
                              value={watch("cardExpiry")}
                              onChange={handleCardExpiryChange}
                            />
                            <InputFormField
                              label={t("orderPage.payment.visa.cardCvc")}
                              type="text"
                              name="cardCvc"
                              placeholder={t(
                                "orderPage.payment.visa.cardCvcPlaceholder",
                              )}
                              required
                              disabled={isSubmitting}
                              error={errors.cardCvc?.message}
                              className={fieldClassName}
                              value={watch("cardCvc")}
                              onChange={handleCardCvcChange}
                            />
                          </div>

                          <Button
                            type="submit"
                            variant="accent"
                            size="lg"
                            disabled={isSubmitting || items.length === 0}
                            className="w-full font-semibold"
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
                          <p className="text-center text-sm text-charcoal/50">
                            {t("orderPage.payment.payos.comingSoon")}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT: order summary */}
              <div className="lg:col-span-2 lg:h-full">
                <div className="flex h-full flex-col rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-charcoal">
                      {t("orderPage.summary.title")}
                    </h2>
                    {items.length > 0 && (
                      <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs font-semibold text-charcoal/60">
                        {t("orderPage.summary.itemCount").replace(
                          "{count}",
                          String(items.length),
                        )}
                      </span>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-sm text-charcoal/50">
                      {t("cart.loading")}
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <ShoppingBag className="h-9 w-9 text-charcoal/20" />
                      <p className="text-sm text-charcoal/55">
                        {t("orderPage.summary.empty")}
                      </p>
                      <Link href="/menu">
                        <Button type="button" variant="outline" size="sm">
                          {t("orderPage.summary.browseMenu")}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="custom-scrollbar mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-charcoal/5">
                              {item.product.image_url?.[0] && (
                                <Image
                                  src={item.product.image_url[0]}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                              <p className="text-sm font-medium leading-tight text-charcoal">
                                {item.product.name}
                              </p>
                              <p className="text-sm text-charcoal/55">
                                {formatPrice(item.product.price)}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      Math.max(1, item.quantity - 1),
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 shrink-0 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
                        <div className="flex items-center justify-between text-charcoal/70">
                          <span>{t("orderPage.summary.subtotal")}</span>
                          <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-charcoal/70">
                          <span>{t("orderPage.summary.shippingFee")}</span>
                          <span>
                            {shippingFee === 0
                              ? t("orderPage.summary.free")
                              : formatPrice(shippingFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-charcoal/15 pt-3 text-base font-bold text-charcoal">
                          <span>{t("orderPage.summary.total")}</span>
                          <span className="text-amber-600">
                            {formatPrice(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
