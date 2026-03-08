import { sqliteTable, text, integer, numeric, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey(),
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
  emailSent: integer("email_sent").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productName: text("product_name").notNull(),
  productHandle: text("product_handle"),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }),
  maxUsage: integer("max_usage"),
  currentUsage: integer("current_usage").notNull().default(0),
  expiryDate: text("expiry_date"),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAt: numeric("compare_at", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  hoverImage: text("hover_image").notNull().default(""),
  badge: text("badge"),
  description: text("description").notNull().default(""),
  details: text("details"),
  dimension: text("dimension").notNull().default(""),
  material: text("material").notNull().default(""),
  careInstructions: text("care_instructions").notNull().default(""),
  category: text("category").notNull().default(""),
  stockQuantity: integer("stock_quantity").notNull().default(100),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull().default("49"),
  shippingCostKerala: numeric("shipping_cost_kerala", { precision: 10, scale: 2 }).notNull().default("49"),
  isFreeShipping: integer("is_free_shipping").notNull().default(0),
  gallery: text("gallery"),
  colors: text("colors"),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const adminActivityLogs = sqliteTable("admin_activity_logs", {
  id: integer("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  adminEmail: text("admin_email"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const collections = sqliteTable("collections", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: integer("is_featured").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const newArrivals = sqliteTable("new_arrivals", {
  id: integer("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const zayelleEdits = sqliteTable("zayelle_edits", {
  id: integer("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  buttonText: text("button_text").notNull().default("Shop Now"),
  redirectLink: text("redirect_link").notNull().default(""),
  productIds: text("product_ids"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  buttonText: text("button_text").notNull().default("Shop Now"),
  buttonLink: text("button_link").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  position: text("position", { enum: ["hero", "mid-left", "mid-right"] }).notNull().default("hero"),
  isActive: integer("is_active").notNull().default(1),
  titleFont: text("title_font").notNull().default("serif"),
  titleColor: text("title_color").notNull().default("#5C4B3D"),
  subtitleColor: text("subtitle_color").notNull().default("#5C4B3D"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const giftHampers = sqliteTable("gift_hampers", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  includedProductIds: text("included_product_ids"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const homepageSettings = sqliteTable("homepage_settings", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const homepageSections = sqliteTable("homepage_sections", {
  id: integer("id").primaryKey(),
  sectionName: text("section_name").notNull().unique(),
  label: text("label").notNull().default(""),
  isVisible: integer("is_visible").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
});

export const dmTestimonials = sqliteTable("dm_testimonials", {
  id: integer("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull().default(""),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const themeSettings = sqliteTable("theme_settings", {
  id: integer("id").primaryKey(),
  fontFamily: text("font_family").notNull().default("Inter"),
  headingFontFamily: text("heading_font_family").notNull().default("'Playfair Display', serif"),
  fontSize: text("font_size").notNull().default("16px"),
  primaryColor: text("primary_color").notNull().default("#5C4B3D"),
  secondaryColor: text("secondary_color").notNull().default("#ffffff"),
  backgroundColor: text("background_color").notNull().default("#FAF9F6"),
  textColor: text("text_color").notNull().default("#1A1A1A"),
  heroTitleColor: text("hero_title_color").notNull().default("#1A1A1A"),
  heroSubtitleColor: text("hero_subtitle_color").notNull().default("#757575"),
  sectionTitleColor: text("section_title_color").notNull().default("#1A1A1A"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const pageContents = sqliteTable("page_contents", {
  id: integer("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  isPublished: integer("is_published").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: blob("content").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const badges = sqliteTable("badges", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  color: text("color").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const productTemplates = sqliteTable("product_templates", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  details: text("details").notNull().default(""),
  dimension: text("dimension").notNull().default(""),
  material: text("material").notNull().default(""),
  careInstructions: text("care_instructions").notNull().default(""),
  shippingPolicy: text("shipping_policy").notNull().default(""),
  returnPolicy: text("return_policy").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const productColors = sqliteTable("product_colors", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  hexValue: text("hex_value").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
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
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ThemeSetting = typeof themeSettings.$inferSelect;
export type PageContent = typeof pageContents.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type ProductTemplate = typeof productTemplates.$inferSelect;
export type ProductColor = typeof productColors.$inferSelect;
