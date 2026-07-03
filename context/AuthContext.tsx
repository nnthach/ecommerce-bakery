"use client";

import { supabase } from "@/lib/supabase";
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
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) return;

    try {
      setUserState(JSON.parse(stored));
    } catch {
      localStorage.removeItem("auth_user");
    }
  }, []);

  const setUser = (nextUser: AuthUser | null) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
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
