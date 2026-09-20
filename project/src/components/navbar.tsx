"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import {
  Sun,
  Moon,
  ShoppingBag,
  User,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Heart,
} from "lucide-react";
import { toast } from "./toaster";
import { useRouter, usePathname } from "next/navigation";

type Me = { id: number; name: string; email: string; role: string } | null;

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    toast("Berhasil logout", "success");
    router.push("/");
    router.refresh();
  }

  const nav = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Katalog" },
    { href: "/promo", label: "Promo" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_80%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white">
            C
          </span>
          <span className="gradient-text tracking-tight">CLINTSTORE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--card)] transition ${
                pathname === n.href ? "text-violet-400" : "text-[var(--muted)]"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-[var(--card)] transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/dashboard/wishlist"
            className="hidden sm:inline-flex p-2 rounded-lg hover:bg-[var(--card)] transition"
            aria-label="Wishlist"
          >
            <Heart size={18} />
          </Link>

          {me ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm font-medium"
              >
                <User size={16} />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {me.name}
                </span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl overflow-hidden">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-[var(--border)] text-sm"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  {(me.role === "ADMIN" || me.role === "SUPERADMIN") && (
                    <Link
                      href="/admin"
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-[var(--border)] text-sm text-violet-400"
                    >
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-[var(--border)] text-sm text-red-400"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm font-semibold"
            >
              <ShoppingBag size={16} /> Masuk
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--card)]"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--card)] text-sm"
            >
              {n.label}
            </Link>
          ))}
          {!me && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg btn-primary text-sm font-semibold text-center"
            >
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
