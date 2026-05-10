import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hijab Gift Hampers India | Best Gift Sets for Her — Zayelle",
  description: "Shop Zayelle's curated hijab gift hampers — the best modest fashion gift sets for women in India. Premium hijab sets, accessory bundles and thoughtful gift options. All-India delivery.",
  keywords: "hijab gift hamper india, best gift for her india, modest fashion gift set, hijab gift set india, eid gift hamper, gift for muslim woman india",
  openGraph: {
    title: "Hijab Gift Hampers India | Zayelle",
    description: "Curated hijab gift hampers — the best modest fashion gift sets for women in India.",
    url: "https://zayelle.in/gift-hampers",
    type: "website",
  },
  alternates: {
    canonical: "https://zayelle.in/gift-hampers",
  },
};

export default function GiftHampersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
