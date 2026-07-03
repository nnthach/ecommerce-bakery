"use client";

import { useAuth } from "@/context/AuthContext";
import { UserRoleEnum } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_HOME_PATH: Record<UserRoleEnum, string> = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/",
};

interface RolePermissionProps {
  allowedRoles: UserRoleEnum[];
  children: React.ReactNode;
}

export const RolePermission: React.FC<RolePermissionProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const hasPermission = !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!hasPermission) {
      router.replace(ROLE_HOME_PATH[user.role] ?? "/");
    }
  }, [isLoading, user, hasPermission, router]);

  if (isLoading || !hasPermission) return null;

  return <>{children}</>;
};
