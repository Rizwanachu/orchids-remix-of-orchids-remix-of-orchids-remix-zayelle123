import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Zayelle",
  description: "Zayelle terms of service — our terms and conditions for using our website and purchasing our products.",
  alternates: {
    canonical: "https://zayelle.in/pages/terms-of-service",
  },
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
