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
    <div className="bg-white border border-[#E8E4DE] rounded-2xl p-8 flex flex-col items-center text-center h-full">
      <div className="flex justify-center gap-1 mb-5">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} size={16} fill="#D4A574" stroke="#D4A574" />
        ))}
      </div>
      <blockquote className="font-serif italic text-[18px] md:text-[20px] text-[#1A1A1A] leading-relaxed mb-6 flex-1">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[13px] font-semibold text-[#1A1A1A] uppercase tracking-wider">
          {item.author}
        </span>
        {item.location && (
          <span className="text-[12px] text-[#757575]">{item.location}</span>
        )}
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
