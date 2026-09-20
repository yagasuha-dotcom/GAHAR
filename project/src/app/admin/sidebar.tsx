"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  Image as ImageIcon,
  Settings,
  FileText,
  Tag,
  MessageSquare,
} from "lucide-react";

const items = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", label: "Produk", icon: Package },
  { key: "orders", href: "/admin/orders", label: "Order", icon: ShoppingCart },
  { key: "customers", href: "/admin/customers", label: "Customer", icon: Users },
  { key: "coupons", href: "/admin/coupons", label: "Voucher", icon: Ticket },
  { key: "banners", href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { key: "articles", href: "/admin/articles", label: "Artikel", icon: FileText },
  { key: "promo", href: "/admin/promo", label: "Promo", icon: Tag },
  { key: "testimonials", href: "/admin/testimonials", label: "Testimoni", icon: MessageSquare },
  { key: "settings", href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="glass rounded-2xl p-3 h-fit sticky top-20">
      <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold px-3 py-2">
        Admin Panel
      </div>
      <nav className="space-y-0.5 text-sm">
        {items.map((i) => (
          <Link
            key={i.key}
            href={i.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              active === i.key
                ? "bg-violet-500/20 text-violet-400 font-semibold"
                : "hover:bg-[var(--border)] text-[var(--muted)]"
            }`}
          >
            <i.icon size={16} /> {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
