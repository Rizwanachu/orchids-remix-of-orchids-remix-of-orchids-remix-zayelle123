import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hijab Collections | Chiffon, Satin, Jersey & More — Zayelle India",
  description: "Explore Zayelle's curated hijab collections — premium chiffon hijabs, satin silk hijabs, soft jersey wraps, occasion hijabs, and everyday essentials. Shop by collection and find your perfect modest wear.",
  keywords: "hijab collections india, chiffon hijab collection, satin hijab collection, jersey hijab collection, best hijab collection india, modest fashion collections",
  openGraph: {
    title: "Hijab Collections | Zayelle India",
    description: "Explore Zayelle's curated hijab collections — chiffon, satin silk, jersey and more.",
    url: "https://zayelle.in/collections",
    type: "website",
  },
  alternates: {
    canonical: "https://zayelle.in/collections",
  },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
