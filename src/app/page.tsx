"use client";

import { useState, useEffect } from "react";
import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import CollectionsGrid from "@/components/sections/collections-grid";
import NewArrivalsCarousel from "@/components/sections/new-arrivals-carousel";
import PromoBanners from "@/components/sections/promo-banners";
import CuratedGrid from "@/components/sections/curated-grid";
import InstagramFeed from "@/components/sections/instagram-feed";
import Testimonials from "@/components/sections/testimonials";
import TrustBar from "@/components/sections/trust-bar";
import Footer from "@/components/sections/footer";

interface Section {
  sectionName: string;
  label: string;
  isVisible: boolean;
  displayOrder: number;
}

const SECTION_MAP: Record<string, React.ComponentType> = {
  hero: HeroSection,
  collections: CollectionsGrid,
  "new-arrivals": NewArrivalsCarousel,
  "promo-banners": PromoBanners,
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
  "zayelle-edit",
  "instagram-feed",
  "testimonials",
  "trust-bar",
];

export default function Home() {
  const [sections, setSections] = useState<Section[] | null>(null);

  useEffect(() => {
    fetch("/api/homepage-layout")
      .then((res) => res.json())
      .then((data) => {
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections);
        }
      })
      .catch(() => {});
  }, []);

  const renderSections = () => {
    if (sections && sections.length > 0) {
      return sections
        .filter((s) => s.isVisible)
        .map((s) => {
          const Component = SECTION_MAP[s.sectionName];
          if (!Component) return null;
          return <Component key={s.sectionName} />;
        });
    }

    return DEFAULT_ORDER.map((name) => {
      const Component = SECTION_MAP[name];
      if (!Component) return null;
      return <Component key={name} />;
    });
  };

  return (
    <>
      <Header />
      {renderSections()}
      <Footer />
    </>
  );
}
