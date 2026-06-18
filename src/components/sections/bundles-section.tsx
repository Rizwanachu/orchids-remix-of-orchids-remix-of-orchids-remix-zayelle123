"use client";

import React from 'react';
import { Package } from 'lucide-react';

const BUNDLES = [
  {
    name: "Starter Bundle",
    items: ["1 Hijab", "1 Undercap"],
    price: "₹349",
    badge: null,
    link: "/products",
  },
  {
    name: "Styling Bundle",
    items: ["1 Hijab", "1 Magnetic Pin"],
    price: "₹399",
    badge: "Popular",
    link: "/products",
  },
  {
    name: "Complete Essentials",
    items: ["1 Hijab", "1 Undercap", "1 Magnetic Pin"],
    price: "₹499",
    badge: "Best Value",
    link: "/products",
  },
  {
    name: "Gift Bundle",
    items: ["1 Hijab", "1 Scrunchie", "1 Tasbeeh"],
    price: "₹449",
    badge: null,
    link: "/gift-hampers",
  },
];

const BundlesSection = () => {
  return (
    <section className="py-[64px] md:py-[80px] bg-[#FDFCF8]">
      <div className="container px-5 sm:px-8">
        <header className="flex flex-col items-center mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[3px] text-[#8B735B] mb-3 font-medium">Save More Together</p>
          <h2 className="text-[28px] md:text-[34px] font-serif italic text-[#1A1A1A] mb-2">
            Most Loved Bundles
          </h2>
          <div className="w-[50px] h-[1px] bg-[#5C4B3D] opacity-25 mt-3" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BUNDLES.map((bundle, i) => (
            <div
              key={i}
              className="relative bg-white border border-[#E8E4DE] rounded-[12px] p-6 flex flex-col hover:shadow-md transition-shadow duration-300 group"
            >
              {bundle.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider bg-[#5C4B3D] text-white px-2.5 py-1 rounded-full">
                  {bundle.badge}
                </span>
              )}

              <div className="w-10 h-10 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4">
                <Package size={18} className="text-[#5C4B3D]" strokeWidth={1.5} />
              </div>

              <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-3">{bundle.name}</h3>

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
                <a
                  href={bundle.link}
                  className="text-[12px] font-medium uppercase tracking-wider text-[#5C4B3D] border border-[#5C4B3D] px-4 py-2 hover:bg-[#5C4B3D] hover:text-white transition-colors duration-200"
                >
                  Shop Now
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] text-[#757575] mt-8">
          Mix &amp; match your favorites — message us on WhatsApp to build a custom bundle.
        </p>
      </div>
    </section>
  );
};

export default BundlesSection;
