"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface GiftHamper {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  price: string;
  comparePrice: string | null;
  includedProductIds: number[] | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const GiftHampers: React.FC = () => {
  const [hampers, setHampers] = useState<GiftHamper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHampers() {
      try {
        const res = await fetch("/api/gift-hampers");
        if (res.ok) {
          const data = await res.json();
          setHampers(data.hampers || []);
        }
      } catch (err) {
        console.error("Error fetching gift hampers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHampers();
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
                Gift Hampers
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-[12px] overflow-hidden bg-white">
                <div className="w-full aspect-square bg-[#E8E4DE] animate-pulse" />
                <div className="p-5">
                  <div className="h-5 w-32 bg-[#E8E4DE] rounded animate-pulse mb-3" />
                  <div className="h-3 w-full bg-[#E8E4DE] rounded animate-pulse mb-2" />
                  <div className="h-3 w-3/4 bg-[#E8E4DE] rounded animate-pulse mb-4" />
                  <div className="h-4 w-20 bg-[#E8E4DE] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hampers.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-[#FAF9F6]">
        <div className="container px-4 md:px-8">
          <div className="relative mb-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E8E4DE]"></div>
            </div>
            <div className="relative bg-[#FAF9F6] px-10">
              <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
                Gift Hampers
              </h2>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6]">
      <div className="container px-4 md:px-8">
        <div className="relative mb-12 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E8E4DE]"></div>
          </div>
          <div className="relative bg-[#FAF9F6] px-10">
            <h2 className="text-[32px] md:text-[36px] font-sans font-medium text-[#1A1A1A] tracking-normal">
              Gift Hampers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
          {hampers.map((hamper) => {
            const price = parseFloat(hamper.price);
            const comparePrice = hamper.comparePrice ? parseFloat(hamper.comparePrice) : null;
            const showCompare = comparePrice !== null && comparePrice > price;

            return (
              <div
                key={hamper.id}
                className="flex flex-col rounded-[12px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <a href="/gift-hampers" className="relative w-full aspect-square overflow-hidden bg-[#F5F2ED]">
                  {hamper.imageUrl ? (
                    <Image
                      src={hamper.imageUrl}
                      alt={hamper.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C8BE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="8" width="18" height="14" rx="2" />
                        <path d="M12 8V5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v0" />
                        <path d="M16 8V5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v0" />
                        <path d="M12 8v14" />
                        <path d="M3 12h18" />
                      </svg>
                    </div>
                  )}
                </a>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-[18px] font-medium text-[#1A1A1A] mb-2">
                    {hamper.title}
                  </h3>
                  {hamper.description && (
                    <p className="text-[13px] text-[#757575] mb-4 line-clamp-2">
                      {hamper.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-2 mb-4">
                    <span className="text-[16px] font-semibold text-[#1A1A1A]">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    {showCompare && (
                      <span className="text-[14px] text-[#999] line-through">
                        ₹{comparePrice!.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <a
                    href="/gift-hampers"
                    className="inline-block text-center py-2.5 px-6 rounded-[8px] bg-[#5C4B3D] text-white text-[14px] font-medium hover:bg-[#4A3C31] transition-colors"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GiftHampers;
