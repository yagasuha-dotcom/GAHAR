import { db } from "@/db";
import {
  users,
  categories,
  products,
  banners,
  testimonials,
  articles,
  coupons,
  settings,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function seedIfEmpty() {
  const [{ count }] = await db.execute<{ count: string }>(
    sql`SELECT COUNT(*)::text as count FROM users`,
  ).then((r) => r.rows as { count: string }[]);
  if (parseInt(count) > 0) return { seeded: false };

  const adminPw = await hashPassword("admin123");
  const custPw = await hashPassword("customer123");

  await db.insert(users).values([
    {
      name: "Super Admin",
      email: "admin@clintstore.id",
      passwordHash: adminPw,
      role: "SUPERADMIN",
      emailVerifiedAt: new Date(),
    },
    {
      name: "Demo Customer",
      email: "customer@clintstore.id",
      passwordHash: custPw,
      role: "CUSTOMER",
      emailVerifiedAt: new Date(),
    },
  ]);

  const cats = await db
    .insert(categories)
    .values([
      { name: "Mobile Legends", slug: "mobile-legends", icon: "⚔️" },
      { name: "Genshin Impact", slug: "genshin-impact", icon: "🌸" },
      { name: "Valorant", slug: "valorant", icon: "🎯" },
      { name: "PUBG Mobile", slug: "pubg-mobile", icon: "🔫" },
      { name: "Free Fire", slug: "free-fire", icon: "🔥" },
      { name: "Honkai Star Rail", slug: "honkai-star-rail", icon: "⭐" },
    ])
    .returning();

  const games = [
    { g: "Mobile Legends", cat: cats[0].id, ranks: ["Mythic", "Legend", "Epic", "Grandmaster"], regions: ["ID", "SEA"] },
    { g: "Genshin Impact", cat: cats[1].id, ranks: ["AR 55", "AR 60", "AR 45"], regions: ["Asia", "America"] },
    { g: "Valorant", cat: cats[2].id, ranks: ["Immortal", "Radiant", "Diamond"], regions: ["AP", "NA"] },
    { g: "PUBG Mobile", cat: cats[3].id, ranks: ["Conqueror", "Ace", "Crown"], regions: ["Asia", "KR/JP"] },
    { g: "Free Fire", cat: cats[4].id, ranks: ["Grandmaster", "Heroic"], regions: ["ID"] },
    { g: "Honkai Star Rail", cat: cats[5].id, ranks: ["TL 60", "TL 55"], regions: ["Asia", "America"] },
  ];

  const productData = [];
  let seq = 1;
  for (const gg of games) {
    for (let i = 0; i < 6; i++) {
      const price = 150000 + Math.floor(Math.random() * 3000000);
      const hasDisc = Math.random() > 0.4;
      const disc = hasDisc ? Math.floor(price * (0.6 + Math.random() * 0.3)) : null;
      productData.push({
        name: `Akun ${gg.g} ${gg.ranks[i % gg.ranks.length]} #${seq}`,
        slug: `akun-${gg.g.toLowerCase().replace(/\s+/g, "-")}-${seq}`,
        categoryId: gg.cat,
        game: gg.g,
        rank: gg.ranks[i % gg.ranks.length],
        level: 30 + Math.floor(Math.random() * 60),
        region: gg.regions[i % gg.regions.length],
        skins: Math.floor(Math.random() * 200),
        heroes: Math.floor(Math.random() * 120),
        items: Math.floor(Math.random() * 500),
        diamonds: Math.floor(Math.random() * 5000),
        description: `Akun ${gg.g} premium dengan rank ${gg.ranks[i % gg.ranks.length]}. Data lengkap, aman, dan siap main. Full akses email, garansi 100%.`,
        images: [
          `https://picsum.photos/seed/clint${seq}/800/600`,
          `https://picsum.photos/seed/clint${seq}b/800/600`,
          `https://picsum.photos/seed/clint${seq}c/800/600`,
        ],
        price,
        discountPrice: disc,
        stock: Math.random() > 0.15 ? 1 : 0,
        status: "AVAILABLE" as const,
        isFlashSale: Math.random() > 0.75,
        isBestSeller: Math.random() > 0.7,
        isFeatured: i < 2,
        soldCount: Math.floor(Math.random() * 50),
        credentials: {
          login: `demo_${seq}@example.com`,
          password: `SecurePass${seq}!`,
          notes: "Login menggunakan email di atas. Segera ganti password setelah menerima akun.",
        },
        metaTitle: `Akun ${gg.g} ${gg.ranks[i % gg.ranks.length]} Murah - CLINTSTORE`,
        metaDescription: `Beli akun ${gg.g} rank ${gg.ranks[i % gg.ranks.length]} dengan harga terjangkau.`,
      });
      seq++;
    }
  }
  await db.insert(products).values(productData);

  await db.insert(banners).values([
    {
      title: "MEGA FLASH SALE 12.12",
      subtitle: "Diskon hingga 70% untuk semua akun premium",
      imageUrl: "https://picsum.photos/seed/banner1/1600/600",
      linkUrl: "/promo",
      position: "HERO",
      sortOrder: 1,
    },
    {
      title: "Season Baru Mobile Legends",
      subtitle: "Akun Mythic siap tempur, garansi resmi",
      imageUrl: "https://picsum.photos/seed/banner2/1600/600",
      linkUrl: "/products?game=Mobile%20Legends",
      position: "HERO",
      sortOrder: 2,
    },
  ]);

  await db.insert(testimonials).values([
    {
      name: "Rizky Pratama",
      role: "Mythic Player",
      avatarUrl: "https://i.pravatar.cc/100?img=12",
      message: "Beli akun ML disini enak banget, langsung dikirim otomatis. Rekomended!",
      rating: 5,
    },
    {
      name: "Sarah Amelia",
      role: "Genshin Player",
      avatarUrl: "https://i.pravatar.cc/100?img=45",
      message: "Akun Genshin AR 60 langsung nyampe email. Trusted seller!",
      rating: 5,
    },
    {
      name: "Budi Santoso",
      role: "Valorant Pro",
      avatarUrl: "https://i.pravatar.cc/100?img=32",
      message: "Harga bersaing dan pelayanan cepat. Sudah 5x beli disini.",
      rating: 5,
    },
  ]);

  await db.insert(articles).values([
    {
      title: "Tips Beli Akun Game Aman",
      slug: "tips-beli-akun-game-aman",
      excerpt: "Panduan lengkap membeli akun game agar tidak tertipu.",
      content: "Pastikan penjual terpercaya, cek review, dan gunakan payment gateway resmi seperti CLINTSTORE.",
      thumbnail: "https://picsum.photos/seed/article1/800/500",
      category: "Tips",
      published: true,
    },
    {
      title: "Meta Terbaru Mobile Legends 2026",
      slug: "meta-terbaru-mobile-legends-2026",
      excerpt: "Hero apa saja yang lagi meta di season 34?",
      content: "Ada beberapa hero yang mendominasi meta season ini...",
      thumbnail: "https://picsum.photos/seed/article2/800/500",
      category: "Guide",
      published: true,
    },
  ]);

  await db.insert(coupons).values([
    {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minPurchase: 100000,
      maxUse: 1000,
      active: true,
    },
    {
      code: "HEMAT50K",
      type: "NOMINAL",
      value: 50000,
      minPurchase: 500000,
      maxUse: 500,
      active: true,
    },
  ]);

  await db.insert(settings).values([
    {
      key: "site",
      value: {
        name: "CLINTSTORE",
        tagline: "Toko Akun Game #1 Indonesia",
        primaryColor: "#7c3aed",
        whatsapp: "+62 812-3456-7890",
        discord: "CLINTSTORE#0001",
        telegram: "@clintstore",
        instagram: "@clintstore.id",
        gaId: "",
      },
    },
    {
      key: "payment",
      value: {
        bankName: "BCA",
        bankAccount: "1234567890",
        bankHolder: "CLINTSTORE",
        qrisImage: "",
        ewallets: [
          { name: "DANA", number: "081234567890" },
          { name: "OVO", number: "081234567890" },
          { name: "GoPay", number: "081234567890" },
        ],
      },
    },
  ]);

  return { seeded: true };
}
