"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GridItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  redirectLink: string;
  displayOrder: number;
}

const CuratedGrid = () => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [gridRes, settingsRes] = await Promise.all([
          fetch('/api/zayelle-edit'),
          fetch('/api/homepage-settings').catch(() => null),
        ]);
        if (gridRes.ok) {
          const data = await gridRes.json();
          setGridItems(data);
        }
        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.zayelleEditTitle) setSectionTitle(settings.zayelleEditTitle);
          if (settings.zayelleEditSubtitle) setSectionSubtitle(settings.zayelleEditSubtitle);
        }
      } catch (err) {
        console.error('Error fetching curated grid items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-[100px] bg-[#FAF9F6]">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[12px] min-h-[400px] md:min-h-[500px] bg-[#E8E4DE] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (gridItems.length === 0) {
    if (!sectionTitle) return null;
    return (
      <section className="py-20 md:py-[100px] bg-[#FDFCF8]">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="relative mb-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E8E4DE]"></div>
            </div>
            <div className="relative bg-[#FDFCF8] px-10">
              <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
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
    <section className="py-20 md:py-[100px] bg-[#FDFCF8]">
      <div className="container mx-auto px-5 lg:px-8">
        {sectionTitle && (
          <>
            <div className="relative mb-12 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-[#E8E4DE]"></div>
              </div>
              <div className="relative bg-[#FDFCF8] px-10">
                <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
                  {sectionTitle}
                </h2>
              </div>
            </div>
            {sectionSubtitle && (
              <p className="text-center text-[14px] text-[#757575] -mt-8 mb-12">{sectionSubtitle}</p>
            )}
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {gridItems.map((item) => (
            <div key={item.id} className="relative group overflow-hidden rounded-[12px] min-h-[400px] md:min-h-[500px]">
              <a href={item.redirectLink} className="relative block w-full h-full">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </a>
              
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-7">
                <div className="bg-[#E8D9C5]/50 backdrop-blur-sm px-5 py-3 mb-4 inline-block">
                  <h3 className="font-serif text-[26px] md:text-[30px] text-[#1A1A1A] leading-tight">
                    {item.title}
                  </h3>
                </div>
                <div>
                  <a 
                    href={item.redirectLink} 
                    className="inline-block bg-[#5C4B3D] text-white text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors hover:bg-[#4A3D32]"
                  >
                    {item.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedGrid;
