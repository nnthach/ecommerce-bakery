"use client";

import { useMemo, useState } from "react";
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
import { formatToSlug } from "@/lib/utils";
import { useI18n } from "@/context/I18nContext";
import {
  createCategorySchema,
  CategoryFormData,
} from "@/lib/validations/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import InputFormField from "@/components/custom/InputFormField";

interface UpdateCategoryModalProps {
  id: string;
  defaultValues: CategoryFormData;
  onUpdated?: () => void;
}

export default function UpdateCategoryModal({
  id,
  defaultValues,
  onUpdated,
}: UpdateCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useI18n();

  const categorySchema = useMemo(
    () => createCategorySchema(t, "updateModal"),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
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

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update category");

      toast.success(
        locale === "vi" ? "Cập nhật danh mục thành công!" : "Category updated successfully!",
      );
      setOpen(false);
      onUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi" ? "Không thể cập nhật danh mục." : "Failed to update category.",
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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("admin.categoriesPage.updateModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            <InputFormField
              label={t("admin.categoriesPage.updateModal.fields.nameVi")}
              placeholder="Ví dụ: Bánh mì"
              type="text"
              error={errors.name_vi?.message}
              disabled={isSubmitting}
              required
              {...register("name_vi")}
            />

            {/* Name EN */}
            <InputFormField
              label={t("admin.categoriesPage.updateModal.fields.nameEn")}
              placeholder="E.g. Bread"
              type="text"
              error={errors.name_en?.message}
              disabled={isSubmitting}
              required
              {...register("name_en")}
            />

            {/* Description VI */}
            <InputFormField
              label={t("admin.categoriesPage.updateModal.fields.descriptionVi")}
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
              label={t("admin.categoriesPage.updateModal.fields.descriptionEn")}
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
                t("admin.categoriesPage.updateModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
