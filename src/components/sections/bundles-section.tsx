"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface BundleItem {
  productId: number;
  productName: string;
  productImage: string;
  productHandle?: string;
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

const BundleCard = ({ bundle, fallbackProducts }: {
  bundle: DbBundle;
  fallbackProducts: FallbackProduct[];
}) => {
  const parsedItems: BundleItem[] = (() => { try { return JSON.parse(bundle.items); } catch { return []; } })();
  const imgA = parsedItems[0];
  const imgB = parsedItems[1];
  const savings = bundle.comparePrice
    ? Math.round(parseFloat(bundle.comparePrice) - parseFloat(bundle.price))
    : null;

  const itemSummary = parsedItems.length > 0
    ? parsedItems.map(i => `${i.quantity > 1 ? `${i.quantity}× ` : ""}${i.label || i.productName}`).join(" + ")
    : bundle.description || "";

  const primaryImage = bundle.imageUrl || imgA?.productImage || fallbackProducts[0]?.image || "";
  const secondaryImage = !bundle.imageUrl && imgB?.productImage && imgB.productId !== imgA?.productId
    ? imgB.productImage
    : "";

  // Link to the first product's page if handle available, otherwise products listing
  const bundleLink = parsedItems[0]?.productHandle
    ? `/products/${parsedItems[0].productHandle}`
    : "/products";

  return (
    <div className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-[#F5F2ED] transition-premium">
        {/* Images */}
        {primaryImage ? (
          secondaryImage ? (
            <div className="absolute inset-0 flex">
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src={primaryImage}
                  alt={bundle.name}
                  fill
                  className="object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 12vw"
                />
              </div>
              <div className="relative flex-1 overflow-hidden border-l border-white/40">
                <Image
                  src={secondaryImage}
                  alt={bundle.name}
                  fill
                  className="object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 12vw"
                />
              </div>
            </div>
          ) : (
            <Image
              src={primaryImage}
              alt={bundle.name}
              fill
              className="object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#8B735B] text-[40px]">✦</span>
          </div>
        )}

        {/* Badge */}
        {bundle.badge && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-[#5C4B3D] text-white px-2.5 py-1 rounded-full">
            {bundle.badge}
          </span>
        )}

        {/* Savings badge */}
        {savings && savings > 0 && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold bg-green-600 text-white px-2 py-1 rounded-full">
            Save ₹{savings}
          </span>
        )}

        {/* Quick view icon — top right (when no savings badge) */}
        {!(savings && savings > 0) && (
          <div className="absolute top-3 right-3 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <a
              href={bundleLink}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-[#5C4B3D] hover:text-white transition-colors"
            >
              <Search size={16} />
            </a>
          </div>
        )}

        {/* Slide-up Shop Now button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <a
            href={bundleLink}
            className="pointer-events-auto w-full flex items-center justify-center bg-[#1A1A1A] text-white text-[12px] font-medium uppercase tracking-wider py-3 rounded-sm
              sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100
              transition-all duration-300"
          >
            Shop Bundle
          </a>
        </div>
      </div>

      {/* Text below */}
      <div className="mt-4 flex flex-col gap-1 w-full px-2">
        <h3 className="text-[14px] font-normal text-[#1A1A1A] capitalize tracking-tight line-clamp-1">
          <a href={bundleLink} className="hover:text-[#5C4B3D] transition-colors">
            {bundle.name}
          </a>
        </h3>
        {itemSummary && (
          <p className="text-[12px] text-[#757575] line-clamp-1">{itemSummary}</p>
        )}
        <div className="flex flex-col gap-0.5 mt-1">
          <span className="text-[16px] font-semibold text-[#1A1A1A]">
            ₹{parseFloat(bundle.price).toLocaleString("en-IN")}.00
          </span>
          {bundle.comparePrice && parseFloat(bundle.comparePrice) > parseFloat(bundle.price) && (
            <span className="text-[13px] text-[#757575] line-through">
              ₹{parseFloat(bundle.comparePrice).toLocaleString("en-IN")}.00
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const FallbackBundleCard = ({ bundle, imgA, imgB }: {
  bundle: typeof FALLBACK_BUNDLES[number];
  imgA?: FallbackProduct;
  imgB?: FallbackProduct;
}) => (
  <div className="group flex flex-col items-center text-center">
    <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-[#F5F2ED]">
      {imgA ? (
        imgB && imgB.id !== imgA.id ? (
          <div className="absolute inset-0 flex">
            <div className="relative flex-1 overflow-hidden">
              <Image src={imgA.image} alt={imgA.name} fill className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 200px" />
            </div>
            <div className="relative flex-1 overflow-hidden border-l border-white/40">
              <Image src={imgB.image} alt={imgB.name} fill className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 200px" />
            </div>
          </div>
        ) : (
          <Image src={imgA.image} alt={imgA.name} fill className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, 25vw" />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#8B735B] text-[40px]">✦</span>
        </div>
      )}

      {bundle.badge && (
        <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-[#5C4B3D] text-white px-2.5 py-1 rounded-full">
          {bundle.badge}
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <a
          href={bundle.link}
          className="pointer-events-auto w-full flex items-center justify-center bg-[#1A1A1A] text-white text-[12px] font-medium uppercase tracking-wider py-3 rounded-sm
            sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100
            transition-all duration-300"
        >
          Shop Bundle
        </a>
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-1 w-full px-2">
      <h3 className="text-[14px] font-normal text-[#1A1A1A] capitalize tracking-tight line-clamp-1">
        <a href={bundle.link} className="hover:text-[#5C4B3D] transition-colors">{bundle.name}</a>
      </h3>
      <p className="text-[12px] text-[#757575] line-clamp-1">{bundle.items.join(" + ")}</p>
      <div className="mt-1">
        <span className="text-[16px] font-semibold text-[#1A1A1A]">{bundle.price}</span>
      </div>
    </div>
  </div>
);

const BundlesSection = () => {
  const [dbBundles, setDbBundles] = useState<DbBundle[] | null>(null);
  const [fallbackProducts, setFallbackProducts] = useState<FallbackProduct[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/homepage-settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});

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
          <p className="text-[11px] uppercase tracking-[3px] text-[#8B735B] mb-3 font-medium">
            {settings.bundlesEyebrow || "Save More Together"}
          </p>
          <h2 className="text-[28px] md:text-[34px] font-serif italic text-[#1A1A1A] mb-2">
            {settings.bundlesTitle || "Most Loved Bundles"}
          </h2>
          {settings.bundlesSubtitle && (
            <p className="text-[14px] text-[#757575] mt-1 max-w-[400px]">{settings.bundlesSubtitle}</p>
          )}
          <div className="w-[50px] h-[1px] bg-[#5C4B3D] opacity-25 mt-3" />
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {useDb
            ? dbBundles!.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} fallbackProducts={fallbackProducts} />
              ))
            : FALLBACK_BUNDLES.map((bundle, i) => {
                const [idxA, idxB] = bundle.imageIndexes;
                const n = fallbackProducts.length || 1;
                return (
                  <FallbackBundleCard
                    key={i}
                    bundle={bundle}
                    imgA={fallbackProducts[idxA % n]}
                    imgB={fallbackProducts[idxB % n]}
                  />
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
