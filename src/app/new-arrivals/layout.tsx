import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Hijab Arrivals 2025 | Latest Premium Hijabs India — Zayelle",
  description: "Discover Zayelle's latest hijab arrivals — new premium satin silk, jersey, and chiffon hijabs now available online in India. Shop new modest wear arrivals with free delivery above ₹1,950.",
  keywords: "new hijabs india 2025, latest hijabs online, new arrival hijabs, new modest wear india, new satin hijab, new jersey hijab india",
  openGraph: {
    title: "New Hijab Arrivals | Latest Premium Hijabs India — Zayelle",
    description: "Discover Zayelle's latest hijab arrivals — satin silk, jersey and chiffon. Free delivery above ₹1,950.",
    url: "https://zayelle.in/new-arrivals",
    type: "website",
  },
  alternates: {
    canonical: "https://zayelle.in/new-arrivals",
  },
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
