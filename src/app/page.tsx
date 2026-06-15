import type { Metadata } from "next";
import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import CollectionsGrid from "@/components/sections/collections-grid";
import NewArrivalsCarousel from "@/components/sections/new-arrivals-carousel";
import PromoBanners from "@/components/sections/promo-banners";
import CuratedGrid from "@/components/sections/curated-grid";
import InstagramFeed from "@/components/sections/instagram-feed";
import Testimonials from "@/components/sections/testimonials";
import TrustBar from "@/components/sections/trust-bar";
import GiftHampers from "@/components/sections/gift-hampers";
import Footer from "@/components/sections/footer";
import { db } from "../../server/db";
import { homepageSections, communityTestimonials } from "../../shared/schema";
import { asc, eq, avg, count } from "drizzle-orm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Best Hijabs in India | Premium Satin, Jersey & Chiffon Hijabs — Zayelle",
  description: "Shop India's best hijabs — premium satin silk, soft jersey, and chiffon hijabs. Zayelle offers modest fashion for the modern Indian woman. Free delivery above ₹1,950. All-India shipping.",
  keywords: "best hijab in india, buy hijabs online india, premium satin hijab, jersey hijab india, chiffon hijab, best abaya india, modest fashion india, hijab brand india, soft jersey hijab, premium hijab online, best hijab brand india",
  openGraph: {
    title: "Best Hijabs in India | Premium Satin, Jersey & Chiffon Hijabs — Zayelle",
    description: "Shop India's best hijabs — premium satin silk, soft jersey, and chiffon hijabs. Free delivery above ₹1,950.",
    url: "https://zayelle.in",
    siteName: "Zayelle",
    type: "website",
    images: [
      {
        url: "https://zayelle.in/logo.png",
        width: 1200,
        height: 630,
        alt: "Zayelle — Premium Hijabs India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Hijabs in India | Zayelle",
    description: "Shop India's best premium hijabs — satin, jersey, chiffon. Free delivery above ₹1,950.",
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
  description: "India's premium hijab and modest fashion brand. Shop chiffon, satin silk, jersey hijabs and abayas with all-India delivery.",
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
    description: "India's premium hijab and modest fashion brand — satin silk, jersey, chiffon hijabs, abayas and accessories with all-India delivery.",
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
      name: "Hijabs & Modest Fashion",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Satin Silk Hijabs" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Jersey Hijabs" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chiffon Hijabs" } },
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
  collections: CollectionsGrid,
  "new-arrivals": NewArrivalsCarousel,
  "promo-banners": PromoBanners,
  "gift-hampers": GiftHampers,
  "zayelle-edit": CuratedGrid,
  "instagram-feed": InstagramFeed,
  testimonials: Testimonials,
  "trust-bar": TrustBar,
};

const DEFAULT_ORDER = [
  "hero",
  "collections",
  "new-arrivals",
  "promo-banners",
  "gift-hampers",
  "zayelle-edit",
  "instagram-feed",
  "testimonials",
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
      sectionNames = sectionsRows
        .filter((s) => s.isVisible === 1)
        .map((s) => s.sectionName);
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
