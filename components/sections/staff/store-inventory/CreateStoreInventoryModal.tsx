"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, ImageOff } from "lucide-react";
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
import { StoreInventoryFormState } from "@/types/form-type";

interface ProductOption {
  id: string;
  name: string;
  price: number;
  image_url: string[];
  is_active: boolean;
}

interface StoreInventoryRowState {
  key: string;
  product_id: string;
  quantity: string;
}

const createEmptyRow = (): StoreInventoryRowState => ({
  key: crypto.randomUUID(),
  product_id: "",
  quantity: "0",
});

interface CreateStoreInventoryModalProps {
  onCreated?: () => void;
}

export default function CreateStoreInventoryModal({
  onCreated,
}: CreateStoreInventoryModalProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<StoreInventoryRowState[]>([
    createEmptyRow(),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [fetchProductsFailed, setFetchProductsFailed] = useState(false);

  // fetch active products whenever the modal opens
  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setFetchProductsFailed(false);

        const res = await fetch(
          `/api/admin/products?is_active=true&locale=${locale}`,
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error(error);
        setFetchProductsFailed(true);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [open, locale]);

  const getAvailableProducts = (rowKey: string) => {
    const selectedElsewhere = new Set(
      rows
        .filter((row) => row.key !== rowKey && row.product_id)
        .map((row) => row.product_id),
    );
    return products.filter((product) => !selectedElsewhere.has(product.id));
  };

  // row
  const updateRow = (
    key: string,
    field: "product_id" | "quantity",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (key: string) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  // end row

  // validate
  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const seenProductIds = new Set<string>();

    rows.forEach((row) => {
      if (!row.product_id) {
        nextErrors[row.key] = t(
          "staff.storeInventoriesPage.createModal.errors.productRequired",
        );
        return;
      }

      if (seenProductIds.has(row.product_id)) {
        nextErrors[row.key] = t(
          "staff.storeInventoriesPage.createModal.errors.duplicateProduct",
        );
        return;
      }
      seenProductIds.add(row.product_id);

      const quantity = Number(row.quantity);
      if (
        row.quantity.trim() === "" ||
        Number.isNaN(quantity) ||
        quantity < 0
      ) {
        nextErrors[row.key] = t(
          "staff.storeInventoriesPage.createModal.errors.quantityInvalid",
        );
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const items: StoreInventoryFormState[] = rows.map((row) => ({
        product_id: row.product_id,
        quantity: Number(row.quantity),
      }));

      const res = await fetch("/api/staff/store-inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("Failed to create store inventory");

      setRows([createEmptyRow()]);
      setErrors({});
      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      alert(t("staff.storeInventoriesPage.createModal.errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setRows([createEmptyRow()]);
      setErrors({});
    }
    setOpen(next);
  };

  const canAddRow =
    !isLoadingProducts && rows.length < products.length && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"accent"} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("staff.storeInventoriesPage.createModal.trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("staff.storeInventoriesPage.createModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 px-1 text-xs font-medium text-muted-foreground">
              <span className="flex-1 text-sm font-medium text-foreground">
                {t("staff.storeInventoriesPage.createModal.fields.product")}
              </span>
              <span className="w-28 text-sm font-medium text-foreground">
                {t("staff.storeInventoriesPage.createModal.fields.quantity")}
              </span>
              <span className="w-8" />
            </div>

            <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {rows.map((row) => {
                const availableProducts = getAvailableProducts(row.key);
                const rowError = errors[row.key];
                const selectedProduct = products.find(
                  (product) => product.id === row.product_id,
                );

                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {selectedProduct?.image_url?.[0] ? (
                          <Image
                            src={selectedProduct.image_url[0]}
                            alt={selectedProduct.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageOff className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <select
                        value={row.product_id}
                        onChange={(e) =>
                          updateRow(row.key, "product_id", e.target.value)
                        }
                        disabled={isLoadingProducts || isSubmitting}
                        className={`flex h-10 flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background ${
                          rowError ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      >
                        <option value="">
                          {isLoadingProducts
                            ? t(
                                "staff.storeInventoriesPage.createModal.productSelect.loading",
                              )
                            : t(
                                "staff.storeInventoriesPage.createModal.productSelect.placeholder",
                              )}
                        </option>
                        {availableProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={0}
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.key, "quantity", e.target.value)
                        }
                        disabled={isSubmitting}
                        className={`flex h-10 w-28 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background ${
                          rowError ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveRow(row.key)}
                        disabled={rows.length === 1 || isSubmitting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {rowError && (
                      <span className="text-xs text-red-500">{rowError}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!isLoadingProducts &&
              !fetchProductsFailed &&
              products.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t(
                    "staff.storeInventoriesPage.createModal.productSelect.empty",
                  )}
                </p>
              )}
            {fetchProductsFailed && (
              <p className="text-xs text-red-500">
                {t(
                  "staff.storeInventoriesPage.createModal.errors.fetchProductsFailed",
                )}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleAddRow}
              disabled={!canAddRow}
            >
              <Plus className="h-4 w-4" />
              {t("staff.storeInventoriesPage.createModal.addRow")}
            </Button>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {t("staff.modal.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant={"accent"}
              disabled={isSubmitting || isLoadingProducts}
              className="min-w-24"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("staff.storeInventoriesPage.createModal.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
