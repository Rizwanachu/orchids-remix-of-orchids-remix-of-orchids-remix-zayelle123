import type { Metadata } from "next";
import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import WhatsAppStrip from "@/components/sections/whatsapp-strip";
import CollectionsGrid from "@/components/sections/collections-grid";
import NewArrivalsCarousel from "@/components/sections/new-arrivals-carousel";
import PromoBanners from "@/components/sections/promo-banners";
import CuratedGrid from "@/components/sections/curated-grid";
import InstagramFeed from "@/components/sections/instagram-feed";
import Testimonials from "@/components/sections/testimonials";
import TrustBar from "@/components/sections/trust-bar";
import GiftHampers from "@/components/sections/gift-hampers";
import BundlesSection from "@/components/sections/bundles-section";
import LimitedEditionBanner from "@/components/sections/limited-edition-banner";
import Footer from "@/components/sections/footer";
import { db } from "../../server/db";
import { homepageSections, communityTestimonials } from "../../shared/schema";
import { asc, eq, avg, count } from "drizzle-orm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Women's Fashion, Hijabs & Accessories India | Zayelle",
  description: "Shop India's premium women's fashion — hijabs, abayas, accessories & curated gift hampers. Zayelle delivers elegant modest wear for modern Indian women. Free delivery above ₹1,950. Pan India shipping.",
  keywords: "best hijab in india, buy hijabs online india, premium satin hijab, jersey hijab india, chiffon hijab, best abaya india, modest fashion india, hijab brand india, women fashion india, premium hijab online, best hijab brand india",
  openGraph: {
    title: "Women's Fashion, Hijabs & Accessories India | Zayelle",
    description: "Shop India's premium women's fashion — hijabs, abayas, accessories & gift hampers. Free delivery above ₹1,950.",
    url: "https://zayelle.in",
    siteName: "Zayelle",
    type: "website",
    images: [
      {
        url: "https://zayelle.in/logo.png",
        width: 1200,
        height: 630,
        alt: "Zayelle — Premium Women's Fashion India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Women's Fashion, Hijabs & Accessories | Zayelle",
    description: "Shop India's best premium hijabs, abayas, accessories. Free delivery above ₹1,950.",
  },
  alternates: {
    canonical: "https://zayelle.in",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zayelle",
  url: "https://zayelle.in",
  logo: {
    "@type": "ImageObject",
    url: "https://zayelle.in/logo.png",
    width: 200,
    height: 60,
  },
  description: "India's premium women's fashion brand — hijabs, abayas, accessories and gift hampers with all-India delivery.",
  foundingDate: "2023",
  areaServed: "IN",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "zayelle.in@gmail.com",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://www.instagram.com/zayelle.in",
  ],
};

function buildLocalBusinessJsonLd(ratingValue: number | null, reviewCount: number) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Zayelle",
    url: "https://zayelle.in",
    logo: "https://zayelle.in/logo.png",
    image: "https://zayelle.in/logo.png",
    description: "India's premium women's fashion brand — hijabs, abayas, accessories and curated gift hampers with all-India delivery.",
    email: "zayelle.in@gmail.com",
    areaServed: { "@type": "Country", name: "India" },
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Women's Fashion & Accessories",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Satin Silk Hijabs" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Jersey Hijabs" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chiffon Hijabs" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Abayas" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Hijab Gift Hampers" } },
      ],
    },
    sameAs: ["https://www.instagram.com/zayelle.in"],
  };
  if (ratingValue !== null && reviewCount > 0) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return base;
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zayelle",
  url: "https://zayelle.in",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://zayelle.in/products?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const SECTION_MAP: Record<string, React.ComponentType> = {
  hero: HeroSection,
  "whatsapp-strip": WhatsAppStrip,
  collections: CollectionsGrid,
  "new-arrivals": NewArrivalsCarousel,
  "promo-banners": PromoBanners,
  "gift-hampers": GiftHampers,
  "zayelle-edit": CuratedGrid,
  "instagram-feed": InstagramFeed,
  testimonials: Testimonials,
  "trust-bar": TrustBar,
  bundles: BundlesSection,
  "limited-edition": LimitedEditionBanner,
};

const DEFAULT_ORDER = [
  "hero",
  "whatsapp-strip",
  "new-arrivals",
  "testimonials",
  "bundles",
  "collections",
  "promo-banners",
  "gift-hampers",
  "limited-edition",
  "zayelle-edit",
  "instagram-feed",
  "trust-bar",
];

export default async function Home() {
  let sectionNames: string[] = DEFAULT_ORDER;
  let avgRating: number | null = null;
  let reviewCount = 0;

  try {
    const [sectionsRows, ratingRows] = await Promise.all([
      db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder)),
      db
        .select({
          avgRating: avg(communityTestimonials.rating),
          total: count(),
        })
        .from(communityTestimonials)
        .where(eq(communityTestimonials.isActive, 1)),
    ]);

    if (sectionsRows.length > 0) {
      const visibleSet = new Set(
        sectionsRows.filter((s) => s.isVisible === 1).map((s) => s.sectionName)
      );
      // Always enforce the canonical CRO order; keep only sections the DB marks visible
      // plus always-on sections (hero, whatsapp-strip, bundles, limited-edition).
      const CANONICAL_ORDER = [
        "hero",
        "whatsapp-strip",
        "new-arrivals",
        "testimonials",
        "bundles",
        "collections",
        "promo-banners",
        "gift-hampers",
        "limited-edition",
        "zayelle-edit",
        "instagram-feed",
        "trust-bar",
      ];
      const alwaysOn = new Set(["hero", "whatsapp-strip", "bundles", "limited-edition"]);
      sectionNames = CANONICAL_ORDER.filter(
        (name) => alwaysOn.has(name) || visibleSet.has(name)
      );
    }

    const ratingRow = ratingRows[0];
    if (ratingRow && ratingRow.total > 0 && ratingRow.avgRating) {
      avgRating = parseFloat(String(ratingRow.avgRating));
      reviewCount = ratingRow.total;
    }
  } catch {
    sectionNames = DEFAULT_ORDER;
  }

  const localBusinessJsonLd = buildLocalBusinessJsonLd(avgRating, reviewCount);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Header />
      {sectionNames.map((name) => {
        const Component = SECTION_MAP[name];
        if (!Component) return null;
        return <Component key={name} />;
      })}
      <Footer />
    </>
  );
}
