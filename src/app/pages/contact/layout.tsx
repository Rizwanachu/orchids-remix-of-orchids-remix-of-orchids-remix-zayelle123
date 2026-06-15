import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Zayelle — Premium Hijab Brand India",
  description: "Get in touch with Zayelle. Reach out for questions about our hijabs, orders, returns, or anything else. Email us at zayelle.in@gmail.com.",
  keywords: "contact zayelle, zayelle customer support, hijab brand india contact",
  alternates: { canonical: "https://zayelle.in/pages/contact" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://zayelle.in/pages/contact",
  name: "Contact Zayelle",
  description: "Get in touch with Zayelle for questions about hijabs, orders, returns, or anything else.",
  url: "https://zayelle.in/pages/contact",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zayelle.in" },
      { "@type": "ListItem", position: 2, name: "Contact", item: "https://zayelle.in/pages/contact" },
    ],
  },
  mainEntity: {
    "@type": "Organization",
    name: "Zayelle",
    url: "https://zayelle.in",
    email: "zayelle.in@gmail.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "zayelle.in@gmail.com",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://www.instagram.com/zayelle.in"],
  },
  publisher: { "@type": "Organization", name: "Zayelle", url: "https://zayelle.in" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
