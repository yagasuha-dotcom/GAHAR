import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { formatIDR, formatDate } from "@/lib/utils";
import Link from "next/link";
import { AdminSidebar } from "./sidebar";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  const [statsRow] = (
    await db.execute<{
      revenue: string;
      total_orders: string;
      customers: string;
      today: string;
      sold: string;
    }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN o.status IN ('PAID','DELIVERED','COMPLETED') THEN o.total ELSE 0 END),0)::text as revenue,
      COUNT(*)::text as total_orders,
      (SELECT COUNT(*) FROM users WHERE role='CUSTOMER')::text as customers,
      (SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE)::text as today,
      COALESCE((SELECT SUM(sold_count) FROM products),0)::text as sold
    FROM orders o
  `)
  ).rows;

  const weekly = (
    await db.execute<{ day: string; revenue: string }>(sql`
    SELECT to_char(d, 'DD/MM') as day,
           COALESCE(SUM(o.total), 0)::text as revenue
    FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') d
    LEFT JOIN orders o ON o.created_at::date = d::date AND o.status IN ('PAID','DELIVERED','COMPLETED')
    GROUP BY d ORDER BY d
  `)
  ).rows;

  const [recentOrders, topProducts, recentUsers] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db
      .select()
      .from(products)
      .orderBy(desc(products.soldCount))
      .limit(5),
    db.select().from(users).where(eq(users.role, "CUSTOMER")).orderBy(desc(users.createdAt)).limit(5),
  ]);

  const maxRev = Math.max(...weekly.map((w) => parseInt(w.revenue)), 1);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar active="dashboard" />
        <div>
          <h1 className="text-3xl font-black mb-6">Dashboard Admin</h1>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Pendapatan" value={formatIDR(parseInt(statsRow.revenue))} color="from-emerald-500 to-teal-500" />
            <StatCard label="Total Order" value={statsRow.total_orders} color="from-violet-500 to-purple-500" />
            <StatCard label="Total Customer" value={statsRow.customers} color="from-cyan-500 to-blue-500" />
            <StatCard label="Order Hari Ini" value={statsRow.today} color="from-amber-500 to-orange-500" />
            <StatCard label="Produk Terjual" value={statsRow.sold} color="from-pink-500 to-rose-500" />
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Pendapatan 7 Hari</h2>
            <div className="flex items-end gap-2 h-48">
              {weekly.map((w, i) => {
                const val = parseInt(w.revenue);
                const h = maxRev > 0 ? (val / maxRev) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-violet-500 to-cyan-500 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(h, 4)}%` }}
                      title={formatIDR(val)}
                    />
                    <div className="text-[10px] text-[var(--muted)]">{w.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold">Order Terbaru</h2>
                <Link href="/admin/orders" className="text-sm text-violet-400">
                  Semua
                </Link>
              </div>
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center p-2 rounded hover:bg-[var(--border)]">
                    <div>
                      <div className="font-mono text-xs font-bold">{o.orderCode}</div>
                      <div className="text-xs text-[var(--muted)]">{formatDate(o.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatIDR(o.total)}</div>
                      <div className="text-[10px]">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-bold mb-3">Produk Terlaris</h2>
              <div className="space-y-2">
                {topProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 rounded hover:bg-[var(--border)]">
                    <div className="text-sm truncate max-w-[70%]">{p.name}</div>
                    <div className="text-xs text-violet-400 font-bold">{p.soldCount}x</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 md:col-span-2">
              <h2 className="font-bold mb-3">Customer Baru</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--border)]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                      {u.name[0]}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-[var(--muted)]">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-4 overflow-hidden relative">
      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-20`} />
      <div className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
}
