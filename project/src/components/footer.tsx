import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-black">
              C
            </span>
            <span className="font-black gradient-text">CLINTSTORE</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Marketplace akun game modern. Cepat, aman, dan otomatis 24/7.
          </p>
        </div>
        <div>
          <h3 className="font-bold mb-3">Menu</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/products" className="hover:text-violet-400">Katalog</Link></li>
            <li><Link href="/promo" className="hover:text-violet-400">Promo</Link></li>
            <li><Link href="/blog" className="hover:text-violet-400">Blog</Link></li>
            <li><Link href="/faq" className="hover:text-violet-400">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Bantuan</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/dashboard" className="hover:text-violet-400">Dashboard</Link></li>
            <li><Link href="/login" className="hover:text-violet-400">Login</Link></li>
            <li><Link href="/register" className="hover:text-violet-400">Register</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Kontak</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>WhatsApp: +62 812-3456-7890</li>
            <li>Discord: CLINTSTORE#0001</li>
            <li>Email: hello@clintstore.id</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} CLINTSTORE. All rights reserved.
      </div>
    </footer>
  );
}
