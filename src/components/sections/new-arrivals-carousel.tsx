"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Search } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type CarouselProduct = Product & { colorSlug?: string | null; colorName?: string | null };

const ProductCard = ({ product, isPriority }: { product: CarouselProduct; isPriority?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  const productUrl = product.colorSlug
    ? `/products/${product.handle}?color=${product.colorSlug}`
    : `/products/${product.handle}`;
  const displayName = product.colorName
    ? product.name.replace(/ — .*$/, "")
    : product.name;

  return (
    <div 
      className="embla__slide flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 pl-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group flex flex-col items-center text-center mb-8">
        <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white transition-premium">
          <a href={productUrl} className="relative block w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={isPriority}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-500 scale-100 group-hover:scale-105 ${
                isHovered ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src={product.hoverImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-500 scale-105 group-hover:scale-100 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          </a>

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-primary hover:text-white"}`}
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
            </button>
            <a href={productUrl} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-primary hover:text-white transition-colors">
              <Search size={18} />
            </a>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <AddToCartButton
              onAdd={() => addItem({ id: product.id, handle: product.handle, name: product.name, subtitle: product.subtitle, price: product.price, image: product.image })}
              className="py-3 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 pointer-events-auto"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 w-full px-2">
          <h3 className="text-[14px] font-normal text-foreground capitalize tracking-tight line-clamp-1">
            <a href={productUrl} className="hover:text-primary transition-colors">
              {displayName}
            </a>
          </h3>
          {product.colorName && (
            <p className="text-[11px] text-[#999] mt-0.5">{product.colorName}</p>
          )}
          <p className="text-[12px] text-[#757575]">{product.subtitle}</p>
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[16px] font-semibold text-foreground">
              ₹{product.price.toLocaleString("en-IN")}.00
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-[13px] text-[#757575] line-through">
                ₹{product.compareAt.toLocaleString("en-IN")}.00
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewArrivalsCarousel() {
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("New Arrivals");
  const [sectionSubtitle, setSectionSubtitle] = useState("Designed for comfort. Crafted for elegance.");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 2,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 4 }
    }
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    onSelect();
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 4000);
    fetch("/api/new-arrivals")
      .then((res) => res.json())
      .then((data) => { setProducts(data); clearTimeout(timeoutId); setLoading(false); })
      .catch(() => { clearTimeout(timeoutId); setLoading(false); });
    fetch("/api/homepage-settings")
      .then((res) => res.json())
      .then((settings) => {
        if (settings.newArrivalsTitle) setSectionTitle(settings.newArrivalsTitle);
        if (settings.newArrivalsSubtitle) setSectionSubtitle(settings.newArrivalsSubtitle);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <section className="py-[80px] bg-background">
        <div className="container">
          <header className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-[32px] font-serif italic text-foreground mb-2">{sectionTitle}</h2>
            <p className="text-[14px] text-[#757575] mb-4">{sectionSubtitle}</p>
            <div className="w-[60px] h-[1px] bg-border mb-8"></div>
          </header>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse px-2">
                <div className="aspect-square bg-[#F5F2ED] rounded-[12px]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-[#F5F2ED] rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-[#F5F2ED] rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-[80px] bg-background">
        <div className="container">
          <header className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-[32px] font-serif italic text-foreground mb-2">{sectionTitle}</h2>
            {sectionSubtitle && <p className="text-[14px] text-[#757575] mb-4">{sectionSubtitle}</p>}
            <div className="w-[60px] h-[1px] bg-border mb-8"></div>
          </header>
        </div>
      </section>
    );
  }

  return (
    <section className="py-[80px] bg-background overflow-hidden">
      <div className="container">
        <header className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-[32px] font-serif italic text-foreground mb-2">
            {sectionTitle}
          </h2>
          <p className="text-[14px] text-[#757575] mb-4">{sectionSubtitle}</p>
          <div className="w-[60px] h-[1px] bg-border mb-8"></div>
        </header>

        <div className="relative group/carousel px-4 sm:px-0">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex ml-[-20px]">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} isPriority={index < 4} />
              ))}
            </div>
          </div>

          <button 
            onClick={scrollPrev}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:left-[-40px] transition-all duration-300 hidden xl:flex z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:right-[-40px] transition-all duration-300 hidden xl:flex z-10"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide group ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                selectedIndex === index
                  ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a 
            href="/new-arrivals" 
            className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
          >
            View All
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
