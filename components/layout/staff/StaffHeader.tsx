"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LanguageToggle from "@/components/custom/LanguageToggle";
import { useI18n } from "@/context/I18nContext";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "dashboard",
  orders: "orders",
  staffs: "staffs",
  "store-inventories": "storeInventories",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments: ["staff", "dashboard"] or ["staff", "products", "123"]
  const crumbs = segments.slice(1).map((seg, idx) => ({
    label: BREADCRUMB_MAP[seg] ?? seg,
    href: "/" + segments.slice(0, idx + 2).join("/"),
    isLast: idx === segments.slice(1).length - 1,
  }));
  return crumbs;
}

export function StaffHeader() {
  const crumbs = useBreadcrumbs();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background px-6 backdrop-blur-sm">
      {/* Sidebar toggle */}
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumb */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link
                href="/staff/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Petit Bakery
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {t(`staff.headerBreadcrumb.${crumb.label}`)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t(`staff.headerBreadcrumb.${crumb.label}`)}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-white"
          aria-label="Thông báo"
        >
          <Bell className="h-6 w-6" />
          {/* Notification badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <LanguageToggle scrolled={true} admin={true} />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="Tài khoản"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="Staff" />
                <AvatarFallback className="bg-primary/20 text-primary hover:text-white text-xs font-semibold">
                  ST
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">Staff</p>
                <p className="text-xs text-muted-foreground">
                  staff@petitbakery.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              {t("staff.headerDropdown.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              {t("staff.headerDropdown.accountSettings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
              {t("staff.headerDropdown.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
