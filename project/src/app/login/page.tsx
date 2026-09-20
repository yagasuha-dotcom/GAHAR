"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "@/components/toaster";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@clintstore.id");
  const [password, setPassword] = useState("customer123");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });
    const d = await r.json();
    setLoading(false);
    if (d.ok) {
      toast("Login berhasil", "success");
      router.push(d.user.role === "CUSTOMER" ? "/dashboard" : "/admin");
      router.refresh();
    } else {
      toast(d.error || "Login gagal", "error");
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md glass rounded-2xl p-8">
          <h1 className="text-2xl font-black mb-1">Masuk</h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            Selamat datang kembali di CLINTSTORE
          </p>

          <form onSubmit={submit} className="space-y-4">
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
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]"
              />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ingat saya
              </label>
              <a href="#" className="text-violet-400 hover:underline">
                Lupa password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Belum punya akun?{" "}
            <Link href="/register" className="text-violet-400 font-semibold">
              Daftar
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] text-center mb-3">
              Akun demo:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="glass rounded-lg p-2 text-center">
                <div className="font-bold text-violet-400">Admin</div>
                <div className="text-[10px]">admin@clintstore.id</div>
                <div className="text-[10px]">admin123</div>
              </div>
              <div className="glass rounded-lg p-2 text-center">
                <div className="font-bold text-cyan-400">Customer</div>
                <div className="text-[10px]">customer@clintstore.id</div>
                <div className="text-[10px]">customer123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
