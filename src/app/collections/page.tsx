import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { asc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { FolderOpen } from "lucide-react";

export const revalidate = 3600;

export default async function CollectionsPage() {
  let allCollections: { id: number; title: string; slug: string; subtitle: string | null; imageUrl: string | null; displayOrder: number | null }[] = [];

  try {
    allCollections = await db
      .select({
        id: collections.id,
        title: collections.title,
        slug: collections.slug,
        subtitle: collections.subtitle,
        imageUrl: collections.imageUrl,
        displayOrder: collections.displayOrder,
      })
      .from(collections)
      .orderBy(asc(collections.displayOrder));
  } catch {
    // Fail silently — render empty state
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              All Collections
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">Collections</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {allCollections.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={48} className="mx-auto text-[#C4B5A5] mb-4" />
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">No collections yet</h2>
              <p className="text-[14px] text-[#757575]">Check back soon for new additions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {allCollections.map((collection, idx) => (
                <a key={collection.id} href={`/collections/${collection.slug}`} className="group flex flex-col">
                  <div className="relative w-full aspect-[1/1] overflow-hidden rounded-[10px] bg-[#F5F2ED]">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.title}
                        fill
                        priority={idx < 4}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F5F2ED]">
                        <FolderOpen size={32} className="text-[#C4B5A5]" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-[14px] font-medium text-[#1A1A1A] uppercase tracking-tight group-hover:text-[#5C4B3D] transition-colors text-center">
                    {collection.title}
                  </h3>
                  {collection.subtitle && (
                    <p className="text-[12px] text-[#757575] mt-0.5 text-center">{collection.subtitle}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
