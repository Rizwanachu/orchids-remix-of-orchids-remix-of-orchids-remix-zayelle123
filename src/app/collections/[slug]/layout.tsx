import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `https://zayelle.in/collections/${slug}`,
    },
  };
}

export default function CollectionSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
