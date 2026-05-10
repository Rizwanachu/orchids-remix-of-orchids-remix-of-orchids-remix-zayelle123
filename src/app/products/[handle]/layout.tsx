import type { Metadata } from "next";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  return {
    alternates: {
      canonical: `https://zayelle.in/products/${handle}`,
    },
  };
}

export default function ProductHandleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
