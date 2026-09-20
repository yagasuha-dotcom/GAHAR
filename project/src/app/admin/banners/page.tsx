"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { toast } from "@/components/toaster";
import { ImageUploader } from "@/components/image-uploader";
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";

type B = {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  active: boolean;
  sortOrder: number;
};

export default function AdminBanners() {
  const [items, setItems] = useState<B[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    position: "HERO",
    sortOrder: 0,
  });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function submit() {
    const r = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.ok) {
      toast("Banner ditambahkan", "success");
      setShowForm(false);
      setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "HERO", sortOrder: 0 });
      load();
    } else toast(d.error || "Gagal", "error");
  }

  async function toggle(b: B) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    load();
  }

  async function del(id: number) {
    if (!confirm("Hapus banner ini?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    toast("Banner dihapus", "success");
    load();
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="banners" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Banner</h1>
            <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={16} /> Tambah
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">Belum ada banner.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((b) => (
                <div key={b.id} className="glass rounded-2xl overflow-hidden">
                  {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-32 object-cover" />}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{b.title}</div>
                        {b.subtitle && <div className="text-xs text-[var(--muted)]">{b.subtitle}</div>}
                        <div className="text-[10px] text-[var(--muted)] mt-1">{b.position}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggle(b)} className={b.active ? "text-emerald-400" : "text-[var(--muted)]"}>
                          {b.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={() => del(b.id)} className="p-1 text-red-400 hover:bg-[var(--border)] rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
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
              <h2 className="text-xl font-black">Tambah Banner</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--border)] rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                Judul
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Subjudul
                <input value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <ImageUploader value={form.imageUrl} onChange={(url) => setForm({...form, imageUrl: url})} label="Gambar Banner" />
              <label className="block">
                Link Tujuan (opsional)
                <input value={form.linkUrl} onChange={(e) => setForm({...form, linkUrl: e.target.value})} placeholder="/products/slug-produk" className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Posisi
                <select value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <option value="HERO">Hero (Beranda)</option>
                  <option value="PROMO">Promo Strip</option>
                  <option value="SIDEBAR">Sidebar</option>
                </select>
              </label>
              <label className="block">
                Urutan
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
            </div>
            <button onClick={submit} className="mt-4 w-full btn-primary py-3 rounded-xl font-bold">Simpan Banner</button>
          </div>
        </div>
      )}
    </>
  );
}
