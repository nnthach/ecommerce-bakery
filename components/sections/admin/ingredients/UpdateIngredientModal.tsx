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
  createIngredientSchema,
  IngredientFormData,
} from "@/lib/validations/ingredients";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputFormField from "@/components/custom/InputFormField";

interface UpdateIngredientModalProps {
  id: string;
  defaultValues: IngredientFormData;
  onUpdated?: () => void;
}

export default function UpdateIngredientModal({
  id,
  defaultValues,
  onUpdated,
}: UpdateIngredientModalProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const ingredientSchema = useMemo(
    () => createIngredientSchema(t, "updateModal"),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: IngredientFormData) => {
    try {
      const payload = {
        ...data,
        slug_vi: formatToSlug(data.name_vi),
        slug_en: formatToSlug(data.name_en),
      };

      const res = await fetch(`/api/admin/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update ingredient");

      setOpen(false);
      onUpdated?.();
    } catch (error) {
      console.error(error);
      alert("Không thể cập nhật nguyên liệu.");
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
          <DialogTitle>
            {t("admin.ingredientsPage.updateModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Name VI */}
            <InputFormField
              label={t("admin.ingredientsPage.updateModal.fields.nameVi")}
              placeholder="Ví dụ: Bột mì"
              type="text"
              error={errors.name_vi?.message}
              disabled={isSubmitting}
              required
              {...register("name_vi")}
            />

            {/* Name EN */}
            <InputFormField
              label={t("admin.ingredientsPage.updateModal.fields.nameEn")}
              placeholder="E.g. Flour"
              type="text"
              error={errors.name_en?.message}
              disabled={isSubmitting}
              required
              {...register("name_en")}
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
                t("admin.ingredientsPage.updateModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
