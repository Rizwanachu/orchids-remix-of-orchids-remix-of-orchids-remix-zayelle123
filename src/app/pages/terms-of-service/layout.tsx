import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Zayelle",
  description: "Zayelle terms of service — the terms and conditions for purchasing from and using our website.",
  alternates: { canonical: "https://zayelle.in/pages/terms-of-service" },
  robots: { index: true, follow: false },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://zayelle.in/pages/terms-of-service",
  name: "Terms of Service — Zayelle",
  description: "Terms and conditions for purchasing from and using the Zayelle website.",
  url: "https://zayelle.in/pages/terms-of-service",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://zayelle.in/pages/terms-of-service" },
    ],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
