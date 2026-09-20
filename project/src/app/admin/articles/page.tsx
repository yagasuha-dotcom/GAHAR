"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import { toast } from "@/components/toaster";
import { ImageUploader } from "@/components/image-uploader";
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";

type A = {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  content: string;
  category?: string;
  published: boolean;
};

export default function AdminArticles() {
  const [items, setItems] = useState<A[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    thumbnail: "",
    excerpt: "",
    content: "",
    category: "",
  });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function submit() {
    const r = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.ok) {
      toast("Artikel ditambahkan", "success");
      setShowForm(false);
      setForm({ title: "", thumbnail: "", excerpt: "", content: "", category: "" });
      load();
    } else toast(d.error || "Gagal", "error");
  }

  async function toggle(a: A) {
    await fetch(`/api/admin/articles/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !a.published }),
    });
    load();
  }

  async function del(id: number) {
    if (!confirm("Hapus artikel ini?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    toast("Artikel dihapus", "success");
    load();
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="articles" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Artikel</h1>
            <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={16} /> Tulis Artikel
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-40" />
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">Belum ada artikel.</div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--border)]/50">
                  <tr>
                    <th className="text-left p-3">Judul</th>
                    <th className="text-left p-3">Kategori</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-t border-[var(--border)]">
                      <td className="p-3 max-w-[320px] truncate">{a.title}</td>
                      <td className="p-3 text-[var(--muted)]">{a.category || "-"}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggle(a)} className={a.published ? "text-emerald-400" : "text-[var(--muted)]"}>
                          {a.published ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => del(a.id)} className="p-1 text-red-400 hover:bg-[var(--border)] rounded">
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
              <h2 className="text-xl font-black">Tulis Artikel</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--border)] rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                Judul
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Kategori
                <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="Tips, Update, dll" className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <ImageUploader value={form.thumbnail} onChange={(url) => setForm({...form, thumbnail: url})} label="Thumbnail" />
              <label className="block">
                Ringkasan
                <textarea value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
              <label className="block">
                Isi Artikel
                <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={8} className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
              </label>
            </div>
            <button onClick={submit} className="mt-4 w-full btn-primary py-3 rounded-xl font-bold">Publikasikan</button>
          </div>
        </div>
      )}
    </>
  );
}
