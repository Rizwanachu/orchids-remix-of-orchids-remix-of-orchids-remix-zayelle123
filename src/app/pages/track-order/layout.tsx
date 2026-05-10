import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | Zayelle",
  description: "Track your Zayelle order status. Enter your order details to see the latest delivery updates.",
  alternates: {
    canonical: "https://zayelle.in/pages/track-order",
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
