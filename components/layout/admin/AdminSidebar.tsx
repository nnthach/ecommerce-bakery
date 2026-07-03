"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Boxes,
  ChevronUp,
  Croissant,
  FlaskConical,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/I18nContext";

const NAV_MANAGEMENT = [
  { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "staffs", href: "/admin/staffs", icon: Users },
  { key: "orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "reviews", href: "/admin/reviews", icon: Star },
  { key: "customers", href: "/admin/customers", icon: Users },
];

const NAV_STORE_MANAGEMENT = [
  { key: "stores", href: "/admin/stores", icon: Store },
  { key: "storeInventories", href: "/admin/store-inventories", icon: Boxes },
];

const NAV_PRODUCTS = [
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categories", icon: Tag },
  { key: "ingredients", href: "/admin/ingredients", icon: FlaskConical },
];

function NavGroup({
  items,
  label,
  pathname,
  t,
}: {
  items: { key: string; href: string; icon: React.ElementType }[];
  label: string;
  pathname: string;
  t: (key: string) => string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const title = t(`admin.sidebar.nav.${item.key}`);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={title}
                className={cn(
                  "transition-colors",
                  isActive &&
                    "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary",
                )}
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span>{title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <Sidebar collapsible="icon">
      {/* Header - Logo */}
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <Link href="/admin/dashboard">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber flex-shrink-0">
                  <Croissant className="h-5 w-5 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-sidebar-foreground">
                    Petit Bakery
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin CMS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="custom-scrollbar">
        <NavGroup
          items={NAV_MANAGEMENT}
          label={t("admin.sidebar.groups.management")}
          pathname={pathname}
          t={t}
        />

        <SidebarSeparator />

        <NavGroup
          items={NAV_STORE_MANAGEMENT}
          label={t("admin.sidebar.groups.storeManagement")}
          pathname={pathname}
          t={t}
        />

        <SidebarSeparator />

        <NavGroup
          items={NAV_PRODUCTS}
          label={t("admin.sidebar.groups.products")}
          pathname={pathname}
          t={t}
        />
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter className="border-t border-sidebar-border pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatar.png" alt="Admin" />
                    <AvatarFallback className="rounded-lg bg-primary/20 text-primary text-xs font-semibold">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Admin</span>
                    <span className="truncate text-xs text-muted-foreground">
                      admin@petitbakery.com
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <span>{t("admin.sidebar.user.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>{t("admin.sidebar.user.account")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <span>{t("admin.sidebar.user.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
