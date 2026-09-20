"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatIDR } from "@/lib/utils";
import { toast } from "@/components/toaster";
import { CreditCard, Wallet, QrCode } from "lucide-react";

type P = {
  id: number;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number | null;
  game: string;
};

function CheckoutInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const productId = parseInt(sp.get("productId") || "0");
  const [product, setProduct] = useState<P | null>(null);
  const [me, setMe] = useState<{ email: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"QRIS" | "BANK_TRANSFER" | "EWALLET">("QRIS");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setMe(d.user);
          setName(d.user.name);
          setEmail(d.user.email);
        }
      });
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.items.find((x: P) => x.id === productId);
        setProduct(p);
      });
  }, [productId]);

  async function submit() {
    if (!name || !email) {
      toast("Lengkapi data terlebih dahulu", "error");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        customerName: name,
        customerEmail: email,
        paymentMethod: method,
        couponCode: coupon || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      toast("Order dibuat! Silakan bayar.", "success");
      router.push(`/orders/${data.orderCode}`);
    } else {
      toast(data.error || "Gagal membuat order", "error");
    }
  }

  if (!productId) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto p-10 text-center">
          <h1 className="text-xl font-bold">Produk tidak dipilih</h1>
          <a href="/products" className="text-violet-400 mt-4 inline-block">
            Kembali ke katalog
          </a>
        </div>
        <Footer />
      </>
    );
  }

  const price = product
    ? product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price
    : 0;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-black mb-1">Checkout</h1>
        <p className="text-[var(--muted)] mb-6">Selesaikan pembelian kamu</p>

        <div className="grid md:grid-cols-[1fr_360px] gap-6">
          {/* Left form */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h2 className="font-bold mb-3">Data Pembeli</h2>
              {!me && (
                <p className="text-xs text-amber-400 mb-3">
                  💡 <a href="/login" className="underline">Login</a> untuk simpan riwayat pesanan
                </p>
              )}
              <label className="block text-sm">
                Nama
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
                />
              </label>
              <label className="block text-sm mt-3">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
                />
              </label>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-bold mb-3">Metode Pembayaran</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "QRIS", i: QrCode, l: "QRIS" },
                  { v: "BANK_TRANSFER", i: CreditCard, l: "Bank" },
                  { v: "EWALLET", i: Wallet, l: "E-Wallet" },
                ].map((m) => (
                  <button
                    key={m.v}
                    onClick={() => setMethod(m.v as typeof method)}
                    className={`p-4 rounded-xl border-2 transition ${
                      method === m.v
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <m.i size={22} className="mx-auto mb-1" />
                    <div className="text-xs font-bold">{m.l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-bold mb-3">Kode Voucher</h2>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
              />
              <p className="text-xs text-[var(--muted)] mt-2">
                Coba: <b>WELCOME10</b> atau <b>HEMAT50K</b>
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="glass rounded-2xl p-5 h-fit sticky top-20">
            <h2 className="font-bold mb-3">Ringkasan</h2>
            {product ? (
              <>
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images?.[0]}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-xs text-violet-400 font-bold">
                      {product.game}
                    </div>
                    <div className="text-sm font-semibold line-clamp-2">
                      {product.name}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Subtotal</span>
                    <span>{formatIDR(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Kode Unik</span>
                    <span className="text-xs">otomatis</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span className="gradient-text">{formatIDR(price)}</span>
                  </div>
                </div>
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full mt-4 btn-primary py-3 rounded-xl font-bold disabled:opacity-60"
                >
                  {loading ? "Memproses..." : "Bayar Sekarang"}
                </button>
              </>
            ) : (
              <div className="skeleton h-40" />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
