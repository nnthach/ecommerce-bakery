"use client";

import { useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import InputFormField from "@/components/custom/InputFormField";
import { useI18n } from "@/context/I18nContext";
import { useFetchCity } from "@/hooks/useFetchCity";
import { ShippingFormData } from "@/lib/validations/order";

const fieldClassName =
  "flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground";

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

interface CustomerOrderInfoProps {
  register: UseFormRegister<ShippingFormData>;
  setValue: UseFormSetValue<ShippingFormData>;
  errors: FieldErrors<ShippingFormData>;
  isSubmitting: boolean;
}

export default function CustomerOrderInfo({
  register,
  setValue,
  errors,
  isSubmitting,
}: CustomerOrderInfoProps) {
  const { t } = useI18n();

  const [cityCode, setCityCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

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

  const handleCityChange = (e: FieldChangeEvent) => {
    const code = e.target.value;
    const name = cities.find((city) => String(city.code) === code)?.name ?? "";

    setCityCode(code);
    setDistrictCode("");
    setWardCode("");
    resetDistricts();
    resetWards();

    setValue("city", name, { shouldValidate: true });
    setValue("district", "");
    setValue("ward", "");

    if (code) fetchDistricts(code);
  };

  const handleDistrictChange = (e: FieldChangeEvent) => {
    const code = e.target.value;
    const name =
      districts.find((district) => String(district.code) === code)?.name ?? "";

    setDistrictCode(code);
    setWardCode("");
    resetWards();

    setValue("district", name, { shouldValidate: true });
    setValue("ward", "");

    if (code) fetchWards(code);
  };

  const handleWardChange = (e: FieldChangeEvent) => {
    const code = e.target.value;
    const name = wards.find((ward) => String(ward.code) === code)?.name ?? "";

    setWardCode(code);
    setValue("ward", name, { shouldValidate: true });
  };

  return (
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
          value={wardCode}
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
  );
}
