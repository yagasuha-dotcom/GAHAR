import { db } from "@/db";
import { orders, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatIDR, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Bell, Heart, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const [recent, notifs, stats] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(5),
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(5),
    db
      .execute<{ total: string; count: string }>(
        sql`SELECT COALESCE(SUM(total),0)::text as total, COUNT(*)::text as count FROM orders WHERE user_id = ${user.id} AND status IN ('PAID','DELIVERED','COMPLETED')`,
      )
      .then((r) => r.rows[0]),
  ]);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black">Halo, {user.name}!</h1>
            <p className="text-[var(--muted)]">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Belanja" value={formatIDR(parseInt(stats.total))} icon="💰" />
          <StatCard label="Total Order" value={stats.count} icon="📦" />
          <StatCard label="Wishlist" value="0" icon="❤️" />
          <StatCard label="Voucher" value="2" icon="🎟️" />
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="glass rounded-2xl p-3 h-fit">
            <nav className="space-y-1 text-sm font-semibold">
              <MenuItem href="/dashboard" icon={<User size={16} />} label="Profil" active />
              <MenuItem href="/dashboard/orders" icon={<Package size={16} />} label="Riwayat Order" />
              <MenuItem href="/dashboard/wishlist" icon={<Heart size={16} />} label="Wishlist" />
              <MenuItem href="/dashboard/notifications" icon={<Bell size={16} />} label="Notifikasi" />
            </nav>
          </aside>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Order Terbaru</h2>
                <Link href="/dashboard/orders" className="text-sm text-violet-400">
                  Lihat semua
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="text-center py-10 text-[var(--muted)]">
                  <div className="text-5xl mb-2">📭</div>
                  Belum ada pesanan.{" "}
                  <Link href="/products" className="text-violet-400">
                    Mulai belanja
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent.map((o) => (
                    <Link
                      key={o.id}
                      href={`/orders/${o.orderCode}`}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--border)] transition"
                    >
                      <div>
                        <div className="font-mono font-bold text-sm">
                          {o.orderCode}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {formatDate(o.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatIDR(o.total)}</div>
                        <StatusBadge status={o.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Notifikasi</h2>
              {notifs.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-6">
                  Tidak ada notifikasi
                </div>
              ) : (
                <div className="space-y-2">
                  {notifs.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <div className="font-bold text-sm">{n.title}</div>
                      <div className="text-xs text-[var(--muted)]">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="font-bold text-lg mt-0.5">{value}</div>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
        active ? "bg-violet-500/20 text-violet-400" : "hover:bg-[var(--border)]"
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "bg-emerald-500/20 text-emerald-400",
    PAID: "bg-emerald-500/20 text-emerald-400",
    DELIVERED: "bg-emerald-500/20 text-emerald-400",
    WAITING_PAYMENT: "bg-amber-500/20 text-amber-400",
    PENDING: "bg-amber-500/20 text-amber-400",
    CANCELLED: "bg-red-500/20 text-red-400",
    REFUNDED: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded ${map[status] || "bg-[var(--border)]"}`}
    >
      {status}
    </span>
  );
}
