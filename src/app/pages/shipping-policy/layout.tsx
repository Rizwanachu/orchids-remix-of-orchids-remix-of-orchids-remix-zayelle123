import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Free Delivery Above ₹1,950 — Zayelle",
  description: "Zayelle shipping policy — free delivery across India above ₹1,950. Flat ₹49 on all other orders. Delivered within 5–7 business days.",
  keywords: "zayelle shipping policy, hijab delivery india, free shipping hijab india, zayelle delivery time",
  alternates: { canonical: "https://zayelle.in/pages/shipping-policy" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://zayelle.in/pages/shipping-policy",
  name: "Shipping Policy — Zayelle",
  description: "Free delivery across India above ₹1,950. Flat ₹49 shipping on all other orders. Delivered within 5–7 business days.",
  url: "https://zayelle.in/pages/shipping-policy",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Shipping Policy", item: "https://zayelle.in/pages/shipping-policy" },
    ],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
