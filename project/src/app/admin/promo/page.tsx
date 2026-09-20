"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "../sidebar";
import Link from "next/link";
import { Ticket, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function AdminPromo() {
  const [couponCount, setCouponCount] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCouponCount((d.items || []).filter((c: { active: boolean }) => c.active).length));
    fetch("/api/admin/banners").then((r) => r.json()).then((d) => setBannerCount((d.items || []).filter((b: { active: boolean }) => b.active).length));
  }, []);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="promo" />
        <div>
          <h1 className="text-3xl font-black mb-2">Promo</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Kelola voucher diskon dan banner promosi dari satu tempat. Promo ditampilkan otomatis di beranda saat aktif.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/admin/coupons" className="glass rounded-2xl p-6 hover:border-violet-500/50 border border-transparent transition group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <Ticket size={20} />
                </div>
                <ArrowRight size={18} className="text-[var(--muted)] group-hover:translate-x-1 transition" />
              </div>
              <div className="text-2xl font-black mt-3">{couponCount}</div>
              <div className="text-sm text-[var(--muted)]">Voucher aktif</div>
            </Link>

            <Link href="/admin/banners" className="glass rounded-2xl p-6 hover:border-violet-500/50 border border-transparent transition group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <ImageIcon size={20} />
                </div>
                <ArrowRight size={18} className="text-[var(--muted)] group-hover:translate-x-1 transition" />
              </div>
              <div className="text-2xl font-black mt-3">{bannerCount}</div>
              <div className="text-sm text-[var(--muted)]">Banner aktif</div>
            </Link>
          </div>

          <div className="glass rounded-2xl p-6 mt-4 text-sm text-[var(--muted)]">
            💡 Tips: buat voucher dengan kode yang mudah diingat (contoh: <span className="text-violet-400 font-bold">HEMAT10</span>), lalu tambahkan banner dengan posisi <span className="font-bold">Promo Strip</span> untuk mengiklankan kode itu di beranda.
          </div>
        </div>
      </div>
    </>
  );
}
