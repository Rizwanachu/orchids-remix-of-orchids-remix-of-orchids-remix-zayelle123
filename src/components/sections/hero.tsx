import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAF9F6]">
      <div className="container mx-auto px-5 sm:px-8">
        <div className="relative flex flex-col lg:flex-row items-center justify-between py-12 lg:py-0">
          
          {/* Text Content */}
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start text-left mb-8 lg:mb-0 lg:pt-20">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="font-sans text-[48px] md:text-[64px] leading-[1.1] font-semibold text-[#1A1A1A] mb-4 tracking-tight uppercase">
                Styled in
                <br />
                <span className="relative inline-block mt-2">
                  <span className="bg-[#5C4B3D]/10 px-4 py-1 text-[#5C4B3D]">
                    Modesty
                  </span>
                </span>
              </h1>

              <p className="font-sans text-[20px] md:text-[22px] text-[#5C4B3D] font-medium max-w-[480px] mb-3">
                Premium Hijabs &amp; Elegant Accessories
              </p>
              
              <p className="font-sans text-[16px] md:text-[18px] text-[#757575] max-w-[480px] mb-8 leading-relaxed">
                Gracefully designed for modern women across India.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="/collections/new-arrivals" 
                  className="inline-flex items-center justify-center bg-[#5C4B3D] text-[#FAF9F6] px-10 py-4 rounded-[12px] font-medium text-[14px] transition-premium hover:bg-[#4A3C31] uppercase tracking-wider"
                >
                  Shop New Arrivals
                </a>
              </div>
            </div>
          </div>

          {/* Imagery */}
          <div className="relative w-full lg:w-3/5 h-[500px] md:h-[600px] lg:h-[800px] flex justify-end">
            <div className="relative w-full h-full lg:translate-x-12 xl:translate-x-24">
              <div className="relative w-full h-full overflow-hidden rounded-bl-[100px] md:rounded-bl-[200px] shadow-soft">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/A-woman-wearing-a-premium-satin-or-chiffon-hijab-1771238935183.jpeg?width=8000&height=8000&resize=contain"
                  alt="Zayelle Premium Hijab Collection"
                  fill
                  priority
                  className="object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6]/40 via-transparent to-transparent hidden lg:block" />
              </div>

              <div className="absolute bottom-10 right-10 lg:right-20 bg-white/90 backdrop-blur-md p-6 rounded-[12px] shadow-lg max-w-[200px] hidden md:block animate-in fade-in zoom-in duration-1000 delay-300">
                <p className="font-serif-italic text-[18px] text-[#5C4B3D] mb-1">Ultra-soft Fabrics</p>
                <div className="w-12 h-[1px] bg-[#5C4B3D] mb-2" />
                <p className="font-sans text-[12px] text-[#757575] leading-snug">Experience unparalleled comfort and drape.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#5C4B3D" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
