"use client";

import React, { useEffect, useState } from 'react';
import { Truck, ShieldCheck, RefreshCcw, Heart } from 'lucide-react';

const ICONS = [
  <ShieldCheck key="shield" size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
  <Truck key="truck" size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
  <RefreshCcw key="refresh" size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
  <Heart key="heart" size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
];

const DEFAULTS = [
  { title: "Secure Payments", desc: "UPI, Cards, Net Banking & Cash on Delivery" },
  { title: "Pan India Shipping", desc: "Estimated delivery 3–7 business days" },
  { title: "Easy Returns", desc: "Hassle-free exchange & return policy" },
  { title: "Made With Love", desc: "Small business supporting Indian women" },
];

const TrustBar = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/homepage-settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const items = DEFAULTS.map((def, i) => ({
    icon: ICONS[i],
    title: settings[`trustBar${i + 1}Title`] || def.title,
    description: settings[`trustBar${i + 1}Desc`] || def.desc,
  }));

  return (
    <section className="bg-[#FAF9F6] border-t border-[#E8E4DE] py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3 px-4"
            >
              <div className="transition-all hover:scale-110">
                {item.icon}
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] uppercase tracking-wider font-sans">
                  {item.title}
                </h3>
                <p className="text-[12px] sm:text-[13px] text-[#757575] font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
