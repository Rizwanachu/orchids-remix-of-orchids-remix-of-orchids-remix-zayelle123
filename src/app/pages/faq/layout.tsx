import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Hijab Care, Shipping & Returns — Zayelle India",
  description: "Frequently asked questions about Zayelle hijabs — fabric care, delivery timelines, return policy, sizing, and more. Get answers to all your hijab shopping questions.",
  keywords: "hijab care instructions, hijab washing tips, hijab delivery india, hijab return policy, satin hijab care",
  alternates: {
    canonical: "https://zayelle.in/pages/faq",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does delivery take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We deliver across India within 5-7 business days. Metro cities may receive orders sooner, typically within 3-5 business days.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer free shipping?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We offer free shipping on all orders above ₹1,950. Orders below ₹1,950 have a flat shipping charge of ₹49.",
      },
    },
    {
      "@type": "Question",
      name: "What fabrics are used in Zayelle hijabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use premium fabrics including chiffon, satin silk, premium jersey, modal, and linen. Each fabric is carefully selected for quality, drape, and comfort.",
      },
    },
    {
      "@type": "Question",
      name: "What is the return policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept returns within 7 days of delivery. Items must be unused, unwashed, and in their original packaging with tags attached.",
      },
    },
    {
      "@type": "Question",
      name: "How do I care for my hijab?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We recommend hand washing in cold water with mild detergent. Avoid wringing — gently squeeze out excess water and lay flat to dry. Iron on low heat if needed.",
      },
    },
    {
      "@type": "Question",
      name: "What size are Zayelle hijabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our standard hijabs are approximately 175cm x 75cm, providing generous coverage for various styling options.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept UPI, credit/debit cards, net banking, and cash on delivery (COD) for eligible orders.",
      },
    },
    {
      "@type": "Question",
      name: "Do you ship internationally?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Currently, we only ship within India. International shipping is coming soon!",
      },
    },
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
