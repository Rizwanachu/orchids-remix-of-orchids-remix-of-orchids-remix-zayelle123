"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme-context';

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  position: string;
  isActive: boolean;
}

const HeroSection = () => {
  const { settings: themeSettings } = useTheme();
  const [heroBanner, setHeroBanner] = useState<BannerData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoaded(true), 6000);
    Promise.all([
      fetch('/api/banners')
        .then(res => res.json())
        .then(data => {
          const hero = (data as BannerData[]).find(b => b.position === 'hero');
          if (hero) setHeroBanner(hero);
        })
        .catch(console.error),
      fetch('/api/homepage-settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(console.error),
    ]).finally(() => { clearTimeout(timeoutId); setLoaded(true); });
  }, []);

  const title = heroBanner?.title || settings.heroTitle || "GRACE IN\nEVERY LAYER";
  const subtitle = heroBanner?.subtitle || settings.heroSubtitle || "Timeless Hijabs & Refined Accessories for Everyday Elegance";
  const description = "Gracefully designed for modern women across India.";
  const buttonText = settings.heroButtonText || heroBanner?.buttonText || "SHOP NEW ARRIVALS";
  const buttonLink = settings.heroButtonLink || heroBanner?.buttonLink || "/collections/new-arrivals";
  const imageUrl = settings.heroImage || heroBanner?.imageUrl || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/A-woman-wearing-a-premium-satin-or-chiffon-hijab-1771238935183.jpeg?width=8000&height=8000&resize=contain";

  if (!loaded) {
    return (
      <section className="relative w-full overflow-hidden bg-[#FDFCF8]">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="relative flex flex-col lg:flex-row items-center justify-between py-12 lg:py-0">
            <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start text-left mb-8 lg:mb-0 lg:pt-20">
              <div className="h-[64px] md:h-[80px] w-[300px] bg-[#F5F2ED] rounded-lg animate-pulse mb-4" />
              <div className="h-[64px] md:h-[80px] w-[260px] bg-[#F5F2ED]/60 rounded-lg animate-pulse mb-6" />
              <div className="h-[22px] w-[380px] max-w-full bg-[#F5F2ED]/50 rounded animate-pulse mb-3" />
              <div className="h-[18px] w-[340px] max-w-full bg-[#F5F2ED]/40 rounded animate-pulse mb-8" />
              <div className="h-[52px] w-[200px] bg-[#F5F2ED] rounded-[12px] animate-pulse" />
            </div>
            <div className="relative w-full lg:w-3/5 h-[500px] md:h-[600px] lg:h-[800px] flex justify-end">
              <div className="relative w-full h-full lg:translate-x-12 xl:translate-x-24">
                <div className="w-full h-full bg-[#F5F2ED] rounded-bl-[100px] md:rounded-bl-[200px] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const titleParts = title.split('\n');

  return (
    <section className="relative w-full overflow-hidden bg-[#FDFCF8]">
      <div className="container mx-auto px-5 sm:px-8">
        <div className="relative flex flex-col lg:flex-row items-center justify-between py-8 sm:py-12 lg:py-20">
          
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start text-left mb-6 lg:mb-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 
                className="font-sans text-[36px] sm:text-[48px] md:text-[60px] leading-[1.05] font-semibold mb-4 sm:mb-6 tracking-tight uppercase"
                style={{ color: themeSettings.heroTitleColor }}
              >
                {titleParts[0]}
                {titleParts[1] && (
                  <>
                    <br />
                    <span>{titleParts[1]}</span>
                  </>
                )}
              </h1>

              <p 
                className="font-sans text-[15px] sm:text-[18px] md:text-[20px] font-medium max-w-[480px] mb-3"
                style={{ color: themeSettings.primaryColor }}
              >
                {subtitle}
              </p>
              
              <p 
                className="font-sans text-[14px] sm:text-[15px] md:text-[16px] max-w-[480px] mb-8 sm:mb-10 leading-relaxed text-[#757575]"
              >
                {description}
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href={buttonLink}
                  className="inline-flex items-center justify-center bg-[#524436] text-[#FDFCF8] px-8 sm:px-10 py-3.5 sm:py-4 font-medium text-[12px] sm:text-[13px] transition-premium hover:opacity-90 uppercase tracking-widest"
                >
                  {buttonText}
                </a>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[420px] md:h-[550px] lg:h-[700px] flex justify-end">
            <div className="relative w-full h-full">
              <div className="relative w-full h-full overflow-hidden rounded-[40px] md:rounded-[80px] shadow-soft">
                <Image
                  src={imageUrl}
                  alt="Zayelle Premium Hijab Collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>

              <div className="absolute bottom-10 left-10 lg:left-[-40px] bg-white/95 backdrop-blur-md p-6 rounded-[12px] shadow-xl max-w-[240px] hidden md:block animate-in fade-in zoom-in duration-1000 delay-300 border border-[#F5F2ED]">
                <p className="font-serif-italic text-[20px] text-[#524436] mb-1">Ultra-soft Fabrics</p>
                <div className="w-12 h-[1px] bg-[#524436] mb-3" />
                <p className="font-sans text-[13px] text-[#757575] leading-relaxed">Experience unparalleled comfort and drape with our curated collections.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;