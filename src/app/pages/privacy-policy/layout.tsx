import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zayelle",
  description: "Zayelle privacy policy — how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "https://zayelle.in/pages/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
