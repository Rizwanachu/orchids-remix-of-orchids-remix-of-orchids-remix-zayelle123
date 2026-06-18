import React from 'react';

const LimitedEditionBanner = () => {
  return (
    <section className="bg-[#2D1F17] py-10 md:py-12">
      <div className="container px-5 sm:px-8 text-center">
        <p className="text-[11px] uppercase tracking-[4px] text-[#C4A882] mb-3 font-medium">Exclusive Drops</p>
        <h2 className="text-[24px] md:text-[30px] font-serif italic text-white mb-4">
          Limited Edition Collection
        </h2>
        <p className="text-[14px] md:text-[15px] text-[#C4B5A5] max-w-[500px] mx-auto leading-relaxed mb-7">
          We source premium styles in small batches. Once sold out, some colors may not return.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/products"
            className="inline-flex items-center justify-center bg-[#C4A882] text-[#2D1F17] px-8 py-3.5 font-semibold text-[12px] uppercase tracking-widest hover:bg-[#B8976D] transition-colors"
          >
            Shop Before They're Gone
          </a>
          <a
            href="https://wa.me/918891485648?text=Hi%20Zayelle!%20I%27d%20like%20to%20know%20about%20limited%20edition%20restocks."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[#C4A882]/50 text-[#C4A882] px-8 py-3.5 font-medium text-[12px] uppercase tracking-widest hover:border-[#C4A882] transition-colors"
          >
            Get Restock Alerts
          </a>
        </div>
      </div>
    </section>
  );
};

export default LimitedEditionBanner;
