"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { formatIDR, formatDate } from "@/lib/utils";

type C = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  totalSpent: string;
  orderCount: string;
};

export default function AdminCustomers() {
  const [items, setItems] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="customers" />
        <div>
          <h1 className="text-3xl font-black mb-6">Customer</h1>
          {loading ? (
            <div className="skeleton h-40" />
          ) : (
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--border)]/50">
                  <tr>
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-center p-3">Order</th>
                    <th className="text-right p-3">Total Belanja</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-left p-3">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-t border-[var(--border)]">
                      <td className="p-3 font-semibold">{c.name}</td>
                      <td className="p-3 text-[var(--muted)]">{c.email}</td>
                      <td className="p-3 text-center">{c.orderCount}</td>
                      <td className="p-3 text-right font-bold">{formatIDR(parseInt(c.totalSpent))}</td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[var(--muted)]">{formatDate(c.createdAt)}</td>
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
