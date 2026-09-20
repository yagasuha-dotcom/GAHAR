"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { toast } from "@/components/toaster";
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";

type C = {
  id: number;
  code: string;
  type: "PERCENT" | "NOMINAL";
  value: number;
  minPurchase: number;
  maxUse: number;
  usedCount: number;
  active: boolean;
};

export default function AdminCoupons() {
  const [items, setItems] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "NOMINAL",
    value: 10,
    minPurchase: 0,
    maxUse: 0,
  });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function submit() {
    const r = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.ok) {
      toast("Voucher ditambahkan", "success");
      setShowForm(false);
      setForm({ code: "", type: "PERCENT", value: 10, minPurchase: 0, maxUse: 0 });
      load();
    } else toast(d.error || "Gagal", "error");
  }

  async function toggle(c: C) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function del(id: number) {
    if (!confirm("Hapus voucher ini?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    toast("Voucher dihapus", "success");
    load();
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="coupons" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Voucher</h1>
            <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={16} /> Tambah
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">Belum ada voucher.</div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--border)]/50">
                  <tr>
                    <th className="text-left p-3">Kode</th>
                    <th className="text-left p-3">Tipe</th>
                    <th className="text-right p-3">Nilai</th>
                    <th className="text-right p-3">Min. Belanja</th>
                    <th className="text-center p-3">Terpakai</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-t border-[var(--border)]">
                      <td className="p-3 font-bold">{c.code}</td>
                      <td className="p-3 text-[var(--muted)]">{c.type === "PERCENT" ? "Persen" : "Nominal"}</td>
                      <td className="p-3 text-right">{c.type === "PERCENT" ? `${c.value}%` : `Rp${c.value.toLocaleString("id-ID")}`}</td>
                      <td className="p-3 text-right">Rp{c.minPurchase.toLocaleString("id-ID")}</td>
                      <td className="p-3 text-center">{c.usedCount}{c.maxUse ? ` / ${c.maxUse}` : ""}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggle(c)} className={c.active ? "text-emerald-400" : "text-[var(--muted)]"}>
                          {c.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => del(c.id)} className="p-1 text-red-400 hover:bg-[var(--border)] rounded">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Tambah Voucher</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--border)] rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                Kode Voucher
                <input value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="CONTOH: HEMAT10" className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Tipe
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as "PERCENT" | "NOMINAL"})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <option value="PERCENT">Persen (%)</option>
                  <option value="NOMINAL">Nominal (Rp)</option>
                </select>
              </label>
              <label className="block">
                Nilai
                <input type="number" value={form.value} onChange={(e) => setForm({...form, value: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Minimal Belanja (Rp)
                <input type="number" value={form.minPurchase} onChange={(e) => setForm({...form, minPurchase: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Maks. Pemakaian (0 = tanpa batas)
                <input type="number" value={form.maxUse} onChange={(e) => setForm({...form, maxUse: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
            </div>
            <button onClick={submit} className="mt-4 w-full btn-primary py-3 rounded-xl font-bold">Simpan Voucher</button>
          </div>
        </div>
      )}
    </>
  );
}
