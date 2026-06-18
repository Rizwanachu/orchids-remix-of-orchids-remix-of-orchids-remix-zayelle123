"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme-context';
import { ShieldCheck, Truck, Heart } from 'lucide-react';

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

const WHATSAPP_URL = "https://wa.me/918891485648?text=Hi%20Zayelle!%20I%20need%20help%20choosing.";

const HeroSection = () => {
  const { settings: themeSettings } = useTheme();
  const [heroBanner, setHeroBanner] = useState<BannerData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoaded(true), 2000);
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

  const title = heroBanner?.title || settings.heroTitle || "Grace.\nElegance.\nConfidence.";
  const subtitle = heroBanner?.subtitle || settings.heroSubtitle || "Premium Hijabs, Women's Fashion, Accessories & Curated Gift Hampers Delivered Across India.";
  const buttonText = settings.heroButtonText || heroBanner?.buttonText || "SHOP BEST SELLERS";
  const buttonLink = settings.heroButtonLink || heroBanner?.buttonLink || "/products";
  const imageUrl = settings.heroImage || heroBanner?.imageUrl || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/A-woman-wearing-a-premium-satin-or-chiffon-hijab-1771238935183.jpeg?width=8000&height=8000&resize=contain";

  const trustBadges = [
    { icon: <ShieldCheck size={14} strokeWidth={2} />, label: "Secure Payments" },
    { icon: <Truck size={14} strokeWidth={2} />, label: "Pan India Shipping" },
    { icon: <Heart size={14} strokeWidth={2} />, label: "Small Business" },
  ];

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
        <div className="relative flex flex-col lg:flex-row items-center justify-between py-8 sm:py-12 lg:py-16">
          
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start text-left mb-6 lg:mb-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 
                className="font-sans text-[40px] sm:text-[52px] md:text-[64px] leading-[1.02] font-semibold mb-5 tracking-tight"
                style={{ color: themeSettings.heroTitleColor }}
              >
                {titleParts.map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < titleParts.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              <p 
                className="font-sans text-[15px] sm:text-[17px] md:text-[18px] max-w-[440px] mb-8 leading-relaxed text-[#555]"
              >
                {subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a 
                  href={buttonLink}
                  className="inline-flex items-center justify-center bg-[#524436] text-[#FDFCF8] px-8 sm:px-10 py-3.5 sm:py-4 font-medium text-[12px] sm:text-[13px] transition-all hover:opacity-90 uppercase tracking-widest"
                >
                  {buttonText}
                </a>
                <a 
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#524436] text-[#524436] px-8 sm:px-10 py-3.5 sm:py-4 font-medium text-[12px] sm:text-[13px] transition-all hover:bg-[#524436] hover:text-white uppercase tracking-widest"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[#555]">
                    <span className="text-[#5C4B3D]">{badge.icon}</span>
                    <span className="text-[12px] font-medium tracking-wide">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[420px] md:h-[550px] lg:h-[680px] flex justify-end">
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
