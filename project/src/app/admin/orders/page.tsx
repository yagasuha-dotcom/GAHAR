"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { formatIDR, formatDate } from "@/lib/utils";
import { toast } from "@/components/toaster";

type O = {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

const STATUSES = ["PENDING", "WAITING_PAYMENT", "PAID", "PROCESSING", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"];

export default function AdminOrders() {
  const [items, setItems] = useState<O[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast("Status diperbarui", "success");
    load();
  }

  const filtered = filter ? items.filter(i => i.status === filter) : items;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="orders" />
        <div>
          <h1 className="text-3xl font-black mb-6">Manajemen Order</h1>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${!filter ? "bg-violet-500 text-white" : "glass"}`}>
              Semua ({items.length})
            </button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${filter === s ? "bg-violet-500 text-white" : "glass"}`}>
                {s} ({items.filter(i => i.status === s).length})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : (
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--border)]/50">
                  <tr>
                    <th className="text-left p-3">Kode</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-left p-3">Metode</th>
                    <th className="text-left p-3">Tanggal</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-t border-[var(--border)] hover:bg-[var(--border)]/30">
                      <td className="p-3">
                        <a href={`/orders/${o.orderCode}`} target="_blank" className="font-mono text-xs font-bold text-violet-400">{o.orderCode}</a>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{o.customerName}</div>
                        <div className="text-xs text-[var(--muted)]">{o.customerEmail}</div>
                      </td>
                      <td className="p-3 text-right font-bold">{formatIDR(o.total)}</td>
                      <td className="p-3 text-xs">{o.paymentMethod}</td>
                      <td className="p-3 text-xs text-[var(--muted)]">{formatDate(o.createdAt)}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-xs"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
