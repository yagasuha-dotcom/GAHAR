import Link from "next/link";
import { formatIDR, discountPercent } from "@/lib/utils";
import { Star, Zap } from "lucide-react";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  game: string;
  rank?: string | null;
  region?: string | null;
  images: string[];
  price: number;
  discountPrice?: number | null;
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  stock: number;
  soldCount?: number;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const pct = discountPercent(p.price, p.discountPrice);
  const img = p.images?.[0];
  return (
    <Link
      href={`/products/${p.slug}`}
      className="group glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-violet-900/40 to-cyan-900/40">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl opacity-30">🎮</div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {p.isFlashSale && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-500 text-white flex items-center gap-1">
              <Zap size={10} /> FLASH
            </span>
          )}
          {pct > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500 text-white">
              -{pct}%
            </span>
          )}
          {p.isBestSeller && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500 text-white flex items-center gap-1">
              <Star size={10} /> BEST
            </span>
          )}
        </div>
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">STOK HABIS</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-violet-400 font-bold">
          {p.game}
        </div>
        <div className="font-semibold text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
          {p.name}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--muted)]">
          {p.rank && <span>🏆 {p.rank}</span>}
          {p.region && <span>🌍 {p.region}</span>}
        </div>
        <div className="mt-2">
          {p.discountPrice && p.discountPrice < p.price ? (
            <>
              <div className="text-xs text-[var(--muted)] line-through">
                {formatIDR(p.price)}
              </div>
              <div className="font-bold text-cyan-400">
                {formatIDR(p.discountPrice)}
              </div>
            </>
          ) : (
            <div className="font-bold text-cyan-400">{formatIDR(p.price)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
