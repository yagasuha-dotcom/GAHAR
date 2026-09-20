"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { toast } from "@/components/toaster";
import { ImageUploader } from "@/components/image-uploader";
import { Plus, Trash2, X, ToggleLeft, ToggleRight, Star } from "lucide-react";

type T = {
  id: number;
  name: string;
  role?: string;
  avatarUrl?: string;
  message: string;
  rating: number;
  active: boolean;
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    avatarUrl: "",
    message: "",
    rating: 5,
  });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function submit() {
    const r = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.ok) {
      toast("Testimoni ditambahkan", "success");
      setShowForm(false);
      setForm({ name: "", role: "", avatarUrl: "", message: "", rating: 5 });
      load();
    } else toast(d.error || "Gagal", "error");
  }

  async function toggle(t: T) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    load();
  }

  async function del(id: number) {
    if (!confirm("Hapus testimoni ini?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    toast("Testimoni dihapus", "success");
    load();
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="testimonials" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Testimoni</h1>
            <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={16} /> Tambah
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">Belum ada testimoni.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((t) => (
                <div key={t.id} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold">{t.name[0]}</div>
                      )}
                      <div>
                        <div className="font-bold text-sm">{t.name}</div>
                        {t.role && <div className="text-[11px] text-[var(--muted)]">{t.role}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggle(t)} className={t.active ? "text-emerald-400" : "text-[var(--muted)]"}>
                        {t.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => del(t.id)} className="p-1 text-red-400 hover:bg-[var(--border)] rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < t.rating ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"} />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Tambah Testimoni</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--border)] rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                Nama
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Role/Keterangan (opsional)
                <input value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} placeholder="Pembeli Mobile Legends" className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <ImageUploader value={form.avatarUrl} onChange={(url) => setForm({...form, avatarUrl: url})} label="Foto (opsional)" />
              <label className="block">
                Pesan
                <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Rating
                <select value={form.rating} onChange={(e) => setForm({...form, rating: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Bintang</option>)}
                </select>
              </label>
            </div>
            <button onClick={submit} className="mt-4 w-full btn-primary py-3 rounded-xl font-bold">Simpan Testimoni</button>
          </div>
        </div>
      )}
    </>
  );
}
