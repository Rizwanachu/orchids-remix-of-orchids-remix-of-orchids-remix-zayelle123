import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange | Zayelle",
  description: "Zayelle returns and exchange policy. Easy returns and hassle-free exchanges on eligible products.",
  alternates: {
    canonical: "https://zayelle.in/pages/returns-exchange",
  },
};

export default function ReturnsExchangeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
