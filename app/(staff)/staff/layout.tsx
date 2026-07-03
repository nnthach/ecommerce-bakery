import { RolePermission } from "@/components/custom/RolePermission";
import StaffLayoutClient from "@/components/layout/staff/StaffLayoutClient";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RolePermission allowedRoles={["staff"]}>
      <StaffLayoutClient>{children}</StaffLayoutClient>
    </RolePermission>
  );
}
