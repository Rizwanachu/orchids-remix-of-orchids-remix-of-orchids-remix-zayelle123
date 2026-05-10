import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Premium Hijabs Online India | Satin, Jersey & Chiffon Hijabs — Zayelle",
  description: "Shop India's best hijabs and modest wear online. Premium satin silk hijabs, soft jersey hijabs, chiffon hijabs, abayas and accessories. Free delivery above ₹1,950. All-India shipping by Zayelle.",
  keywords: "buy hijabs online india, best hijab india, premium satin hijab india, jersey hijab india, chiffon hijab online, best abaya brand india, modest fashion india, hijab shop online india",
  openGraph: {
    title: "Buy Premium Hijabs Online India | Zayelle",
    description: "Shop India's best hijabs — satin silk, jersey, chiffon and more. Free delivery above ₹1,950.",
    url: "https://zayelle.in/products",
    type: "website",
  },
  alternates: {
    canonical: "https://zayelle.in/products",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
