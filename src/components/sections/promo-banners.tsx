import React from 'react';
import Image from 'next/image';

const PromoBanners: React.FC = () => {
  const banners = [
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

  return (
    <section className="py-10 md:py-20 bg-[#FAF9F6]">
      <div className="container mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {banners.map((banner) => (
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
                  <h2 className="font-serif text-[42px] leading-[1] md:text-[64px] lg:text-[72px] text-primary select-none flex flex-col uppercase tracking-tight">
                    <span className="block">{banner.titleLine1}</span>
                    <span className="block">{banner.titleLine2}</span>
                  </h2>
                  <p className="text-[16px] md:text-[18px] text-[#5C4B3D] mt-4 max-w-[280px]">
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
