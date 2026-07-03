"use client";

import { supabaseBrowser } from "@/lib/supabase";
import { UserItem } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setUser = (nextUser: AuthUser | null) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");

    if (stored) {
      try {
        setUserState(JSON.parse(stored));
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem("auth_user");
      }
    }

    // No cached user — check for an active Supabase session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success && result.data?.user) {
          setUser(result.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    setUser(null);
    await supabaseBrowser.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
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
