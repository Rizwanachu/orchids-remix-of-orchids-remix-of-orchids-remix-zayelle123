import React from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

const collections = [
  {
    title: "Chiffon Hijabs",
    subtitle: "Lightweight. Breathable. Everyday elegance.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/Chiffon-Hijabs-1771239778583.png?width=8000&height=8000&resize=contain",
    href: "/collections/chiffon-hijabs",
  },
  {
    title: "Satin Silk Hijabs",
    subtitle: "Smooth finish with a luxurious drape.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/satin-silk-hijab-1771240160293.jpeg?width=8000&height=8000&resize=contain",
    href: "/collections/satin-silk-hijabs",
  },
  {
    title: "Premium Jersey Wraps",
    subtitle: "Comfortable stretch for all-day wear.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/premium-jersey-wraps-1771240529554.jpeg?width=8000&height=8000&resize=contain",
    href: "/collections/premium-jersey-wraps",
  },
  {
    title: "Everyday Essentials",
    subtitle: "Undercaps, pins, and styling basics.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/a9ca71f2-9ed6-4deb-bdfa-a6ddb126d30f/Everyday-Essentials-Undercaps-Pins-Styling-Basics-1771240935345.jpeg?width=8000&height=8000&resize=contain",
    href: "/collections/everyday-essentials",
  },
  {
    title: "Occasion Hijabs",
    subtitle: "Elegant pieces for events and celebrations.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_2813web2-16.jpg",
    href: "/collections/occasion-hijabs",
  },
  {
    title: "Neutral Tones Edit",
    subtitle: "Beige, taupe, ivory, mocha and soft browns.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/IMG_2750web2-17.jpg",
    href: "/collections/neutral-tones",
  },
  {
    title: "Limited Collection",
    subtitle: "Exclusive drops. Limited stock.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/BB6FE085-B878-48D5-BE73-1E76A890F71B-26.jpg",
    href: "/collections/limited",
  },
  {
    title: "Accessories",
    subtitle: "Premium hijab pins, magnets, and styling sets.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/3F3F8F7A-903E-417F-9349-2C27005D1B74-27.jpg",
    href: "/collections/accessories",
  },
  {
    title: "New Arrivals",
    subtitle: "Our latest drops — fresh styles just added.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/0004D5A6-8E3A-47CC-A349-E6285D790B40-1.jpg",
    href: "/collections/new-arrivals",
  },
];

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              All Collections
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">Collections</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-10">
            {collections.map((collection, index) => (
              <a key={index} href={collection.href} className="group flex flex-col items-center text-center">
                <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                  />
                </div>
                <h3 className="mt-4 text-[16px] font-medium text-[#1A1A1A] uppercase tracking-tight group-hover:text-[#5C4B3D] transition-colors">
                  {collection.title}
                </h3>
                <p className="text-[13px] text-[#757575] mt-1">{collection.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
