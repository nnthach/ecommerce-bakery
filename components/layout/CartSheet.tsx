"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";

export default function CartSheet() {
  const {
    isOpen,
    setIsOpen,
    items,
    isLoading,
    totalPrice,
    updateQuantity,
    removeItem,
  } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="flex w-3/4 flex-col sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>{t("cart.title")}</SheetTitle>
        </SheetHeader>

        {!user ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 opacity-30" />
            <p className="text-sm">{t("cart.signInRequired")}</p>
            <SheetClose asChild>
              <Link href="/signin">
                <Button variant="accent">{t("headerButton.signin")}</Button>
              </Link>
            </SheetClose>
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            {t("cart.loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 opacity-30" />
            <p className="text-sm">{t("cart.empty")}</p>
          </div>
        ) : (
          <>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto py-2 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.image_url?.[0] && (
                      <Image
                        src={item.product.image_url[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium leading-tight">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t pt-4 sm:flex-col sm:space-x-0">
              <div className="flex w-full items-center justify-between text-sm font-semibold">
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Button variant="accent" className="mt-3 w-full font-semibold">
                {t("cart.checkout")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
