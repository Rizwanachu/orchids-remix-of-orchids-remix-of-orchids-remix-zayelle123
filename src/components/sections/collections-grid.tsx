"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';

interface CollectionItemProps {
  image: string;
  title: string;
  subtitle: string;
  href: string;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ image, title, subtitle, href }) => {
  return (
    <div className="flex flex-col group cursor-pointer text-center">
      <Link href={href} className="relative w-full aspect-[1/1] overflow-hidden rounded-[10px] bg-white">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />
      </Link>
      <div className="mt-3 flex flex-col gap-0.5 w-full">
        <h3 className="text-[14px] font-medium text-foreground uppercase tracking-tight line-clamp-1">
          <Link 
            href={href}
            className="relative inline-block pb-0.5"
          >
            {title}
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        </h3>
        <p className="text-[12px] text-[#757575]">{subtitle}</p>
      </div>
    </div>
  );
};

interface CollectionData {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  imageUrl: string;
}

const CollectionsGrid: React.FC = () => {
  const { settings: themeSettings } = useTheme();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Collections");
  const [sectionSubtitle, setSectionSubtitle] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 6000);
    async function fetchData() {
      try {
        const [collectionsRes, settingsRes] = await Promise.all([
          fetch("/api/collections"),
          fetch("/api/homepage-settings").catch(() => null),
        ]);
        if (collectionsRes.ok) {
          const data = await collectionsRes.json();
          setCollections(data.collections);
        }
        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.collectionsTitle) setSectionTitle(settings.collectionsTitle);
          if (settings.collectionsSubtitle) setSectionSubtitle(settings.collectionsSubtitle);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[#FAF9F6]">
        <div className="container px-4 md:px-8">
          <div className="relative mb-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E8E4DE]"></div>
            </div>
            <div className="relative bg-[#FAF9F6] px-10">
              <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
                {sectionTitle}
              </h2>
            </div>
          </div>
          {sectionSubtitle && (
            <p className="text-center text-[14px] text-[#757575] -mt-8 mb-12">{sectionSubtitle}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-square rounded-[12px] bg-[#E8E4DE] animate-pulse" />
                <div className="mt-3 h-4 w-24 bg-[#E8E4DE] rounded animate-pulse" />
                <div className="mt-2 h-3 w-32 bg-[#E8E4DE] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-[#FDFCF8]">
        <div className="container px-4 md:px-8">
          <div className="relative mb-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E8E4DE]"></div>
            </div>
            <div className="relative bg-[#FDFCF8] px-10">
              <h2
                className="text-[32px] md:text-[36px] font-sans font-medium tracking-normal"
                style={{ color: themeSettings.sectionTitleColor }}
              >
                {sectionTitle}
              </h2>
            </div>
          </div>
          {sectionSubtitle && (
            <p className="text-center text-[14px] text-[#757575] -mt-8 mb-12">{sectionSubtitle}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[#FDFCF8]">
      <div className="container px-4 md:px-8">
        <div className="relative mb-12 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E8E4DE]"></div>
          </div>
          <div className="relative bg-[#FDFCF8] px-10">
            <h2 
              className="text-[32px] md:text-[36px] font-sans font-medium tracking-normal"
              style={{ color: themeSettings.sectionTitleColor }}
            >
              {sectionTitle}
            </h2>
          </div>
        </div>
        {sectionSubtitle && (
          <p 
            className="text-center text-[14px] -mt-8 mb-12"
            style={{ color: themeSettings.heroSubtitleColor }}
          >
            {sectionSubtitle}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
          {collections.map((collection) => (
            <CollectionItem
              key={collection.id}
              title={collection.title}
              subtitle={collection.subtitle}
              image={collection.imageUrl}
              href={`/collections/${collection.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;
