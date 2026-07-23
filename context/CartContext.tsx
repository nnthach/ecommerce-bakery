"use client";

import { CartItem } from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useI18n } from "./I18nContext";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/cart?locale=${locale}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items ?? []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, locale]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, quantity = 1) => {
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      await refreshCart();
      toast.success(
        locale === "vi" ? "Đã thêm vào giỏ hàng!" : "Added to cart!",
      );
    } catch (error) {
      console.error(error);
      toast.error(
        locale === "vi"
          ? "Không thể thêm vào giỏ hàng."
          : "Failed to add to cart.",
      );
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const prevItems = items;
    setItems((curr) =>
      curr.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
    } catch (error) {
      console.error(error);
      setItems(prevItems);
      toast.error(
        locale === "vi"
          ? "Không thể cập nhật số lượng."
          : "Failed to update quantity.",
      );
    }
  };

  const removeItem = async (itemId: string) => {
    const prevItems = items;
    setItems((curr) => curr.filter((item) => item.id !== itemId));

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
    } catch (error) {
      console.error(error);
      setItems(prevItems);
      toast.error(
        locale === "vi" ? "Không thể xóa sản phẩm." : "Failed to remove item.",
      );
    }
  };

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("failed to init useCart");
  }

  return context;
}
