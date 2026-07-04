"use client";

import { UserItem } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import PageLoader from "@/components/custom/PageLoader";
import toast from "react-hot-toast";
import { useI18n } from "./I18nContext";

export interface AuthUser extends UserItem {
  staff?: {
    id: string;
    store_id: string;
    is_active: boolean;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success && data.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      toast.success(
        locale === "vi" ? "Đăng xuất thành công!" : "Sign out successfully!",
      );
    } catch {
      toast.success(
        locale === "vi" ? "Đăng xuất thất bại!" : "Failed to sign out!",
      );
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {isLoading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("failed to init useAuth");
  }

  return context;
}
