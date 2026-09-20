"use client";
import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard, ProductCardData } from "@/components/product-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ProductsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get("q") || "");
  const [game, setGame] = useState(sp.get("game") || "");
  const [rank, setRank] = useState(sp.get("rank") || "");
  const [region, setRegion] = useState(sp.get("region") || "");
  const [sort, setSort] = useState(sp.get("sort") || "latest");
  const [inStock, setInStock] = useState(sp.get("inStock") === "1");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") || "");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (game) p.set("game", game);
    if (rank) p.set("rank", rank);
    if (region) p.set("region", region);
    if (sort) p.set("sort", sort);
    if (inStock) p.set("inStock", "1");
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    router.replace(`/products?${p.toString()}`, { scroll: false });
    fetch(`/api/products?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [q, game, rank, region, sort, inStock, minPrice, maxPrice, router]);

  useEffect(() => {
    load();
  }, [load]);

  const games = [
    "Mobile Legends",
    "Genshin Impact",
    "Valorant",
    "PUBG Mobile",
    "Free Fire",
    "Honkai Star Rail",
  ];

  const reset = () => {
    setQ("");
    setGame("");
    setRank("");
    setRegion("");
    setSort("latest");
    setInStock(false);
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black">Katalog Akun Game</h1>
        <p className="text-[var(--muted)] mt-1">
          Temukan akun impianmu dari ribuan pilihan
        </p>

        {/* Search bar */}
        <div className="mt-6 flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari akun, game, atau rank..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-4 py-3 rounded-xl glass md:hidden"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-6">
          {/* Filters */}
          <aside
            className={`${showFilters ? "block" : "hidden"} md:block space-y-4`}
          >
            <div className="glass rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Filter</h3>
                <button
                  onClick={reset}
                  className="text-xs text-violet-400 flex items-center gap-1"
                >
                  <X size={12} /> Reset
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-[var(--muted)]">
                  Urutkan
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                >
                  <option value="latest">Terbaru</option>
                  <option value="bestseller">Terlaris</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-[var(--muted)]">
                  Game
                </label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                >
                  <option value="">Semua Game</option>
                  {games.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-[var(--muted)]">
                  Rank
                </label>
                <input
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="Mis. Mythic"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-[var(--muted)]">
                  Region
                </label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Mis. Asia"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-[var(--muted)]">
                  Harga
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-2 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-2 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                Hanya yang tersedia
              </label>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-3">🔍</div>
                <div className="font-bold">Produk tidak ditemukan</div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  Coba ubah filter atau kata kunci lain
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProductsInner />
    </Suspense>
  );
}
