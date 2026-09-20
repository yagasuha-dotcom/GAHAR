import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ============================================================
 * ENUMS
 * ============================================================ */
export const roleEnum = pgEnum("role", ["CUSTOMER", "ADMIN", "SUPERADMIN"]);
export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
]);
export const productStatusEnum = pgEnum("product_status", [
  "AVAILABLE",
  "SOLD",
  "HIDDEN",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "WAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "QRIS",
  "BANK_TRANSFER",
  "EWALLET",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
]);
export const couponTypeEnum = pgEnum("coupon_type", ["PERCENT", "NOMINAL"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER",
  "PAYMENT",
  "STOCK",
  "SYSTEM",
]);

/* ============================================================
 * USERS
 * ============================================================ */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    avatarUrl: text("avatar_url"),
    role: roleEnum("role").notNull().default("CUSTOMER"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    provider: varchar("provider", { length: 30 }).default("credentials"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_uq").on(t.email),
  }),
);

/* ============================================================
 * CATEGORIES (Games)
 * ============================================================ */
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    icon: text("icon"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUq: uniqueIndex("categories_slug_uq").on(t.slug),
  }),
);

/* ============================================================
 * PRODUCTS (Game Accounts)
 * ============================================================ */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    game: varchar("game", { length: 120 }).notNull(),
    rank: varchar("rank", { length: 60 }),
    level: integer("level").default(0),
    region: varchar("region", { length: 60 }),
    skins: integer("skins").default(0),
    heroes: integer("heroes").default(0),
    items: integer("items").default(0),
    diamonds: integer("diamonds").default(0),
    description: text("description"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    videoUrl: text("video_url"),
    price: integer("price").notNull(),
    discountPrice: integer("discount_price"),
    stock: integer("stock").notNull().default(1),
    status: productStatusEnum("status").notNull().default("AVAILABLE"),
    isFlashSale: boolean("is_flash_sale").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    soldCount: integer("sold_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    // Sensitive credentials — only released after payment.
    credentials: jsonb("credentials").$type<{
      login?: string;
      password?: string;
      notes?: string;
    }>(),
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUq: uniqueIndex("products_slug_uq").on(t.slug),
    gameIdx: index("products_game_idx").on(t.game),
    statusIdx: index("products_status_idx").on(t.status),
  }),
);

/* ============================================================
 * ORDERS
 * ============================================================ */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderCode: varchar("order_code", { length: 40 }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    customerEmail: varchar("customer_email", { length: 190 }).notNull(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    uniqueCode: integer("unique_code").notNull().default(0),
    total: integer("total").notNull(),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    couponCode: varchar("coupon_code", { length: 60 }),
    paymentMethod: paymentMethodEnum("payment_method"),
    paymentDeadline: timestamp("payment_deadline", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    codeUq: uniqueIndex("orders_code_uq").on(t.orderCode),
    userIdx: index("orders_user_idx").on(t.userId),
  }),
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  productImage: text("product_image"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  // Copy of credentials at delivery time.
  deliveredData: jsonb("delivered_data").$type<{
    login?: string;
    password?: string;
    notes?: string;
  }>(),
});

/* ============================================================
 * PAYMENTS
 * ============================================================ */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  method: paymentMethodEnum("method").notNull(),
  provider: varchar("provider", { length: 60 }),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  proofUrl: text("proof_url"),
  reference: varchar("reference", { length: 120 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * COUPONS
 * ============================================================ */
export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 60 }).notNull(),
    type: couponTypeEnum("type").notNull(),
    value: integer("value").notNull(),
    minPurchase: integer("min_purchase").notNull().default(0),
    maxUse: integer("max_use").notNull().default(0),
    usedCount: integer("used_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    codeUq: uniqueIndex("coupons_code_uq").on(t.code),
  }),
);

/* ============================================================
 * REVIEWS
 * ============================================================ */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: varchar("user_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * WISHLIST
 * ============================================================ */
export const wishlist = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniquePair: uniqueIndex("wishlist_user_product_uq").on(t.userId, t.productId),
  }),
);

/* ============================================================
 * NOTIFICATIONS
 * ============================================================ */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  forAdmin: boolean("for_admin").notNull().default(false),
  type: notificationTypeEnum("type").notNull().default("SYSTEM"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * ACTIVITY LOGS
 * ============================================================ */
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 80 }),
  entityId: integer("entity_id"),
  meta: jsonb("meta"),
  ip: varchar("ip", { length: 60 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * SETTINGS (single row, JSON)
 * ============================================================ */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * BANNERS
 * ============================================================ */
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  position: varchar("position", { length: 40 }).notNull().default("HERO"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * ARTICLES (Blog)
 * ============================================================ */
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    thumbnail: text("thumbnail"),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    category: varchar("category", { length: 80 }),
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUq: uniqueIndex("articles_slug_uq").on(t.slug),
  }),
);

/* ============================================================
 * TESTIMONIALS
 * ============================================================ */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 120 }),
  avatarUrl: text("avatar_url"),
  message: text("message").notNull(),
  rating: integer("rating").notNull().default(5),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 * RELATIONS
 * ============================================================ */
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlist: many(wishlist),
  reviews: many(reviews),
  notifications: many(notifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
