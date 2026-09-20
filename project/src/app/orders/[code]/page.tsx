"use client";
import { useEffect, useState, useCallback, use } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatIDR, formatDate } from "@/lib/utils";
import { toast } from "@/components/toaster";
import { Copy, Clock, CheckCircle2, Printer } from "lucide-react";

type OrderData = {
  order: {
    id: number;
    orderCode: string;
    customerName: string;
    customerEmail: string;
    subtotal: number;
    discount: number;
    uniqueCode: number;
    total: number;
    status: string;
    paymentMethod: string;
    paymentDeadline: string | null;
    paidAt: string | null;
    createdAt: string;
  };
  items: {
    id: number;
    productName: string;
    productImage: string | null;
    price: number;
    quantity: number;
    deliveredData: { login?: string; password?: string; notes?: string } | null;
  }[];
  payments: { id: number; method: string; status: string; amount: number }[];
};

export default function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [data, setData] = useState<OrderData | null>(null);
  const [now, setNow] = useState(Date.now());
  const [paying, setPaying] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/orders/${code}`)
      .then((r) => r.json())
      .then(setData);
  }, [code]);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [load]);

  async function simulatePay() {
    setPaying(true);
    const r = await fetch(`/api/orders/${code}/pay`, { method: "POST" });
    const d = await r.json();
    setPaying(false);
    if (d.ok) {
      toast("Pembayaran berhasil! Akun sudah dikirim.", "success");
      load();
    } else toast(d.error || "Gagal", "error");
  }

  if (!data)
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto p-10">
          <div className="skeleton h-60" />
        </div>
      </>
    );

  const { order, items, payments } = data;
  const isPaid = ["PAID", "DELIVERED", "COMPLETED"].includes(order.status);
  const deadline = order.paymentDeadline ? new Date(order.paymentDeadline).getTime() : 0;
  const remaining = Math.max(0, deadline - now);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black">Invoice</h1>
          <button
            onClick={() => window.print()}
            className="glass px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Printer size={16} /> Cetak / PDF
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[var(--muted)]">Order:</span>
          <code className="font-mono font-bold">{order.orderCode}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(order.orderCode);
              toast("Kode disalin", "success");
            }}
            className="text-violet-400"
          >
            <Copy size={14} />
          </button>
        </div>

        {/* Status */}
        <div
          className={`mt-6 rounded-2xl p-5 border-2 ${
            isPaid
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-amber-500/50 bg-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-3">
            {isPaid ? (
              <CheckCircle2 className="text-emerald-400" size={32} />
            ) : (
              <Clock className="text-amber-400" size={32} />
            )}
            <div className="flex-1">
              <div className="font-bold text-lg">
                {isPaid
                  ? "Pembayaran Berhasil — Akun Terkirim"
                  : "Menunggu Pembayaran"}
              </div>
              <div className="text-sm text-[var(--muted)]">
                Status: <b>{order.status}</b>
              </div>
            </div>
            {!isPaid && remaining > 0 && (
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">Sisa waktu</div>
                <div className="font-mono font-bold text-xl">
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isPaid && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-bold mb-3">Instruksi Pembayaran</h2>
            <div className="space-y-3 text-sm">
              {order.paymentMethod === "BANK_TRANSFER" && (
                <>
                  <p>Transfer ke rekening berikut:</p>
                  <div className="glass rounded-lg p-3 font-mono">
                    <div><b>BCA</b></div>
                    <div>1234567890</div>
                    <div>a.n CLINTSTORE</div>
                  </div>
                </>
              )}
              {order.paymentMethod === "QRIS" && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white text-xs rounded">
                      [QRIS Code — Scan pakai e-wallet]
                    </div>
                  </div>
                </div>
              )}
              {order.paymentMethod === "EWALLET" && (
                <div>
                  <p>Kirim ke salah satu e-wallet:</p>
                  <ul className="mt-2 space-y-1 font-mono text-xs">
                    <li>💰 DANA: 081234567890</li>
                    <li>🟣 OVO: 081234567890</li>
                    <li>🟢 GoPay: 081234567890</li>
                  </ul>
                </div>
              )}
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total (termasuk kode unik)</span>
                  <span className="gradient-text">{formatIDR(order.total)}</span>
                </div>
              </div>
              <button
                onClick={simulatePay}
                disabled={paying}
                className="w-full btn-primary py-3 rounded-xl font-bold"
              >
                {paying ? "Memproses..." : "✅ Simulasi Bayar (Demo)"}
              </button>
              <p className="text-xs text-[var(--muted)] text-center">
                Di produksi ini terhubung ke payment gateway (Midtrans/Xendit).
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 glass rounded-2xl p-5">
          <h2 className="font-bold mb-3">Detail Pesanan</h2>
          {items.map((it) => (
            <div key={it.id} className="flex gap-3 py-3 border-b border-[var(--border)] last:border-0">
              {it.productImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.productImage} alt="" className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{it.productName}</div>
                <div className="text-sm text-[var(--muted)]">
                  {it.quantity}x {formatIDR(it.price)}
                </div>
                {it.deliveredData && isPaid && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm font-mono">
                    <div className="font-bold text-emerald-400 mb-1">
                      🎉 Data Akun Kamu:
                    </div>
                    <div>Login: {it.deliveredData.login}</div>
                    <div>Password: {it.deliveredData.password}</div>
                    {it.deliveredData.notes && (
                      <div className="text-xs text-[var(--muted)] mt-1">
                        {it.deliveredData.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span>{formatIDR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon</span>
                <span>-{formatIDR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Kode Unik</span>
              <span>+{order.uniqueCode}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]">
              <span>Total</span>
              <span className="gradient-text">{formatIDR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 glass rounded-2xl p-5 text-sm">
          <h2 className="font-bold mb-2">Informasi</h2>
          <div className="grid md:grid-cols-2 gap-2 text-[var(--muted)]">
            <div>Nama: {order.customerName}</div>
            <div>Email: {order.customerEmail}</div>
            <div>Metode: {order.paymentMethod}</div>
            <div>Dibuat: {formatDate(order.createdAt)}</div>
            {order.paidAt && <div>Dibayar: {formatDate(order.paidAt)}</div>}
            <div>Payment ID: {payments[0]?.id ?? "-"}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
