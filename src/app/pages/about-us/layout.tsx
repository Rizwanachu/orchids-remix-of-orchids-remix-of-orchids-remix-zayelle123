import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zayelle | India's Best Hijab & Modest Fashion Brand",
  description: "Learn about Zayelle — India's premium hijab brand. We craft high-quality satin silk, jersey, and chiffon hijabs for the modern Indian woman. Where modesty meets elegance.",
  keywords: "best hijab brand india, zayelle hijab, premium hijab brand india, modest fashion brand india, hijab company india",
  openGraph: {
    title: "About Zayelle | India's Best Hijab Brand",
    description: "India's premium hijab brand — satin silk, jersey, and chiffon hijabs crafted for the modern woman.",
    url: "https://zayelle.in/pages/about-us",
    type: "website",
  },
  alternates: {
    canonical: "https://zayelle.in/pages/about-us",
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
