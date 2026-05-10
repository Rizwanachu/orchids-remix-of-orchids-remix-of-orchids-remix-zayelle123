import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Zayelle",
  description: "Zayelle shipping policy — delivery timelines, charges, and everything you need to know about how we ship across India.",
  alternates: {
    canonical: "https://zayelle.in/pages/shipping-policy",
  },
};

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
