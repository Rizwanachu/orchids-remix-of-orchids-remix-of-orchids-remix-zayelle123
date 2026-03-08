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
import { homepageSections } from "../../shared/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

  try {
    const rows = await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.displayOrder));

    if (rows.length > 0) {
      sectionNames = rows
        .filter((s) => s.isVisible === 1)
        .map((s) => s.sectionName);
    }
  } catch {
    sectionNames = DEFAULT_ORDER;
  }

  return (
    <>
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
