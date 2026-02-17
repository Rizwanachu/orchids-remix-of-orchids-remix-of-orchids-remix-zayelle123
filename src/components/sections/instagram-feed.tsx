import React from 'react';
import Image from 'next/image';

const InstagramFeed = () => {
  const instagramImages = [
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_3918-19.jpg",
      alt: "Zayelle hijab styled elegantly",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024807-21.jpg",
      alt: "Soft tones satin collection",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024804-22.jpg",
      alt: "Chiffon hijab close-up",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_3918-19.jpg",
      alt: "Everyday grace styling",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024807-21.jpg",
      alt: "Timeless style portrait",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024804-22.jpg",
      alt: "Neutral hijab editorial",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024804-22.jpg",
      alt: "Satin silk detail",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_3918-19.jpg",
      alt: "Zayelle modest fashion",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024807-21.jpg",
      alt: "Premium collection",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_3918-19.jpg",
      alt: "Elegant hijab posing",
      span: "row-span-2 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024804-22.jpg",
      alt: "Hijab accessories detail",
      span: "row-span-1 col-span-1",
    },
    {
      url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/1000024807-21.jpg",
      alt: "Zayelle editorial",
      span: "row-span-1 col-span-1",
    },
  ];

  return (
    <section className="py-[80px] md:py-[100px] bg-[#FAF9F6] overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif italic text-[36px] md:text-[48px] text-[#1A1A1A] mb-3">
            The Zayelle Edit
          </h2>
          <p className="text-[16px] text-[#757575]">Soft tones. Timeless style. Everyday grace.</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-[8px] md:gap-[12px] auto-rows-fr">
          {instagramImages.map((image, index) => (
            <div 
              key={index}
              className={`relative overflow-hidden group transition-premium rounded-[4px] md:rounded-[8px] aspect-[3/4] ${image.span}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  className="w-6 h-6"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a 
            href="https://instagram.com/zayelle.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#5C4B3D] hover:bg-[#4A3C31] text-white px-8 py-3.5 rounded-full transition-premium font-medium text-[14px] uppercase tracking-wider"
          >
            Visit our Instagram
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
