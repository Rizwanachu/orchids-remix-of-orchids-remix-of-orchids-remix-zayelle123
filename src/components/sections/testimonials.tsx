"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  rating: number;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "Finally found hijabs that feel light and look premium.",
    author: "Ayesha R.",
    location: "Mumbai",
    rating: 5,
  },
  {
    id: 2,
    quote: "The satin collection drapes beautifully and stays in place.",
    author: "Fatima K.",
    location: "Delhi",
    rating: 5,
  },
  {
    id: 3,
    quote: "Packaging was elegant. The quality exceeded expectations.",
    author: "Noor S.",
    location: "Bangalore",
    rating: 5,
  },
  {
    id: 4,
    quote: "Perfect modest wear brand in India.",
    author: "Zahra M.",
    location: "Hyderabad",
    rating: 5,
  },
];

const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <div className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-5">
    <div className="relative bg-[#faf8f5] border border-[#e8e2da] rounded-2xl p-7 flex flex-col h-full overflow-hidden group hover:shadow-md transition-shadow duration-300">
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5C4B3D] via-[#8B735B] to-[#c4b5a5] rounded-t-2xl" />

      {/* Stars + rating row */}
      <div className="flex items-center justify-between mb-5 mt-1">
        <div className="flex gap-[3px]">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} size={13} fill="#c9985c" stroke="none" />
          ))}
        </div>
        <span className="text-[10px] text-[#5C4B3D] font-semibold tracking-[1.5px] uppercase opacity-60">Verified</span>
      </div>

      {/* Decorative quote mark */}
      <div
        className="font-serif leading-none text-[80px] text-[#5C4B3D] opacity-[0.12] select-none mb-[-16px] mt-[-8px]"
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Quote */}
      <blockquote className="font-serif italic text-[17px] text-[#2a2118] leading-[1.65] flex-1 mb-6">
        {item.quote}
      </blockquote>

      {/* Divider */}
      <div className="h-px bg-[#e8e2da] mb-5" />

      {/* Author row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#5C4B3D] flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-semibold text-white uppercase">
            {item.author.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[#1A1A1A] tracking-wide">
            {item.author}
          </span>
          {item.location && (
            <span className="text-[11px] text-[#8c7b6e] mt-[1px]">{item.location}</span>
          )}
        </div>
      </div>

    </div>
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) setSlidesPerView(3);
      else if (window.innerWidth >= 640) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-[80px] bg-[#FAF9F6] overflow-hidden">
      <div className="container">
        <header className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-[32px] font-serif italic text-foreground mb-2">
            Our Community Speaks
          </h2>
          <div className="w-[60px] h-[1px] bg-[#5C4B3D] opacity-20 mb-8"></div>
        </header>

        <div className="relative group/carousel px-4 sm:px-0">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex ml-[-20px]">
              {testimonials.map((item) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <button
            onClick={scrollPrev}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft border border-[#E8E4DE] text-[#5C4B3D] opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:left-[-40px] transition-all duration-300 hidden xl:flex z-10 hover:bg-[#5C4B3D] hover:text-white"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft border border-[#E8E4DE] text-[#5C4B3D] opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:right-[-40px] transition-all duration-300 hidden xl:flex z-10 hover:bg-[#5C4B3D] hover:text-white"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(testimonials.length / slidesPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index * slidesPerView)}
              className={`transition-all duration-300 rounded-full ${
                Math.floor(selectedIndex / slidesPerView) === index
                  ? "w-4 h-2 bg-[#5C4B3D]"
                  : "w-2 h-2 bg-[#D4C8BE]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
