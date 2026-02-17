"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Star } from 'lucide-react';

const testimonials = [
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

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-[#FAF9F6]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-[28px] md:text-[36px] font-serif italic text-[#1A1A1A] mb-2">
            Our Community Speaks
          </h2>
          <div className="w-12 h-[2px] bg-[#5C4B3D] mx-auto opacity-20"></div>
        </div>

        <div className="relative max-w-[1200px] mx-auto">
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -left-4 md:-left-8 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E8E4DE] text-[#5C4B3D] transition-all hover:bg-[#5C4B3D] hover:text-white shadow-sm"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 -right-4 md:-right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E8E4DE] text-[#5C4B3D] transition-all hover:bg-[#5C4B3D] hover:text-white shadow-sm"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((item) => (
                <div 
                  key={item.id}
                  className="min-w-full flex items-center justify-center px-8"
                >
                  <div className="max-w-[600px] text-center py-10">
                    <div className="flex justify-center gap-1 mb-6">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={18} fill="#D4A574" stroke="#D4A574" />
                      ))}
                    </div>
                    <blockquote className="font-serif italic text-[22px] md:text-[28px] text-[#1A1A1A] leading-relaxed mb-8">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[14px] font-semibold text-[#1A1A1A] uppercase tracking-wider">{item.author}</span>
                      <span className="text-[13px] text-[#757575]">{item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-[#5C4B3D] w-4' : 'bg-[#D4C8BE]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://instagram.com/zayelle.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#5C4B3D] text-white rounded-full font-sans text-sm font-medium transition-premium hover:bg-[#4A3D31] shadow-soft"
          >
            Visit our Instagram
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
