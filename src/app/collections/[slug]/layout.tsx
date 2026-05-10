import type { Metadata } from "next";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://zayelle.in";

const SLUG_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  "premium-jersey-wraps": {
    title: "Best Jersey Hijabs India | Soft Premium Jersey Wraps — Zayelle",
    description: "Shop India's best soft jersey hijabs. Zayelle's premium jersey wraps are breathable, comfortable and perfect for everyday wear. Free delivery above ₹1,950. All-India shipping.",
    keywords: "best jersey hijab india, soft jersey hijab, premium jersey wrap india, jersey hijab online, jersey wrap hijab",
  },
  "satin-silk-hijabs": {
    title: "Premium Satin Silk Hijabs India | Buy Online — Zayelle",
    description: "Shop Zayelle's premium satin silk hijabs — luxurious, smooth, and elegant. The best satin hijabs in India for weddings, occasions, and everyday elegance. Free delivery above ₹1,950.",
    keywords: "best satin hijab india, premium satin hijab online, satin silk hijab india, satin hijab buy online, luxury hijab india",
  },
  "chiffon-hijabs": {
    title: "Premium Chiffon Hijabs India | Best Chiffon Wraps — Zayelle",
    description: "Shop Zayelle's premium chiffon hijabs — lightweight, flowy and perfect for warm Indian weather. Best chiffon hijabs online in India. Free delivery above ₹1,950.",
    keywords: "best chiffon hijab india, chiffon hijab online india, lightweight hijab india, flowy hijab india, chiffon wrap india",
  },
  "occasion-hijabs": {
    title: "Occasion Hijabs India | Party & Wedding Hijabs — Zayelle",
    description: "Shop Zayelle's occasion hijabs — perfect for weddings, Eid, parties and special events. Premium modest wear for Indian occasions. Free delivery above ₹1,950.",
    keywords: "occasion hijab india, wedding hijab india, eid hijab india, party hijab india, best hijab for events",
  },
  "everyday-essentials": {
    title: "Everyday Hijabs India | Comfortable Daily Wear — Zayelle",
    description: "Shop Zayelle's everyday hijab essentials — comfortable, durable, and stylish for daily wear. Best everyday hijabs in India. Free delivery above ₹1,950.",
    keywords: "everyday hijab india, daily wear hijab, comfortable hijab india, best everyday hijab, casual hijab india",
  },
  accessories: {
    title: "Hijab Accessories India | Pins, Caps & More — Zayelle",
    description: "Shop Zayelle's hijab accessories — underscarves, pins, caps and more. Complete your modest look with premium hijab accessories in India.",
    keywords: "hijab accessories india, hijab pins india, hijab cap india, underscarf india, modest accessories india",
  },
};

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const seo = SLUG_SEO[slug];

  try {
    const rows = await db
      .select({ title: collections.title, subtitle: collections.subtitle, imageUrl: collections.imageUrl })
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);

    const collection = rows[0];

    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: {
          title: seo.title,
          description: seo.description,
          url: `${BASE_URL}/collections/${slug}`,
          type: "website",
          images: collection?.imageUrl
            ? [{ url: collection.imageUrl, alt: collection.title }]
            : [],
        },
        twitter: {
          card: "summary_large_image",
          title: seo.title,
          description: seo.description,
        },
        alternates: { canonical: `${BASE_URL}/collections/${slug}` },
      };
    }

    if (collection) {
      const title = `${collection.title} | Shop Online India — Zayelle`;
      const description = `${collection.subtitle || `Shop Zayelle's ${collection.title} collection. Premium modest fashion with free delivery above ₹1,950 across India.`}`;
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${BASE_URL}/collections/${slug}`,
          type: "website",
          images: collection.imageUrl
            ? [{ url: collection.imageUrl, alt: collection.title }]
            : [],
        },
        alternates: { canonical: `${BASE_URL}/collections/${slug}` },
      };
    }
  } catch {
    // Fail silently
  }

  return {
    alternates: { canonical: `${BASE_URL}/collections/${slug}` },
  };
}

export default function CollectionSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
