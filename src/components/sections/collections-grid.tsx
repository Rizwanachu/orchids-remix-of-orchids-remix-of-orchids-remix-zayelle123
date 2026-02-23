"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CollectionItemProps {
  image: string;
  title: string;
  subtitle: string;
  href: string;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ image, title, subtitle, href }) => {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-[#FFFFFF]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>
      <a 
        href={href}
        className="mt-[10px] text-[15px] font-medium text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors inline-block relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#5C4B3D] hover:after:w-full after:transition-all uppercase tracking-tight"
      >
        {title}
      </a>
      <p className="text-[12px] text-[#757575] mt-1 text-center">{subtitle}</p>
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
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok) {
          const data = await res.json();
          setCollections(data.collections);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
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
                Collections
              </h2>
            </div>
          </div>
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

  if (collections.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6]">
      <div className="container px-4 md:px-8">
        <div className="relative mb-12 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E8E4DE]"></div>
          </div>
          <div className="relative bg-[#FAF9F6] px-10">
            <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
              Collections
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-10">
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
