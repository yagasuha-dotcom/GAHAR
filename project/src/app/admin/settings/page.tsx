"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { toast } from "@/components/toaster";
import { ImageUploader } from "@/components/image-uploader";
import { Plus, Trash2 } from "lucide-react";

type Settings = {
  storeName: string;
  whatsapp: string;
  qrisImageUrl: string;
  description: string;
  bankAccounts: { bank: string; number: string; holder: string }[];
};

export default function AdminSettings() {
  const [s, setS] = useState<Settings>({
    storeName: "",
    whatsapp: "",
    qrisImageUrl: "",
    description: "",
    bankAccounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setS({ bankAccounts: [], ...d.settings }))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const d = await r.json();
      if (d.ok) toast("Pengaturan disimpan", "success");
      else toast("Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  function addBank() {
    setS({ ...s, bankAccounts: [...s.bankAccounts, { bank: "", number: "", holder: "" }] });
  }

  function updateBank(idx: number, field: string, value: string) {
    const next = [...s.bankAccounts];
    next[idx] = { ...next[idx], [field]: value };
    setS({ ...s, bankAccounts: next });
  }

  function removeBank(idx: number) {
    setS({ ...s, bankAccounts: s.bankAccounts.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="settings" />
        <div>
          <h1 className="text-3xl font-black mb-6">Pengaturan Toko</h1>

          {loading ? (
            <div className="skeleton h-60" />
          ) : (
            <div className="glass rounded-2xl p-6 space-y-4 text-sm max-w-2xl">
              <label className="block">
                Nama Toko
                <input value={s.storeName} onChange={(e) => setS({...s, storeName: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Nomor WhatsApp (untuk kontak & CS)
                <input value={s.whatsapp} onChange={(e) => setS({...s, whatsapp: e.target.value})} placeholder="628xxxxxxxxxx" className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Deskripsi Toko
                <textarea value={s.description} onChange={(e) => setS({...s, description: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>

              <ImageUploader value={s.qrisImageUrl} onChange={(url) => setS({...s, qrisImageUrl: url})} label="Gambar QRIS Pembayaran" />

              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-violet-400 uppercase">Rekening Bank</div>
                  <button onClick={addBank} className="text-xs text-violet-400 flex items-center gap-1"><Plus size={12} /> Tambah</button>
                </div>
                <div className="space-y-2">
                  {s.bankAccounts.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                      <input value={b.bank} onChange={(e) => updateBank(idx, "bank", e.target.value)} placeholder="Bank" className="px-2 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs" />
                      <input value={b.number} onChange={(e) => updateBank(idx, "number", e.target.value)} placeholder="No. Rekening" className="px-2 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs" />
                      <input value={b.holder} onChange={(e) => updateBank(idx, "holder", e.target.value)} placeholder="Atas Nama" className="px-2 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs" />
                      <button onClick={() => removeBank(idx)} className="p-1.5 text-red-400 hover:bg-[var(--border)] rounded"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={save} disabled={saving} className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
