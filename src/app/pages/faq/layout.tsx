import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Zayelle",
  description: "Frequently asked questions about Zayelle — shipping, returns, sizing, care instructions, and more.",
  alternates: {
    canonical: "https://zayelle.in/pages/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
