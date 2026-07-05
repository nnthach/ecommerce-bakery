"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useI18n } from "@/context/I18nContext";
import { StoreItem } from "@/types";
import InputFormField from "@/components/custom/InputFormField";
import { createStaffSchema, StaffFormData } from "@/lib/validations/staffs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface UpdateStaffModalProps {
  staffId: string;
  defaultValues: StaffFormData;
  onUpdated?: () => void;
}

export default function UpdateStaffModal({
  staffId,
  defaultValues,
  onUpdated,
}: UpdateStaffModalProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const staffSchema = useMemo(() => createStaffSchema(t, "updateModal"), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // fetch stores for the select when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        const res = await fetch("/api/admin/stores?is_active=true&limit=100");
        if (!res.ok) throw new Error("Failed to fetch stores");
        const data = await res.json();
        if (data.success && data.data) {
          setStores(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, [open]);

  const genderOptions = [
    {
      value: "male",
      label: t("admin.staffsPage.updateModal.genderOptions.male"),
    },
    {
      value: "female",
      label: t("admin.staffsPage.updateModal.genderOptions.female"),
    },
    {
      value: "other",
      label: t("admin.staffsPage.updateModal.genderOptions.other"),
    },
  ];

  const storeOptions = [
    {
      value: "",
      label: isLoadingStores
        ? t("admin.staffsPage.updateModal.fields.storeLoading")
        : t("admin.staffsPage.updateModal.fields.storePlaceholder"),
    },
    ...stores.map((store) => ({
      value: store.id,
      label: store.name,
    })),
  ];

  const onSubmit = async (data: StaffFormData) => {
    try {
      const res = await fetch(`/api/admin/staffs/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update staff");

      toast.success(
        locale === "vi"
          ? "Cập nhật nhân viên thành công!"
          : "Staff updated successfully!",
      );
      setOpen(false);
      onUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi"
          ? "Cập nhật nhân viên thất bại"
          : "Failed to update staff",
      );
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.staffsPage.updateModal.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Fullname */}
            <InputFormField
              label={t("admin.staffsPage.updateModal.fields.fullname")}
              placeholder={t(
                "admin.staffsPage.updateModal.fields.fullnamePlaceholder",
              )}
              type="text"
              error={errors.fullname?.message}
              disabled={isSubmitting}
              required
              {...register("fullname")}
            />

            {/* Email */}
            <InputFormField
              label={t("admin.staffsPage.updateModal.fields.email")}
              placeholder="example@email.com"
              type="email"
              error={errors.email?.message}
              disabled={isSubmitting}
              required
              {...register("email")}
            />

            {/* Date of birth */}
            <InputFormField
              label={t("admin.staffsPage.updateModal.fields.dob")}
              type="date"
              error={errors.dob?.message}
              disabled={isSubmitting}
              required
              {...register("dob")}
            />

            {/* Gender */}
            <InputFormField
              label={t("admin.staffsPage.updateModal.fields.gender")}
              type="select"
              selectData={genderOptions}
              error={errors.gender?.message}
              disabled={isSubmitting}
              required
              {...register("gender")}
            />

            {/* Store */}
            <InputFormField
              label={t("admin.staffsPage.updateModal.fields.store")}
              type="select"
              selectData={storeOptions}
              error={errors.store_id?.message}
              disabled={isSubmitting || isLoadingStores}
              required
              {...register("store_id")}
            />
          </div>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {t("admin.modal.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="accent"
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.staffsPage.updateModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
