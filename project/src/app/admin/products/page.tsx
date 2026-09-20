"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { formatIDR } from "@/lib/utils";
import { toast } from "@/components/toaster";
import { ImageUploader } from "@/components/image-uploader";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";

type P = {
  id: number;
  name: string;
  game: string;
  rank?: string;
  region?: string;
  level?: number;
  skins?: number;
  heroes?: number;
  items?: number;
  diamonds?: number;
  description?: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  status: string;
  images: string[];
  soldCount: number;
  isBestSeller?: boolean;
  credentials?: { login?: string; password?: string; notes?: string } | null;
};

const emptyForm = {
  name: "",
  game: "Mobile Legends",
  rank: "",
  region: "ID",
  level: 30,
  skins: 0,
  heroes: 0,
  items: 0,
  diamonds: 0,
  description: "",
  price: 100000,
  discountPrice: 0,
  stock: 1,
  images: [""] as string[],
  credLogin: "",
  credPassword: "",
  credNotes: "",
};

export default function AdminProducts() {
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: P) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      game: p.game,
      rank: p.rank || "",
      region: p.region || "ID",
      level: p.level || 30,
      skins: p.skins || 0,
      heroes: p.heroes || 0,
      items: p.items || 0,
      diamonds: p.diamonds || 0,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || 0,
      stock: p.stock,
      images: p.images?.length ? p.images : [""],
      credLogin: p.credentials?.login || "",
      credPassword: p.credentials?.password || "",
      credNotes: p.credentials?.notes || "",
    });
    setShowForm(true);
  }

  async function submit() {
    const payload = {
      name: form.name,
      game: form.game,
      rank: form.rank,
      region: form.region,
      level: form.level,
      skins: form.skins,
      heroes: form.heroes,
      items: form.items,
      diamonds: form.diamonds,
      description: form.description,
      images: form.images.filter(Boolean),
      price: form.price,
      discountPrice: form.discountPrice || null,
      stock: form.stock,
      credentials:
        form.credLogin || form.credPassword
          ? { login: form.credLogin, password: form.credPassword, notes: form.credNotes }
          : null,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (d.ok) {
      toast(editingId ? "Produk diperbarui" : "Produk ditambahkan", "success");
      setShowForm(false);
      load();
    } else toast(d.error || "Gagal", "error");
  }

  async function del(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    toast("Produk dihapus", "success");
    load();
  }

  async function toggleFeatured(p: P) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBestSeller: !p.isBestSeller }),
    });
    load();
  }

  function setImage(idx: number, url: string) {
    const next = [...form.images];
    next[idx] = url;
    setForm({ ...form, images: next });
  }

  function addImageSlot() {
    setForm({ ...form, images: [...form.images, ""] });
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="products" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Produk</h1>
            <button
              onClick={openCreate}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <Plus size={16} /> Tambah
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : (
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--border)]/50">
                  <tr>
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3">Game</th>
                    <th className="text-right p-3">Harga</th>
                    <th className="text-center p-3">Stok</th>
                    <th className="text-center p-3">Terjual</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border)]">
                      <td className="p-3 max-w-[280px] truncate flex items-center gap-2">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        {p.name}
                      </td>
                      <td className="p-3 text-[var(--muted)]">{p.game}</td>
                      <td className="p-3 text-right">{formatIDR(p.discountPrice || p.price)}</td>
                      <td className="p-3 text-center">{p.stock}</td>
                      <td className="p-3 text-center">{p.soldCount}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>{p.status}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleFeatured(p)}
                          title="Toggle Best Seller"
                          className={`p-1 rounded hover:bg-[var(--border)] ${p.isBestSeller ? "text-amber-400" : "text-[var(--muted)]"}`}
                        >
                          <Star size={14} fill={p.isBestSeller ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1 text-violet-400 hover:bg-[var(--border)] rounded ml-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => del(p.id)} className="p-1 text-red-400 hover:bg-[var(--border)] rounded ml-1">
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
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--border)] rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <label className="block md:col-span-2">
                Nama Produk
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Game
                <select value={form.game} onChange={(e) => setForm({...form, game: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  {["Mobile Legends", "Genshin Impact", "Valorant", "PUBG Mobile", "Free Fire", "Honkai Star Rail"].map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="block">
                Rank
                <input value={form.rank} onChange={(e) => setForm({...form, rank: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Region
                <input value={form.region} onChange={(e) => setForm({...form, region: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Level
                <input type="number" value={form.level} onChange={(e) => setForm({...form, level: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Harga (Rp)
                <input type="number" value={form.price} onChange={(e) => setForm({...form, price: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Harga Diskon (0 = tanpa diskon)
                <input type="number" value={form.discountPrice} onChange={(e) => setForm({...form, discountPrice: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Stok
                <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: +e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>

              <div className="md:col-span-2 border-t border-[var(--border)] pt-3">
                <div className="text-xs font-bold text-violet-400 uppercase mb-2">Gambar Produk</div>
              </div>
              {form.images.map((img, idx) => (
                <ImageUploader key={idx} value={img} onChange={(url) => setImage(idx, url)} label={`Gambar ${idx + 1}`} />
              ))}
              <button type="button" onClick={addImageSlot} className="md:col-span-2 text-xs text-violet-400 font-bold text-left">
                + Tambah slot gambar
              </button>

              <label className="block md:col-span-2">
                Deskripsi
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <div className="md:col-span-2 border-t border-[var(--border)] pt-3">
                <div className="text-xs font-bold text-violet-400 uppercase mb-2">Kredensial Akun (dikirim otomatis setelah bayar)</div>
              </div>
              <label className="block">
                Login/Email
                <input value={form.credLogin} onChange={(e) => setForm({...form, credLogin: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Password
                <input value={form.credPassword} onChange={(e) => setForm({...form, credPassword: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block md:col-span-2">
                Catatan
                <input value={form.credNotes} onChange={(e) => setForm({...form, credNotes: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
            </div>
            <button onClick={submit} className="mt-4 w-full btn-primary py-3 rounded-xl font-bold">
              {editingId ? "Simpan Perubahan" : "Simpan Produk"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
