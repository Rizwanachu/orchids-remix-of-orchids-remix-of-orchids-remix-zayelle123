import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Zayelle — Premium Hijab Brand India",
  description: "Get in touch with Zayelle. Reach out for questions about our hijabs, orders, returns, or anything else. We're happy to help.",
  alternates: {
    canonical: "https://zayelle.in/pages/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
