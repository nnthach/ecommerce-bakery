import { RolePermission } from "@/components/custom/RolePermission";
import AdminLayoutClient from "@/components/layout/admin/AdminLayoutClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RolePermission allowedRoles={["admin"]}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </RolePermission>
  );
}
