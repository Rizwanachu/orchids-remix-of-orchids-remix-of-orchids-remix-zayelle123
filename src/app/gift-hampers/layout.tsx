import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Hampers | Zayelle",
  description: "Thoughtfully curated gift hampers from Zayelle. Perfect gifting solutions for her — premium hijabs, accessories, and modest fashion essentials.",
  alternates: {
    canonical: "https://zayelle.in/gift-hampers",
  },
};

export default function GiftHampersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
