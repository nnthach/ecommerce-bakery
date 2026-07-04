"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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

const INITIAL_FORM: StaffFormData = {
  fullname: "",
  email: "",
  dob: "",
  gender: "male",
  store_id: "",
};

interface CreateStaffModalProps {
  onCreated?: () => void;
}

export default function CreateStaffModal({ onCreated }: CreateStaffModalProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const staffSchema = useMemo(() => createStaffSchema(t, "createModal"), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: INITIAL_FORM,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // fetch stores for the select when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        const res = await fetch("/api/admin/stores?is_active=true");
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

  const storeOptions = [
    {
      value: "",
      label: isLoadingStores
        ? t("admin.staffsPage.createModal.fields.storeLoading")
        : t("admin.staffsPage.createModal.fields.storePlaceholder"),
    },
    ...stores.map((store) => ({
      value: store.id,
      label: store.name,
    })),
  ];

  const onSubmit = async (data: StaffFormData) => {
    try {
      const payload = {
        ...data,
        password: process.env.NEXT_PUBLIC_DEFAULT_STAFF_PASSWORD || "123456",
      };
      const res = await fetch("/api/admin/staffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create staff");

      reset();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      alert(
        locale === "vi" ? "Tạo nhân viên thất bại" : "Failed to create staff",
      );
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.staffsPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.staffsPage.createModal.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Fullname */}
            <InputFormField
              label={t("admin.staffsPage.createModal.fields.fullname")}
              placeholder={t(
                "admin.staffsPage.createModal.fields.fullnamePlaceholder",
              )}
              type="text"
              error={errors.fullname?.message}
              disabled={isSubmitting}
              required
              {...register("fullname")}
            />

            {/* Email */}
            <InputFormField
              label={t("admin.staffsPage.createModal.fields.email")}
              placeholder="example@email.com"
              type="email"
              error={errors.email?.message}
              disabled={isSubmitting}
              required
              {...register("email")}
            />

            {/* Date of birth */}
            <InputFormField
              label={t("admin.staffsPage.createModal.fields.dob")}
              placeholder="YYYY-MM-DD"
              type="date"
              error={errors.dob?.message}
              disabled={isSubmitting}
              required
              {...register("dob")}
            />

            {/* Gender */}
            <InputFormField
              label={t("admin.staffsPage.createModal.fields.gender")}
              type="select"
              selectData={[
                {
                  value: "male",
                  label: locale === "vi" ? "Nam" : "Male",
                },
                {
                  value: "female",
                  label: locale === "vi" ? "Nữ" : "Female",
                },
                {
                  value: "other",
                  label: locale === "vi" ? "Khác" : "Other",
                },
              ]}
              error={errors.gender?.message}
              disabled={isSubmitting}
              required
              {...register("gender")}
            />

            {/* Store */}
            <InputFormField
              label={t("admin.staffsPage.createModal.fields.store")}
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
                t("admin.staffsPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
