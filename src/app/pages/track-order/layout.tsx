import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Zayelle Order | Live Order Status India",
  description: "Track your Zayelle hijab order status in real time. Enter your order ID or email to see live delivery updates.",
  keywords: "track zayelle order, zayelle order status, hijab order tracking india",
  alternates: { canonical: "https://zayelle.in/pages/track-order" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://zayelle.in/pages/track-order",
  name: "Track Your Order — Zayelle",
  description: "Track your Zayelle order status in real time. Enter your order ID or email address.",
  url: "https://zayelle.in/pages/track-order",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Track Order", item: "https://zayelle.in/pages/track-order" },
    ],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
