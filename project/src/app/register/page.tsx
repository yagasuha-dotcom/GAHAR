"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "@/components/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const d = await r.json();
    setLoading(false);
    if (d.ok) {
      toast("Registrasi berhasil", "success");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast(d.error || "Registrasi gagal", "error");
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md glass rounded-2xl p-8">
          <h1 className="text-2xl font-black mb-1">Daftar</h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            Buat akun CLINTSTORE gratis
          </p>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              Nama Lengkap
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
              />
            </label>
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
              />
            </label>
            <label className="block text-sm">
              Password (min 6 karakter)
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-violet-400 font-semibold">
              Masuk
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
