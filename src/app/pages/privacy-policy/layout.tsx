import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zayelle",
  description: "Zayelle privacy policy — how we collect, use, and protect your personal information when you shop with us.",
  alternates: { canonical: "https://zayelle.in/pages/privacy-policy" },
  robots: { index: true, follow: false },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://zayelle.in/pages/privacy-policy",
  name: "Privacy Policy — Zayelle",
  description: "How Zayelle collects, uses, and protects your personal information.",
  url: "https://zayelle.in/pages/privacy-policy",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://zayelle.in/pages/privacy-policy" },
    ],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
