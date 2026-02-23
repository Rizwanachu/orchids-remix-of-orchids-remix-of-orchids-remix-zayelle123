import { pgTable, text, serial, timestamp, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status", { enum: ["paid", "unpaid", "failed", "refunded"] }).notNull().default("unpaid"),
  orderStatus: text("order_status", { enum: ["processing", "confirmed", "packed", "shipped", "delivered", "cancelled"] }).notNull().default("processing"),
  paymentMethod: text("payment_method"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  trackingNumber: text("tracking_number"),
  trackingCarrier: text("tracking_carrier"),
  couponCode: text("coupon_code"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productName: text("product_name").notNull(),
  productHandle: text("product_handle"),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }),
  maxUsage: integer("max_usage"),
  currentUsage: integer("current_usage").notNull().default(0),
  expiryDate: timestamp("expiry_date"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAt: numeric("compare_at", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  hoverImage: text("hover_image").notNull().default(""),
  badge: text("badge"),
  description: text("description").notNull().default(""),
  details: text("details").array(),
  shippingPolicy: text("shipping_policy").notNull().default(""),
  returnPolicy: text("return_policy").notNull().default(""),
  category: text("category").notNull().default(""),
  stockQuantity: integer("stock_quantity").notNull().default(100),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  adminEmail: text("admin_email"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newArrivals = pgTable("new_arrivals", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const zayelleEdits = pgTable("zayelle_edits", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  buttonText: text("button_text").notNull().default("Shop Now"),
  redirectLink: text("redirect_link").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  buttonText: text("button_text").notNull().default("Shop Now"),
  buttonLink: text("button_link").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  position: text("position", { enum: ["hero", "mid-left", "mid-right"] }).notNull().default("hero"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const giftHampers = pgTable("gift_hampers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  includedProductIds: integer("included_product_ids").array(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const homepageSettings = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionName: text("section_name").notNull().unique(),
  label: text("label").notNull().default(""),
  isVisible: boolean("is_visible").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export const dmTestimonials = pgTable("dm_testimonials", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull().default(""),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type DbProduct = typeof products.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type NewArrival = typeof newArrivals.$inferSelect;
export type ZayelleEdit = typeof zayelleEdits.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type GiftHamper = typeof giftHampers.$inferSelect;
export type HomepageSetting = typeof homepageSettings.$inferSelect;
export type HomepageSection = typeof homepageSections.$inferSelect;
export type DmTestimonial = typeof dmTestimonials.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type PageContent = typeof pageContents.$inferSelect;
