import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Zayelle",
  description: "Learn about Zayelle — where modesty meets elegance. Our story, mission, and commitment to bringing premium hijabs and modest accessories to women across India.",
  alternates: {
    canonical: "https://zayelle.in/pages/about-us",
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
