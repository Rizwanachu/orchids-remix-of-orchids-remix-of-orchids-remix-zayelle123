"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  position: string;
  isActive: boolean;
  titleFont?: string;
  titleColor?: string;
  subtitleColor?: string;
}

const PromoBanners: React.FC = () => {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        const promoBanners = (data as BannerData[]).filter(
          b => b.position === 'mid-left' || b.position === 'mid-right'
        );
        setBanners(promoBanners);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fallbackBanners = [
    {
      id: 'limited-offer',
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/Untitled-1-12.png',
      titleLine1: 'LIMITED TIME',
      titleLine2: 'OFFER',
      subtitle: 'Premium Hijabs at Special Prices',
      buttonText: 'Shop Now',
      href: '/collections/limited-offer',
      alt: 'Limited Time Offer - Premium Hijabs'
    },
    {
      id: 'under999',
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_5961-15.jpg',
      titleLine1: 'UNDER',
      titleLine2: '\u20B9999',
      subtitle: 'Affordable Luxury for Everyday Wear',
      buttonText: 'Explore Collection',
      href: '/collections/under-999',
      alt: 'Under 999 Collection'
    }
  ];

  if (loading) {
    return (
      <section className="py-10 md:py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[1, 2].map(i => (
              <div key={i} className="aspect-square md:aspect-auto md:h-[600px] bg-[#E8E4DE] rounded-[12px] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayBanners = banners.length > 0
    ? banners.map(b => {
        const titleParts = b.title.split('\n');
        return {
          id: b.id.toString(),
          image: b.imageUrl,
          titleLine1: titleParts[0] || b.title,
          titleLine2: titleParts[1] || '',
          subtitle: b.subtitle,
          buttonText: b.buttonText,
          href: b.buttonLink,
          alt: b.title,
          titleFont: b.titleFont || 'serif',
          titleColor: b.titleColor || '#5C4B3D',
          subtitleColor: b.subtitleColor || '#5C4B3D',
        };
      })
    : fallbackBanners;

  return (
    <section className="py-10 md:py-20 bg-[#FAF9F6]">
      <div className="container mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {displayBanners.map((banner) => (
            <a
              key={banner.id}
              href={banner.href}
              className="group relative block aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-[12px] transform transition-premium hover:shadow-soft"
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              <div className="absolute inset-0 p-10 md:p-14 pointer-events-none flex flex-col justify-between">
                <div className="flex flex-col">
                  <h2 
                    className={`${banner.titleFont === 'sans' ? 'font-sans' : 'font-serif'} text-[42px] leading-[1] md:text-[64px] lg:text-[72px] select-none flex flex-col uppercase tracking-tight`}
                    style={{ color: banner.titleColor }}
                  >
                    <span className="block">{banner.titleLine1}</span>
                    {banner.titleLine2 && <span className="block">{banner.titleLine2}</span>}
                  </h2>
                  <p 
                    className="text-[16px] md:text-[18px] mt-4 max-w-[280px]"
                    style={{ color: banner.subtitleColor }}
                  >
                    {banner.subtitle}
                  </p>
                </div>
                <div className="pointer-events-auto">
                  <span className="inline-block bg-[#5C4B3D] text-white text-[12px] uppercase tracking-widest px-8 py-3 rounded-[8px] transition-colors hover:bg-[#4A3D32]">
                    {banner.buttonText}
                  </span>
                </div>
              </div>

              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
