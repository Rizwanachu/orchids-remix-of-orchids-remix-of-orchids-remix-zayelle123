"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface BundleItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  label: string;
}

interface DbBundle {
  id: number;
  name: string;
  description: string;
  bundleType: string;
  items: string;
  price: string;
  comparePrice: string | null;
  badge: string | null;
  imageUrl: string;
  isActive: number;
  displayOrder: number;
}

interface FallbackProduct {
  id: number;
  name: string;
  image: string;
}

const FALLBACK_BUNDLES = [
  { name: "Starter Bundle", items: ["1 Hijab", "1 Undercap"], price: "₹349", badge: null, link: "/products", imageIndexes: [0, 1] },
  { name: "Styling Bundle", items: ["1 Hijab", "1 Magnetic Pin"], price: "₹399", badge: "Popular", link: "/products", imageIndexes: [2, 3] },
  { name: "Complete Essentials", items: ["1 Hijab", "1 Undercap", "1 Magnetic Pin"], price: "₹499", badge: "Best Value", link: "/products", imageIndexes: [4, 5] },
  { name: "Gift Bundle", items: ["1 Hijab", "1 Scrunchie", "1 Tasbeeh"], price: "₹449", badge: null, link: "/gift-hampers", imageIndexes: [6, 7] },
];

const BundlesSection = () => {
  const [dbBundles, setDbBundles] = useState<DbBundle[] | null>(null);
  const [fallbackProducts, setFallbackProducts] = useState<FallbackProduct[]>([]);

  useEffect(() => {
    fetch("/api/bundles")
      .then((r) => r.json())
      .then((data) => {
        if (data.bundles && data.bundles.length > 0) {
          setDbBundles(data.bundles);
        } else {
          setDbBundles([]);
          fetch("/api/products")
            .then((r) => r.json())
            .then((d) => {
              const list: FallbackProduct[] = Array.isArray(d) ? d : d.products || [];
              setFallbackProducts(list.filter((p) => p.image));
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setDbBundles([]);
        fetch("/api/products")
          .then((r) => r.json())
          .then((d) => {
            const list: FallbackProduct[] = Array.isArray(d) ? d : d.products || [];
            setFallbackProducts(list.filter((p) => p.image));
          })
          .catch(() => {});
      });
  }, []);

  const useDb = dbBundles && dbBundles.length > 0;

  return (
    <section className="py-[64px] md:py-[80px] bg-[#FDFCF8]">
      <div className="container px-5 sm:px-8">
        <header className="flex flex-col items-center mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[3px] text-[#8B735B] mb-3 font-medium">Save More Together</p>
          <h2 className="text-[28px] md:text-[34px] font-serif italic text-[#1A1A1A] mb-2">Most Loved Bundles</h2>
          <div className="w-[50px] h-[1px] bg-[#5C4B3D] opacity-25 mt-3" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {useDb
            ? dbBundles!.map((bundle) => {
                const parsedItems: BundleItem[] = (() => { try { return JSON.parse(bundle.items); } catch { return []; } })();
                const imgA = parsedItems[0];
                const imgB = parsedItems[1];
                const savings = bundle.comparePrice
                  ? Math.round(parseFloat(bundle.comparePrice) - parseFloat(bundle.price))
                  : null;

                return (
                  <div
                    key={bundle.id}
                    className="relative bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group"
                  >
                    {bundle.badge && (
                      <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-[#5C4B3D] text-white px-2.5 py-1 rounded-full">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="relative w-full h-[160px] bg-[#F5F2ED] flex overflow-hidden">
                      {bundle.imageUrl ? (
                        <div className="relative flex-1 overflow-hidden">
                          <Image
                            src={bundle.imageUrl}
                            alt={bundle.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width:640px) 100vw, 300px"
                          />
                        </div>
                      ) : imgA?.productImage ? (
                        <>
                          <div className="relative flex-1 overflow-hidden border-r border-white/60">
                            <Image
                              src={imgA.productImage}
                              alt={imgA.productName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width:640px) 50vw, 150px"
                            />
                          </div>
                          {imgB?.productImage && imgB.productId !== imgA.productId && (
                            <div className="relative flex-1 overflow-hidden">
                              <Image
                                src={imgB.productImage}
                                alt={imgB.productName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width:640px) 50vw, 150px"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[#8B735B] text-[28px]">✦</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">{bundle.name}</h3>

                      <ul className="space-y-1.5 mb-5 flex-1">
                        {parsedItems.length > 0
                          ? parsedItems.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 text-[13px] text-[#555]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8B735B] flex-shrink-0" />
                                {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.label || item.productName}
                              </li>
                            ))
                          : bundle.description
                            ? bundle.description.split(",").map((s, j) => (
                                <li key={j} className="flex items-center gap-2 text-[13px] text-[#555]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B735B] flex-shrink-0" />
                                  {s.trim()}
                                </li>
                              ))
                            : null}
                      </ul>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#F5F2ED]">
                        <div>
                          <span className="text-[22px] font-semibold text-[#1A1A1A]">₹{bundle.price}</span>
                          {savings && savings > 0 && (
                            <span className="ml-2 text-[11px] text-green-600 font-medium">Save ₹{savings}</span>
                          )}
                        </div>
                        <a
                          href="/products"
                          className="text-[12px] font-medium uppercase tracking-wider text-[#5C4B3D] border border-[#5C4B3D] px-4 py-2 hover:bg-[#5C4B3D] hover:text-white transition-colors duration-200"
                        >
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            : FALLBACK_BUNDLES.map((bundle, i) => {
                const [idxA, idxB] = bundle.imageIndexes;
                const imgA = fallbackProducts[idxA % (fallbackProducts.length || 1)];
                const imgB = fallbackProducts[idxB % (fallbackProducts.length || 1)];

                return (
                  <div
                    key={i}
                    className="relative bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group"
                  >
                    {bundle.badge && (
                      <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-[#5C4B3D] text-white px-2.5 py-1 rounded-full">
                        {bundle.badge}
                      </span>
                    )}
                    <div className="relative w-full h-[160px] bg-[#F5F2ED] flex overflow-hidden">
                      {imgA ? (
                        <>
                          <div className="relative flex-1 overflow-hidden border-r border-white/60">
                            <Image src={imgA.image} alt={imgA.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 200px" />
                          </div>
                          {imgB && imgB.id !== imgA.id ? (
                            <div className="relative flex-1 overflow-hidden">
                              <Image src={imgB.image} alt={imgB.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 200px" />
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[#8B735B] text-[28px]">✦</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">{bundle.name}</h3>
                      <ul className="space-y-1.5 mb-5 flex-1">
                        {bundle.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-[13px] text-[#555]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B735B] flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#F5F2ED]">
                        <span className="text-[22px] font-semibold text-[#1A1A1A]">{bundle.price}</span>
                        <a href={bundle.link} className="text-[12px] font-medium uppercase tracking-wider text-[#5C4B3D] border border-[#5C4B3D] px-4 py-2 hover:bg-[#5C4B3D] hover:text-white transition-colors duration-200">
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <p className="text-center text-[13px] text-[#757575] mt-8">
          Mix &amp; match your favorites — message us on WhatsApp to build a custom bundle.
        </p>
      </div>
    </section>
  );
};

export default BundlesSection;
