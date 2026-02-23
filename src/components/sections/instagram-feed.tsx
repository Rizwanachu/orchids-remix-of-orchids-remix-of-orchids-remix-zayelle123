"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DmTestimonial {
  id: number;
  imageUrl: string;
  alt: string;
  displayOrder: number;
  isActive: boolean;
}

const InstagramFeed = () => {
  const [testimonials, setTestimonials] = useState<DmTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dm-testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateActiveIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container || testimonials.length === 0) return;
    const cardWidth = container.scrollWidth / testimonials.length;
    const index = Math.round(container.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, testimonials.length - 1));
  }, [testimonials.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateActiveIndex);
    return () => container.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollByOne = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.scrollWidth / testimonials.length;
    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const totalDots = Math.max(1, testimonials.length > 5 ? testimonials.length - 4 : 1);

  if (loading) {
    return (
      <section className="py-[80px] md:py-[100px] bg-[#FAF9F6] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-[28px] text-[#1A1A1A]">
              Our DMs Say It All
            </h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(20%-13px)] aspect-[3/4] rounded-[12px] bg-[#E8E4DE] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-[80px] md:py-[100px] bg-[#FAF9F6] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-[28px] text-[#1A1A1A]">
            Our DMs Say It All
          </h2>
        </div>

        <div className="relative group/carousel">
          <button
            onClick={() => scrollByOne("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -ml-3"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-[#5C4B3D]" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] snap-start"
              >
                <div className="relative aspect-[3/4] rounded-[12px] border border-[#E8E4DE] overflow-hidden bg-white">
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollByOne("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -mr-3"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-[#5C4B3D]" />
          </button>
        </div>

        {totalDots > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const container = scrollRef.current;
                  if (!container) return;
                  const cardWidth = container.scrollWidth / testimonials.length;
                  container.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                }}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === i ? "bg-[#5C4B3D]" : "bg-[#D4CFC9]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

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
