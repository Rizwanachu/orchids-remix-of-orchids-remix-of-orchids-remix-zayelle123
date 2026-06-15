import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Zayelle",
  description: "Easy 7-day returns and hassle-free exchanges on eligible Zayelle products. Learn how to return or exchange your hijab purchase.",
  keywords: "zayelle return policy, hijab exchange india, zayelle returns, return hijab india",
  alternates: { canonical: "https://zayelle.in/pages/returns-exchange" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://zayelle.in/pages/returns-exchange",
  name: "Returns & Exchange Policy — Zayelle",
  description: "Easy 7-day returns and hassle-free exchanges on eligible Zayelle products.",
  url: "https://zayelle.in/pages/returns-exchange",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Returns & Exchange", item: "https://zayelle.in/pages/returns-exchange" },
    ],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function ReturnsExchangeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
