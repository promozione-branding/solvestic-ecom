"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Newspaper,
  MessageSquareText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/order",
    icon: ShoppingCart,
  },
  {
    name: "Blogs",
    href: "/admin/blogs",
    icon: Newspaper,
  },
  {
    name: "Inquiries",
    href: "/admin/inquiry",
    icon: MessageSquareText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axios.post("/api/admin/logout");
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#e9dff5] bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center">
          <Image
            src="/logo/solvestic.png"
            alt="Solvestic"
            width={145}
            height={50}
            priority
            className="h-auto max-h-10 w-auto object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#292333] transition hover:bg-[#F7F2FC]"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#e9dff5] bg-white transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-[#f0e9f7] px-6">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center"
          >
            <Image
              src="/logo/solvestic.png"
              alt="Solvestic"
              width={165}
              height={55}
              priority
              className="h-auto max-h-12 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-500 hover:bg-[#F7F2FC] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all ${active
                    ? "bg-[#7D45C2] text-white! shadow-md shadow-[#7D45C2]/20"
                    : "text-[#62596D] hover:bg-[#F7F2FC] hover:text-[#7D45C2]"
                    }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {active && (
                    <ChevronRight size={16} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom profile and logout */}
        <div className="shrink-0 border-t border-[#f0e9f7] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#F7F2FC] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7D45C2] text-sm font-semibold text-white">
              SA
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#292333]">
                Super Admin
              </p>
              <p className="truncate text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <LogOut size={19} />
            )}

            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}