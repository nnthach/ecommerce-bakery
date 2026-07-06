"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";

interface CartTriggerButtonProps {
  scrolled: boolean;
}

export default function CartTriggerButton({ scrolled }: CartTriggerButtonProps) {
  const { totalItems, setIsOpen } = useCart();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      aria-label={t("cart.iconLabel")}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
        scrolled
          ? "text-charcoal hover:bg-charcoal/10"
          : "text-white hover:bg-white/10"
      }`}
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-semibold leading-none text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
