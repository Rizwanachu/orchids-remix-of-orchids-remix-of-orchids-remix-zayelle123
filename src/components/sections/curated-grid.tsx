import React from 'react';
import Image from 'next/image';

const CuratedGrid = () => {
  const gridItems = [
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/124E61EB-00B7-4855-9B30-53467E0EF77C-18.jpg",
      title: "Signature Satin Collection",
      buttonText: "Shop Now",
      href: "/collections/satin",
      alt: "Satin hijab styled elegantly"
    },
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/DCE08277-C327-425E-90D0-AE38F478E185-30.jpg",
      title: "The Neutral Edit",
      buttonText: "Explore",
      href: "/collections/neutral-edit",
      alt: "Neutral chiffon lineup"
    },
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_2813web2-16.jpg",
      title: "Luxury Gift Sets",
      buttonText: "Discover",
      href: "/collections/gift-sets",
      alt: "Premium packaging box"
    },
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/3F3F8F7A-903E-417F-9349-2C27005D1B74-27.jpg",
      title: "Everyday Essentials",
      buttonText: "Shop Essentials",
      href: "/collections/everyday-essentials",
      alt: "Undercap and accessory flat lay"
    }
  ];

  return (
    <section className="py-20 md:py-[100px] bg-[#FAF9F6]">
      <div className="container mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {gridItems.map((item, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-[12px] min-h-[400px] md:min-h-[500px]">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-center w-full px-4">
                <div className="inline-block bg-[#E8E4DE]/90 backdrop-blur-sm px-6 py-4 rounded-sm shadow-sm">
                  <h3 className="font-serif italic text-[22px] md:text-[24px] text-[#1A1A1A] mb-3">
                    {item.title}
                  </h3>
                  <a 
                    href={item.href} 
                    className="inline-block bg-[#5C4B3D] text-white text-[12px] uppercase tracking-widest px-8 py-3 transition-colors hover:bg-[#4A3D32]"
                  >
                    {item.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedGrid;
