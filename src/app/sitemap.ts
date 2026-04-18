import { MetadataRoute } from "next";
import { db } from "@/../server/db";
import { products, collections } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";

const BASE_URL = "https://zayelle.in";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: `${BASE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/collections`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/hijabs`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/abayas`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/accessories`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/gift-hampers`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/track-order`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productEntries: MetadataRoute.Sitemap = [];
  let collectionEntries: MetadataRoute.Sitemap = [];

  try {
    const allProducts = await db
      .select({ handle: products.handle, createdAt: products.createdAt })
      .from(products)
      .where(eq(products.active, 1));

    productEntries = allProducts.map((product) => ({
      url: `${BASE_URL}/products/${product.handle}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap: failed to fetch products", error);
  }

  try {
    const allCollections = await db
      .select({ slug: collections.slug, createdAt: collections.createdAt })
      .from(collections)
      .orderBy(asc(collections.displayOrder));

    collectionEntries = allCollections.map((collection) => ({
      url: `${BASE_URL}/collections/${collection.slug}`,
      lastModified: collection.createdAt ? new Date(collection.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap: failed to fetch collections", error);
  }

  return [...STATIC_PAGES, ...collectionEntries, ...productEntries];
}
