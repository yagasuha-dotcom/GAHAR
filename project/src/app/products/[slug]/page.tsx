import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { formatIDR, discountPercent } from "@/lib/utils";
import { Star, Shield, Truck, RefreshCw } from "lucide-react";
import { BuyButton } from "./buy-button";
import { Gallery } from "./gallery";
import { ReviewForm } from "./review-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!p) return { title: "Not Found" };
  return {
    title: p.metaTitle || p.name,
    description: p.metaDescription || (p.description ?? "").slice(0, 160),
    openGraph: {
      title: p.name,
      description: (p.description ?? "").slice(0, 160),
      images: p.images?.slice(0, 1),
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!p) notFound();

  const [related, rvs] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.game, p.game), ne(products.id, p.id)))
      .limit(4),
    db.select().from(reviews).where(eq(reviews.productId, p.id)).limit(20),
  ]);

  const currentPrice = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
  const pct = discountPercent(p.price, p.discountPrice);
  const avgRating =
    rvs.length > 0 ? rvs.reduce((a, r) => a + r.rating, 0) / rvs.length : 5;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-sm text-[var(--muted)] mb-4">
          <a href="/">Beranda</a> / <a href="/products">Katalog</a> /{" "}
          <span className="text-violet-400">{p.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Gallery images={p.images || []} videoUrl={p.videoUrl} name={p.name} />

          <div>
            <div className="text-xs uppercase tracking-widest text-violet-400 font-bold">
              {p.game} {p.region && `• ${p.region}`}
            </div>
            <h1 className="text-3xl font-black mt-1">{p.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-[var(--muted)]">
                {avgRating.toFixed(1)} ({rvs.length} ulasan) • {p.soldCount} terjual
              </span>
            </div>

            <div className="mt-5 glass rounded-2xl p-5">
              {p.discountPrice && p.discountPrice < p.price ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--muted)] line-through text-lg">
                      {formatIDR(p.price)}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-white">
                      -{pct}%
                    </span>
                  </div>
                  <div className="text-4xl font-black gradient-text mt-1">
                    {formatIDR(p.discountPrice)}
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-black gradient-text">
                  {formatIDR(p.price)}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Stat label="Rank" value={p.rank || "-"} />
                <Stat label="Level" value={String(p.level || 0)} />
                <Stat label="Skin" value={String(p.skins || 0)} />
                <Stat label="Hero" value={String(p.heroes || 0)} />
                <Stat label="Item" value={String(p.items || 0)} />
                <Stat label="Diamond" value={String(p.diamonds || 0)} />
              </div>

              <div className="mt-5">
                <BuyButton
                  productId={p.id}
                  price={currentPrice}
                  stock={p.stock}
                  productName={p.name}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
                <div className="flex flex-col items-center gap-1">
                  <Shield size={16} className="text-emerald-400" /> Aman
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck size={16} className="text-cyan-400" /> Instant
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw size={16} className="text-amber-400" /> Garansi
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-bold text-lg mb-2">Deskripsi</h2>
              <p className="text-[var(--muted)] whitespace-pre-line leading-relaxed">
                {p.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-2xl font-black mb-4">Ulasan Pembeli</h2>
          <ReviewForm productId={p.id} />
          {rvs.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-[var(--muted)]">
              Belum ada ulasan untuk produk ini.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {rvs.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                      {r.userName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.userName}</div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-4">Produk Serupa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-2">
      <div className="text-[10px] uppercase text-[var(--muted)]">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
