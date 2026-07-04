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
import {
  createIngredientSchema,
  IngredientFormData,
} from "@/lib/validations/ingredients";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import InputFormField from "@/components/custom/InputFormField";

const INITIAL_FORM: IngredientFormData = {
  name_vi: "",
  name_en: "",
};

interface CreateIngredientModalProps {
  onCreated?: () => void;
}

export default function CreateIngredientModal({
  onCreated,
}: CreateIngredientModalProps) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useI18n();

  const ingredientSchema = useMemo(
    () => createIngredientSchema(t, "createModal"),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: INITIAL_FORM,
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

      const res = await fetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create ingredient");

      toast.success(
        locale === "vi" ? "Tạo nguyên liệu thành công!" : "Ingredient created successfully!",
      );
      reset();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi" ? "Không thể tạo nguyên liệu." : "Failed to create ingredient.",
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
        <Button variant={"accent"} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.ingredientsPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin.ingredientsPage.createModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Name VI */}
            <InputFormField
              label={t("admin.ingredientsPage.createModal.fields.nameVi")}
              placeholder="Ví dụ: Bột mì"
              type="text"
              error={errors.name_vi?.message}
              disabled={isSubmitting}
              required
              {...register("name_vi")}
            />

            {/* Name EN */}
            <InputFormField
              label={t("admin.ingredientsPage.createModal.fields.nameEn")}
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
                t("admin.ingredientsPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
