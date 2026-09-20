import { db } from "@/db";
import { products, banners, testimonials, settings } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Rocket,
  Headphones,
  Star,
  ChevronRight,
} from "lucide-react";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Auto-seed on first load (dev convenience)
  try {
    await seedIfEmpty();
  } catch {}

  const [featured, newest, flash, best, heroBanners, ts, site] =
    await Promise.all([
      db
        .select()
        .from(products)
        .where(and(eq(products.isFeatured, true), eq(products.status, "AVAILABLE")))
        .orderBy(desc(products.createdAt))
        .limit(8),
      db
        .select()
        .from(products)
        .where(eq(products.status, "AVAILABLE"))
        .orderBy(desc(products.createdAt))
        .limit(8),
      db
        .select()
        .from(products)
        .where(and(eq(products.isFlashSale, true), eq(products.status, "AVAILABLE")))
        .orderBy(desc(products.createdAt))
        .limit(4),
      db
        .select()
        .from(products)
        .where(and(eq(products.isBestSeller, true), eq(products.status, "AVAILABLE")))
        .orderBy(desc(products.soldCount))
        .limit(4),
      db
        .select()
        .from(banners)
        .where(and(eq(banners.active, true), eq(banners.position, "HERO"))),
      db.select().from(testimonials).where(eq(testimonials.active, true)).limit(6),
      db.select().from(settings).where(eq(settings.key, "site")).limit(1),
    ]);

  const siteCfg = (site[0]?.value as { name?: string; tagline?: string }) || {};

  return (
    <>
      <Navbar />

      {/* Promo Marquee */}
      <div className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0">
              <span>🔥 FLASH SALE 12.12 diskon hingga 70%</span>
              <span>💎 Kode <b>WELCOME10</b> untuk diskon 10%</span>
              <span>⚡ Pengiriman otomatis 24/7</span>
              <span>🛡️ Garansi akun 100% aman</span>
              <span>🎮 Ribuan akun premium siap kirim</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold text-violet-300 mb-4">
                <Zap size={12} /> Trusted by 10.000+ gamers
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Beli Akun Game <br />
                <span className="gradient-text">Aman & Instan</span>
              </h1>
              <p className="mt-4 text-[var(--muted)] text-lg max-w-xl">
                {siteCfg.tagline || "Toko Akun Game #1 Indonesia"}. Pembayaran
                mudah, pengiriman otomatis setelah bayar. Ribuan akun premium
                menanti kamu.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-xl btn-primary font-bold inline-flex items-center gap-2"
                >
                  Belanja Sekarang <ChevronRight size={18} />
                </Link>
                <Link
                  href="/promo"
                  className="px-6 py-3 rounded-xl glass font-bold inline-flex items-center gap-2"
                >
                  Lihat Promo
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-4 gap-4 max-w-lg">
                {[
                  { n: "10K+", l: "Customer" },
                  { n: "5K+", l: "Akun Terjual" },
                  { n: "4.9", l: "Rating" },
                  { n: "24/7", l: "Support" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="text-2xl font-black gradient-text">{s.n}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-6 rotate-1 hover:rotate-0 transition-transform">
                {heroBanners[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroBanners[0].imageUrl || ""}
                    alt={heroBanners[0].title}
                    className="rounded-2xl w-full aspect-[16/10] object-cover"
                  />
                )}
                <div className="mt-4">
                  <div className="text-xs font-bold text-violet-400">
                    FEATURED PROMO
                  </div>
                  <div className="text-xl font-bold mt-1">
                    {heroBanners[0]?.title || "Mega Sale"}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {heroBanners[0]?.subtitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { i: Rocket, t: "Pengiriman Instan", d: "Akun otomatis setelah bayar" },
          { i: ShieldCheck, t: "100% Aman", d: "Garansi akun terjamin" },
          { i: Zap, t: "Harga Terbaik", d: "Diskon hingga 70%" },
          { i: Headphones, t: "Support 24/7", d: "Kami siap membantu" },
        ].map((f, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <f.i className="text-violet-400 mb-2" size={28} />
            <div className="font-bold">{f.t}</div>
            <div className="text-sm text-[var(--muted)]">{f.d}</div>
          </div>
        ))}
      </section>

      {/* Flash Sale */}
      {flash.length > 0 && (
        <Section title="⚡ Flash Sale" subtitle="Diskon spesial waktu terbatas!" href="/promo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flash.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Popular Games */}
      <Section title="🎮 Game Populer">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            "Mobile Legends",
            "Genshin Impact",
            "Valorant",
            "PUBG Mobile",
            "Free Fire",
            "Honkai Star Rail",
          ].map((g) => (
            <Link
              key={g}
              href={`/products?game=${encodeURIComponent(g)}`}
              className="glass rounded-xl aspect-square flex flex-col items-center justify-center text-center p-3 hover:scale-105 transition"
            >
              <div className="text-3xl mb-1">🎮</div>
              <div className="text-xs font-semibold">{g}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      {featured.length > 0 && (
        <Section title="⭐ Produk Unggulan" href="/products">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Best Seller */}
      {best.length > 0 && (
        <Section title="🔥 Best Seller">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {best.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Newest */}
      <Section title="🆕 Produk Terbaru" href="/products">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newest.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="💬 Kata Mereka">
        <div className="grid md:grid-cols-3 gap-4">
          {ts.map((t) => (
            <div key={t.id} className="glass rounded-2xl p-5">
              <div className="flex gap-1 mb-2 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                &ldquo;{t.message}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatarUrl || ""}
                  alt={t.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-[var(--muted)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="❓ Pertanyaan Umum">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "Bagaimana cara membeli akun?",
              a: "Pilih produk → checkout → bayar → akun otomatis dikirim ke email.",
            },
            {
              q: "Apakah aman?",
              a: "Sangat aman. Kami menggunakan enkripsi & sistem pembayaran terpercaya.",
            },
            {
              q: "Berapa lama pengiriman?",
              a: "Otomatis instan setelah pembayaran berhasil dikonfirmasi.",
            },
            {
              q: "Bisa refund?",
              a: "Bisa jika akun bermasalah dalam 24 jam setelah pembelian.",
            },
          ].map((f, i) => (
            <details key={i} className="glass rounded-xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <ChevronRight
                  className="group-open:rotate-90 transition"
                  size={16}
                />
              </summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Footer />
    </>
  );
}

function Section({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm text-violet-400 hover:underline inline-flex items-center gap-1"
          >
            Lihat semua <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
