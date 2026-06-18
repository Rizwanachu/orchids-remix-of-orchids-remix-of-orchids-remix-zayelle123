"use client";

import React, { useEffect, useState } from 'react';

const WHATSAPP_RESTOCK = "https://wa.me/918891485648?text=Hi%20Zayelle!%20I%27d%20like%20to%20know%20about%20limited%20edition%20restocks.";

const LimitedEditionBanner = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/homepage-settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const eyebrow = settings.limitedEditionEyebrow || "Exclusive Drops";
  const title = settings.limitedEditionTitle || "Limited Edition Collection";
  const body = settings.limitedEditionBody || "We source premium styles in small batches. Once sold out, some colors may not return.";
  const btn1Text = settings.limitedEditionButton1Text || "Shop Before They're Gone";
  const btn1Link = settings.limitedEditionButton1Link || "/products";
  const btn2Text = settings.limitedEditionButton2Text || "Get Restock Alerts";

  return (
    <section className="bg-[#2D1F17] py-10 md:py-12">
      <div className="container px-5 sm:px-8 text-center">
        <p className="text-[11px] uppercase tracking-[4px] text-[#C4A882] mb-3 font-medium">{eyebrow}</p>
        <h2 className="text-[24px] md:text-[30px] font-serif italic text-white mb-4">
          {title}
        </h2>
        <p className="text-[14px] md:text-[15px] text-[#C4B5A5] max-w-[500px] mx-auto leading-relaxed mb-7">
          {body}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={btn1Link}
            className="inline-flex items-center justify-center bg-[#C4A882] text-[#2D1F17] px-8 py-3.5 font-semibold text-[12px] uppercase tracking-widest hover:bg-[#B8976D] transition-colors"
          >
            {btn1Text}
          </a>
          <a
            href={WHATSAPP_RESTOCK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[#C4A882]/50 text-[#C4A882] px-8 py-3.5 font-medium text-[12px] uppercase tracking-widest hover:border-[#C4A882] transition-colors"
          >
            {btn2Text}
          </a>
        </div>
      </div>
    </section>
  );
};

export default LimitedEditionBanner;
