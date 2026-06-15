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

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Zayelle",
  url: "https://zayelle.in/pages/about-us",
  description: "Zayelle is India's premium hijab and modest fashion brand founded in 2023. We craft high-quality satin silk, jersey, and chiffon hijabs for the modern Indian woman.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "About Us", item: "https://zayelle.in/pages/about-us" },
    ],
  },
  mainEntity: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zayelle",
    url: "https://zayelle.in",
    logo: "https://zayelle.in/logo.png",
    description: "India's premium hijab and modest fashion brand. Shop chiffon, satin silk, jersey hijabs and abayas with all-India delivery.",
    foundingDate: "2023",
    areaServed: "IN",
    email: "zayelle.in@gmail.com",
    knowsAbout: ["Hijabs", "Modest Fashion", "Satin Silk", "Chiffon", "Jersey Fabric", "Islamic Fashion", "Women's Fashion India"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "zayelle.in@gmail.com",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://www.instagram.com/zayelle.in"],
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      {children}
    </>
  );
}
