import { pgTable, text, integer, serial, numeric, customType } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
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
  source: text("source", { enum: ["website", "instagram", "whatsapp", "offline", "other"] }).notNull().default("website"),
  notes: text("notes"),
  emailSent: integer("email_sent").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productName: text("product_name").notNull(),
  productHandle: text("product_handle"),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  colorSelections: text("color_selections"),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  bundleType: text("bundle_type"),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }),
  maxUsage: integer("max_usage"),
  currentUsage: integer("current_usage").notNull().default(0),
  expiryDate: text("expiry_date"),
  active: integer("active").notNull().default(1),
  couponType: text("coupon_type").notNull().default("standard"),
  autoApply: integer("auto_apply").notNull().default(0),
  applicableCollection: text("applicable_collection").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
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
  colorSwatchStyle: text("color_swatch_style").notNull().default("pills"),
  sizes: text("sizes"),
  deliveryCharges: text("delivery_charges"),
  bundlePricing: text("bundle_pricing"),
  shippingPolicy: text("shipping_policy").notNull().default(""),
  returnPolicy: text("return_policy").notNull().default(""),
  active: integer("active").notNull().default(1),
  customHamperEnabled: integer("custom_hamper_enabled").notNull().default(0),
  customHamperTitle: text("custom_hamper_title"),
  customHamperBody: text("custom_hamper_body"),
  customHamperInstagram: text("custom_hamper_instagram"),
  customHamperContact: text("custom_hamper_contact"),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  weight: text("weight").notNull().default(""),
  estimatedShipping: text("estimated_shipping").notNull().default(""),
  deliveryDays: text("delivery_days").notNull().default(""),
  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  adminEmail: text("admin_email"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: integer("is_featured").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  showOnHomepage: integer("show_on_homepage").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const newArrivals = pgTable("new_arrivals", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  colorSlug: text("color_slug"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const zayelleEdits = pgTable("zayelle_edits", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  buttonText: text("button_text").notNull().default("Shop Now"),
  redirectLink: text("redirect_link").notNull().default(""),
  productIds: text("product_ids"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
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
  titleFontSizeDesktop: text("title_font_size_desktop").notNull().default("64px"),
  titleFontSizeMobile: text("title_font_size_mobile").notNull().default("32px"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  productIds: text("product_ids").default("[]"),
  bannerType: text("banner_type").notNull().default("homepage"),
  scheduleStart: text("schedule_start"),
  scheduleEnd: text("schedule_end"),
});

export const giftHampers = pgTable("gift_hampers", {
  id: serial("id").primaryKey(),
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

export const homepageSettings = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionName: text("section_name").notNull().unique(),
  label: text("label").notNull().default(""),
  isVisible: integer("is_visible").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
});

export const dmTestimonials = pgTable("dm_testimonials", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
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
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
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

export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  isPublished: integer("is_published").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: bytea("content").notNull(),
  cloudinaryUrl: text("cloudinary_url"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  color: text("color").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const productTemplates = pgTable("product_templates", {
  id: serial("id").primaryKey(),
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

export const productColors = pgTable("product_colors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hexValue: text("hex_value").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const communityTestimonials = pgTable("community_testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  location: text("location").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  isActive: integer("is_active").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const productBundles = pgTable("product_bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().default(""),
  description: text("description").notNull().default(""),
  bundleType: text("bundle_type").notNull().default("custom"),
  items: text("items").notNull().default("[]"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  badge: text("badge"),
  imageUrl: text("image_url").notNull().default(""),
  isActive: integer("is_active").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  cartCount: integer("cart_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const whatsappLeads = pgTable("whatsapp_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  sourcePage: text("source_page").notNull().default(""),
  productName: text("product_name").notNull().default(""),
  productHandle: text("product_handle").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  products: text("products").notNull().default("[]"),
  cartValue: numeric("cart_value", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pagePath: text("page_path").notNull().unique(),
  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  keywords: text("keywords").notNull().default(""),
  canonicalUrl: text("canonical_url").notNull().default(""),
  ogImage: text("og_image").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
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
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type SeoSetting = typeof seoSettings.$inferSelect;
export type ProductTemplate = typeof productTemplates.$inferSelect;
export type ProductColor = typeof productColors.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ProductBundle = typeof productBundles.$inferSelect;
export type WhatsappLead = typeof whatsappLeads.$inferSelect;
