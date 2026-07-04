"use client";

import { useMemo, useState } from "react";
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
import { formatToSlug } from "@/lib/utils";
import { useI18n } from "@/context/I18nContext";
import InputFormField from "@/components/custom/InputFormField";
import {
  createCategorySchema,
  CategoryFormData,
} from "@/lib/validations/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const INITIAL_FORM: CategoryFormData = {
  name_vi: "",
  name_en: "",
  description_vi: "",
  description_en: "",
};

interface CreateCategoryModalProps {
  onCreated?: () => void;
}

export default function CreateCategoryModal({
  onCreated,
}: CreateCategoryModalProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const categorySchema = useMemo(
    () => createCategorySchema(t, "createModal"),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: INITIAL_FORM,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        ...data,
        slug_vi: formatToSlug(data.name_vi),
        slug_en: formatToSlug(data.name_en),
      };

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create category");

      reset();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      alert("Không thể tạo danh mục.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"accent"} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.categoriesPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("admin.categoriesPage.createModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Name VI */}
            <InputFormField
              label={t("admin.categoriesPage.createModal.fields.nameVi")}
              placeholder="Ví dụ: Bánh mì"
              type="text"
              error={errors.name_vi?.message}
              disabled={isSubmitting}
              required
              {...register("name_vi")}
            />

            <InputFormField
              label={t("admin.categoriesPage.createModal.fields.nameEn")}
              placeholder="E.g. Bread"
              type="text"
              error={errors.name_en?.message}
              disabled={isSubmitting}
              required
              {...register("name_en")}
            />

            <InputFormField
              label={t("admin.categoriesPage.createModal.fields.descriptionVi")}
              placeholder="Mô tả ngắn về danh mục..."
              type="textarea"
              rows={2}
              error={errors.description_vi?.message}
              disabled={isSubmitting}
              required
              {...register("description_vi")}
            />

            {/* Description EN */}
            <InputFormField
              label={t("admin.categoriesPage.createModal.fields.descriptionEn")}
              placeholder="Short description about this category..."
              type="textarea"
              rows={2}
              error={errors.description_en?.message}
              disabled={isSubmitting}
              required
              {...register("description_en")}
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
                t("admin.categoriesPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
