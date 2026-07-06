"use client";

import { Croissant, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import LanguageToggle from "../custom/LanguageToggle";
import CartSheet from "./CartSheet";
import CartTriggerButton from "./CartTriggerButton";

function getInitials(fullName: string) {
  const parts = fullName?.trim().split(/\s+/) || "";
  const initials = [parts[0], parts[parts.length - 1]]
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase());
  return initials.join("") || "U";
}

const NAV_LINKS = [
  { href: "/#story", label: "headerNav.ourStory" },
  { href: "/#bestsellers", label: "headerNav.bakedDaily" },
  { href: "/menu", label: "headerNav.menu" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "staff"
        ? "/staff/dashboard"
        : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        scrolled ? "bg-sand/90 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
        <Link href={"/"}>
          <div
            className={`flex items-center gap-2 text-xl font-bold transition-colors ${
              scrolled ? "text-charcoal" : "text-white"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber">
              <Croissant className="h-5 w-5 text-white" />
            </span>
            <span className="font-serif">Petit Bakery</span>
          </div>
        </Link>

        {/* Nav links - center */}
        <nav
          className={`hidden items-center gap-8 text-sm font-medium md:flex ${
            scrolled ? "text-charcoal/70" : "text-white/80"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                scrolled ? "hover:text-charcoal" : "hover:text-white"
              }`}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Desktop right section: cart, language, user */}
        <div className="hidden items-center gap-4 md:flex">
          <CartTriggerButton scrolled={scrolled} />

          <LanguageToggle scrolled={scrolled} />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full transition"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8 border border-amber/40">
                    <AvatarFallback className="bg-amber text-xs font-semibold text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold">{user.full_name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dashboardHref && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={dashboardHref}>
                      {t("headerDropdown.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">{t("headerDropdown.profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  {t("headerDropdown.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={"/signin"}>
              <Button variant="accent" className="font-semibold py-1" size="sm">
                {t("headerButton.signin")}
              </Button>
            </Link>
          )}
        </div>

        <CartSheet />

        {/* Mobile right section: cart + menu toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <CartTriggerButton scrolled={scrolled} />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 p-0 ${
                  scrolled
                    ? "text-charcoal hover:bg-charcoal/10"
                    : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle menu"
              >
                <Menu className="h-10 w-10" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-3/4 border-l border-charcoal/10 bg-sand text-charcoal sm:max-w-sm"
            >
              <SheetTitle className="text-left text-lg font-bold text-charcoal">
                Petit Bakery
              </SheetTitle>
              <div className="mt-6 flex">
                <LanguageToggle scrolled={scrolled} variant="dark" />
              </div>
              <nav className="mt-6 flex flex-col gap-6 text-base font-medium text-charcoal/70">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-charcoal"
                    >
                      {t(link.label)}
                    </Link>
                  </SheetClose>
                ))}

                {user ? (
                  <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-amber/40">
                        <AvatarFallback className="bg-amber text-xs font-semibold text-white">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-charcoal">
                          {user.full_name}
                        </p>
                        <p className="text-xs capitalize text-charcoal/50">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    {dashboardHref && (
                      <SheetClose asChild>
                        <Link
                          href={dashboardHref}
                          className="text-sm font-medium transition hover:text-charcoal"
                        >
                          {t("headerDropdown.dashboard")}
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Link
                        href="/profile"
                        className="text-sm font-medium transition hover:text-charcoal"
                      >
                        {t("headerDropdown.profile")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="font-semibold"
                        onClick={logout}
                      >
                        {t("headerDropdown.signOut")}
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Link href={"/signin"}>
                      <Button variant="accent" className="font-semibold">
                        {t("headerButton.signin")}
                      </Button>
                    </Link>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
