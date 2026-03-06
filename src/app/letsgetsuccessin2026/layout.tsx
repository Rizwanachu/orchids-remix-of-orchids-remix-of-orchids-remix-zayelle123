"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  Ticket,
  Activity,
  Star,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  FolderOpen,
  Gift,
  Image,
  Megaphone,
  Layers,
  FileText,
  Settings2,
  Palette,
} from "lucide-react";

const navItems = [
  { href: "/letsgetsuccessin2026", label: "Dashboard", icon: LayoutDashboard },
  { href: "/letsgetsuccessin2026/orders", label: "Orders", icon: ShoppingCart },
  { href: "/letsgetsuccessin2026/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/letsgetsuccessin2026/customers", label: "Customers", icon: Users },
  { href: "/letsgetsuccessin2026/products", label: "Products", icon: Package },
  { href: "/letsgetsuccessin2026/collections", label: "Collections", icon: FolderOpen },
  { href: "/letsgetsuccessin2026/new-arrivals", label: "New Arrivals", icon: Star },
  { href: "/letsgetsuccessin2026/banners", label: "Banners", icon: Megaphone },
  { href: "/letsgetsuccessin2026/zayelle-edit", label: "Zayelle Edit", icon: Image },
  { href: "/letsgetsuccessin2026/gift-hampers", label: "Gift Hampers", icon: Gift },
  { href: "/letsgetsuccessin2026/media", label: "Media Library", icon: Image },
  { href: "/letsgetsuccessin2026/dm-testimonials", label: "DM Testimonials", icon: MessageSquare },
  { href: "/letsgetsuccessin2026/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/letsgetsuccessin2026/coupons", label: "Coupons", icon: Ticket },
  { href: "/letsgetsuccessin2026/homepage-settings", label: "Homepage Settings", icon: Settings },
  { href: "/letsgetsuccessin2026/homepage-layout", label: "Homepage Layout", icon: Layers },
  { href: "/letsgetsuccessin2026/site-settings", label: "Site Settings", icon: Settings2 },
  { href: "/letsgetsuccessin2026/theme", label: "Theme & Styling", icon: Palette },
  { href: "/letsgetsuccessin2026/page-contents", label: "Pages", icon: FileText },
  { href: "/letsgetsuccessin2026/activity", label: "Activity Log", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/letsgetsuccessin2026/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/letsgetsuccessin2026/logout", { method: "POST" });
    } catch {}
    window.location.href = "/letsgetsuccessin2026/login";
  };

  const isActive = (href: string) => {
    if (href === "/letsgetsuccessin2026") return pathname === "/letsgetsuccessin2026";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#E8E4DE] flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#E8E4DE] flex-shrink-0">
          <Link href="/letsgetsuccessin2026" className="flex items-center gap-2">
            <span className="text-[20px] font-serif font-semibold text-[#5C4B3D] tracking-tight">
              Zayelle
            </span>
            <span className="text-[11px] font-medium text-[#757575] uppercase tracking-widest">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-[#5C4B3D] text-white"
                        : "text-[#1A1A1A] hover:bg-[#F5F2ED]"
                    }`}
                  >
                    <item.icon size={18} className={active ? "text-white" : "text-[#757575]"} />
                    <span>{item.label}</span>
                    {active && <ChevronRight size={14} className="ml-auto text-white/60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-[#E8E4DE] flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#757575] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E8E4DE] flex items-center px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[#757575] hover:text-[#1A1A1A] transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden ml-3 text-[16px] font-serif font-semibold text-[#5C4B3D]">
            Zayelle Admin
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
