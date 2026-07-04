"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { CategoryItem, IngredientItem } from "@/types";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { useI18n } from "@/context/I18nContext";
import {
  createProductSchema,
  ProductFormData,
} from "@/lib/validations/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const INITIAL_FORM: ProductFormData = {
  name_vi: "",
  description_vi: "",
  name_en: "",
  description_en: "",
  price: 0,
  category_id: "",
  ingredient_ids: [],
};

const inputCls =
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface CreateProductModalProps {
  onCreated?: () => void;
}

export default function CreateProductModal({
  onCreated,
}: CreateProductModalProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch category & ingredient
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const { locale, t } = useI18n();

  const productSchema = useMemo(
    () => createProductSchema(t, "createModal"),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: INITIAL_FORM,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const ingredientIds = watch("ingredient_ids");

  useEffect(() => {
    if (!open) return;
    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const [catRes, ingRes] = await Promise.all([
          fetch("/api/admin/categories?is_active=true&sort_by=name&order=asc"),
          fetch("/api/admin/ingredients?is_active=true&sort_by=name&order=asc"),
        ]);
        const catJson = await catRes.json();
        const ingJson = await ingRes.json();
        if (catJson.success) setCategories(catJson.data);
        if (ingJson.success) setIngredients(ingJson.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, [open]);
  // end fetch category & ingredient

  // choose ingredient
  const toggleIngredient = (id: string) => {
    setValue(
      "ingredient_ids",
      ingredientIds.includes(id)
        ? ingredientIds.filter((i) => i !== id)
        : [...ingredientIds, id],
    );
  };

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

  const onSubmit = async (data: ProductFormData) => {
    try {
      // upload image
      let imageUrls: string[] = [];

      if (imageFile) {
        const imageUrl = await uploadFileToCloudinary(imageFile);
        imageUrls = [imageUrl];
      }

      // payload
      const payload = {
        ...data,
        image_url: imageUrls,
        slug_vi: formatToSlug(data.name_vi),
        slug_en: formatToSlug(data.name_en),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      toast.success(
        locale === "vi" ? "Tạo sản phẩm thành công!" : "Product created successfully!",
      );
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi" ? "Không thể tạo sản phẩm." : "Failed to create product.",
      );
    }
  };

  const resetForm = () => {
    reset(INITIAL_FORM);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
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
          {t("admin.productsPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("admin.productsPage.createModal.title")}</DialogTitle>
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
                className="relative h-44 w-full cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/40 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors hover:border-primary/60 hover:bg-muted/50"
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

            {/* Name VI / EN */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label={t("admin.productsPage.createModal.fields.nameVi")}
                required
                error={errors.name_vi?.message}
              >
                <input
                  placeholder="Ví dụ: Bánh mì"
                  disabled={isSubmitting}
                  className={inputCls}
                  {...register("name_vi")}
                />
              </Field>
              <Field
                label={t("admin.productsPage.createModal.fields.nameEn")}
                required
                error={errors.name_en?.message}
              >
                <input
                  placeholder="E.g: Bread"
                  disabled={isSubmitting}
                  className={inputCls}
                  {...register("name_en")}
                />
              </Field>
            </div>

            {/* Price */}
            <Field
              label={t("admin.productsPage.createModal.fields.price")}
              required
              error={errors.price?.message}
            >
              <input
                type="number"
                min={0}
                placeholder="0"
                disabled={isSubmitting}
                className={inputCls}
                {...register("price", { valueAsNumber: true })}
              />
            </Field>

            {/* Description VI / EN */}
            <Field
              label={t("admin.productsPage.createModal.fields.descriptionVi")}
            >
              <textarea
                rows={3}
                placeholder="Mô tả..."
                disabled={isSubmitting}
                className={inputCls}
                {...register("description_vi")}
              />
            </Field>
            <Field
              label={t("admin.productsPage.createModal.fields.descriptionEn")}
            >
              <textarea
                rows={3}
                placeholder="Description..."
                disabled={isSubmitting}
                className={inputCls}
                {...register("description_en")}
              />
            </Field>

            {/* Category */}
            <Field
              label={t("admin.productsPage.createModal.fields.category")}
              required
              error={errors.category_id?.message}
            >
              {loadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.modal.loading")}
                </div>
              ) : (
                <select
                  disabled={isSubmitting}
                  className={inputCls}
                  {...register("category_id")}
                >
                  <option value="">
                    {t(
                      "admin.productsPage.createModal.fields.categoryPlaceholder",
                    )}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name[locale]}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            {/* Ingredients */}
            <Field
              label={t("admin.productsPage.createModal.fields.ingredients")}
              required
            >
              {loadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.modal.loading")}
                </div>
              ) : ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">
                  {t("admin.productsPage.createModal.fields.noIngredients")}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => {
                    const selected = ingredientIds.includes(ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredient(ing.id)}
                        disabled={isSubmitting}
                        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {ing.name[locale]}
                      </button>
                    );
                  })}
                </div>
              )}
              {ingredientIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === "vi"
                    ? `Đã chọn: ${ingredientIds.length} nguyên liệu`
                    : `Selected: ${ingredientIds.length} ingredients`}
                </p>
              )}
            </Field>
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
                t("admin.productsPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
