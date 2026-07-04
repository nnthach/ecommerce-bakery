"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Loader2, ImagePlus, X } from "lucide-react";
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
import { formatToSlug } from "@/lib/utils";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { useI18n } from "@/context/I18nContext";
import InputFormField from "@/components/custom/InputFormField";
import { createStoreSchema, StoreFormData } from "@/lib/validations/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const INITIAL_FORM: StoreFormData = {
  name: "",
  address_vi: "",
  address_en: "",
  city: "",
  district: "",
  phone: "",
};

interface CreateStoreModalProps {
  onCreated?: () => void;
}

export default function CreateStoreModal({ onCreated }: CreateStoreModalProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { locale, t } = useI18n();

  const storeSchema = useMemo(() => createStoreSchema(t, "createModal"), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: INITIAL_FORM,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // image
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const preview = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImagePreview(null);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // end image

  const onSubmit = async (data: StoreFormData) => {
    try {
      // upload image
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadFileToCloudinary(imageFile);
      }

      // payload
      const payload = {
        ...data,
        image_url: imageUrl,
        slug: formatToSlug(data.name),
      };

      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create store");
      toast.success(
        locale === "vi" ? "Tạo cửa hàng thành công!" : "Store created successfully!",
      );
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi" ? "Không thể tạo cửa hàng." : "Failed to create store.",
      );
    }
  };

  const resetForm = () => {
    reset(INITIAL_FORM);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"accent"} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.storesPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[700px]">
        <DialogHeader>
          <DialogTitle>{t("admin.storesPage.createModal.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 py-2 pr-1 custom-scrollbar">
            {/* Image Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t("admin.modal.image")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={handleImageClick}
                className="relative h-44 w-full cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/40 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors"
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">
                      {t("admin.modal.pickImage")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <InputFormField
              label={t("admin.storesPage.createModal.fields.name")}
              type="text"
              placeholder={
                locale == "vi" ? "Ví dụ: Cửa hàng A" : "E.g. Store A"
              }
              error={errors.name?.message}
              disabled={isSubmitting}
              required
              {...register("name")}
            />

            {/* Address VI / EN */}
            <InputFormField
              label={t("admin.storesPage.createModal.fields.addressVi")}
              type="textarea"
              rows={2}
              placeholder="Địa chỉ..."
              error={errors.address_vi?.message}
              disabled={isSubmitting}
              required
              {...register("address_vi")}
            />
            <InputFormField
              label={t("admin.storesPage.createModal.fields.addressEn")}
              type="textarea"
              rows={2}
              placeholder="Address..."
              error={errors.address_en?.message}
              disabled={isSubmitting}
              required
              {...register("address_en")}
            />

            {/* City / District */}
            <div className="grid grid-cols-2 gap-3">
              <InputFormField
                label={t("admin.storesPage.createModal.fields.city")}
                type="text"
                placeholder="Ví dụ: Hồ Chí Minh"
                disabled={isSubmitting}
                {...register("city")}
              />
              <InputFormField
                label={t("admin.storesPage.createModal.fields.district")}
                type="text"
                placeholder="Ví dụ: Quận 1"
                disabled={isSubmitting}
                {...register("district")}
              />
            </div>

            {/* Phone */}
            <InputFormField
              label={t("admin.storesPage.createModal.fields.phone")}
              type="text"
              placeholder="Ví dụ: 0901234567"
              disabled={isSubmitting}
              {...register("phone")}
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
              variant={"accent"}
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.storesPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
