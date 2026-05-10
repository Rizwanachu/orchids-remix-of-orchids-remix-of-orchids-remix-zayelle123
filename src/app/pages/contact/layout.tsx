import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Zayelle",
  description: "Get in touch with Zayelle. We're here to help with your orders, questions, and everything else.",
  alternates: {
    canonical: "https://zayelle.in/pages/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
