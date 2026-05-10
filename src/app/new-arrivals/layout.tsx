import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals | Zayelle",
  description: "Discover the latest hijabs and modest accessories from Zayelle. Shop our newest collection of premium hijabs, abayas, and accessories delivered across India.",
  alternates: {
    canonical: "https://zayelle.in/new-arrivals",
  },
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
