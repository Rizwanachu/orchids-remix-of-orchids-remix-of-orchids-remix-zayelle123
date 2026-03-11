"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield, Loader2, ChevronDown, Share2, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";
import ProductReviews, { ProductReviewSummary } from "@/components/product-reviews";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const handle = params?.handle as string;
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const { getProductByHandle, products, loaded } = useProducts();
  const product = getProductByHandle(handle);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Pre-select color from URL ?color=slug param
  useEffect(() => {
    if (!product) return;
    const colors = (product as any).colors as Array<{ name: string; hex: string; image?: string; images?: string[] }> | undefined;
    if (!colors || colors.length === 0) return;
    const colorParam = new URLSearchParams(window.location.search).get("color");
    if (!colorParam) return;
    const idx = colors.findIndex(
      (c) => c.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === colorParam
    );
    if (idx !== -1) {
      setSelectedColorIdx(idx);
      const c = colors[idx];
      setSelectedColorImage((c.images?.[0] ?? c.image) || null);
    }
  }, [product]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareModal(false);
      }
    };
    if (showShareModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareModal]);

  if (!loaded) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#5C4B3D]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-[24px] font-serif text-[#1A1A1A] mb-2">Product Not Found</h1>
            <p className="text-[14px] text-[#757575] mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <a href="/products" className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3 rounded-sm text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors">
              Browse Products
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const images = [product.image, product.hoverImage, ...(product.gallery || [])].filter((img, idx, arr) => img && arr.indexOf(img) === idx);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        handle: product.handle,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        image: product.image,
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyItNow = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: product.id,
              handle: product.handle,
              name: product.name,
              subtitle: product.subtitle,
              price: product.price,
              image: product.image,
              quantity: quantity,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        if (data.checkoutUrl === "/checkout") {
          const params = new URLSearchParams();
          params.set("id", product.id);
          params.set("quantity", quantity.toString());
          params.set("direct", "true");
          window.location.href = `/checkout?${params.toString()}`;
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        console.error("Failed to get checkout URL", data);
        alert("Checkout failed. Please try again.");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setIsRedirecting(false);
    }
  };

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        {/* Breadcrumb */}
        <div className="container px-4 md:px-8 py-4">
          <nav className="text-[13px] text-[#757575]">
            <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
            <span className="mx-2">&gt;</span>
            <a href="/products" className="hover:text-[#1A1A1A] transition-colors">Products</a>
            <span className="mx-2">&gt;</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <div className="container px-4 md:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-[12px] bg-white">
                <Image
                  src={selectedColorImage || images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-300 ease-in-out"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {product.badge && (
                  <span className={`absolute top-4 left-4 px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-full ${product.badge === "Sale" ? "bg-[#991B1B] text-white" : "bg-[#5C4B3D] text-white"}`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveImage(idx); setSelectedColorImage(null); setSelectedColorIdx(null); }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-colors ${!selectedColorImage && activeImage === idx ? "border-[#5C4B3D]" : "border-transparent hover:border-[#D4C8BE]"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="text-[28px] md:text-[36px] font-serif text-[#1A1A1A] tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-[14px] text-[#757575] mt-1">{product.subtitle}</p>
              <ProductReviewSummary productId={product.id} />

                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-[24px] font-semibold text-[#1A1A1A]">
                      ₹{product.price.toLocaleString("en-IN")}.00
                    </span>
                    {product.compareAt && product.compareAt > product.price && (
                      <>
                        <span className="text-[16px] text-[#757575] line-through">
                          ₹{product.compareAt.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[13px] font-medium text-[#991B1B] bg-red-50 px-2 py-0.5 rounded">
                          {Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}% OFF (SAVE ₹{(product.compareAt - product.price).toLocaleString("en-IN")})
                        </span>
                      </>
                    )}
                  </div>

              {(product as any).colors && (product as any).colors.length > 0 && (
                <div className="mt-4">
                  <p className="text-[12px] text-[#757575] mb-2.5 uppercase tracking-wider font-medium">
                    {selectedColorIdx !== null
                      ? <>Color — <span className="text-[#1A1A1A] normal-case font-semibold">{(product as any).colors[selectedColorIdx]?.name}</span></>
                      : "Select Color"
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(product as any).colors.map((color: { name: string; hex: string; image?: string; images?: string[] }, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (selectedColorIdx === i) {
                            setSelectedColorIdx(null);
                            setSelectedColorImage(null);
                          } else {
                            setSelectedColorIdx(i);
                            setSelectedColorImage((color.images?.[0] ?? color.image) || null);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 cursor-pointer text-[13px] ${
                          selectedColorIdx === i
                            ? "border-[#5C4B3D] bg-[#5C4B3D]/5 shadow-sm font-medium text-[#1A1A1A]"
                            : "border-[#E8E4DE] hover:border-[#5C4B3D] text-[#555]"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex-shrink-0 border ${selectedColorIdx === i ? "border-[#5C4B3D]/40" : "border-black/10"}`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full h-px bg-[#E8E4DE] my-6" />

              {/* Quantity + Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <div className="flex items-center border border-[#E8E4DE] rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-11 h-11 flex items-center justify-center text-[14px] font-medium text-[#1A1A1A] border-x border-[#E8E4DE]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#5C4B3D] text-white py-3 px-8 rounded-sm font-medium text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4A3C31] transition-colors"
                >
                  <ShoppingCart size={16} />
                  {addedToCart ? "Added!" : "Add to Cart"}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-11 h-11 border rounded-sm flex items-center justify-center transition-colors ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-[#E8E4DE] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"}`}
                >
                  <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                </button>

                <div className="relative" ref={shareRef}>
                  <button
                    onClick={() => setShowShareModal((v) => !v)}
                    className="w-11 h-11 border border-[#E8E4DE] rounded-sm flex items-center justify-center transition-colors text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                    title="Share Product"
                  >
                    <Share2 size={18} />
                  </button>

                  {showShareModal && (
                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-white border border-[#E8E4DE] rounded-xl shadow-lg overflow-hidden z-50">
                      <p className="px-4 py-2.5 text-[11px] font-semibold text-[#757575] uppercase tracking-wider border-b border-[#F5F2ED]">Share this product</p>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareModal(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-[13px] text-[#1A1A1A]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        Facebook
                      </a>

                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareModal(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-[13px] text-[#1A1A1A]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X (Twitter)
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(product.name + " — " + window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareModal(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-[13px] text-[#1A1A1A]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>

                      <button
                        onClick={() => { handleShare(); setShowShareModal(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-[13px] text-[#1A1A1A] border-t border-[#F5F2ED]"
                      >
                        {linkCopied ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBuyItNow}
                disabled={isRedirecting}
                className="mt-3 w-full bg-[#5C4B3D] text-white py-3 rounded-sm font-medium text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4A3C31] transition-colors disabled:opacity-70 shadow-sm"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy It Now"
                )}
              </button>

              {/* Accordion Sections */}
              <div className="mt-8 border-t border-[#E8E4DE]">
                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">Description</span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "description" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "description" ? "max-h-[2000px] pb-4" : "max-h-0"}`}>
                    {(() => {
                      const descLines = (product.description || "").split("\n").map(l => l.trim()).filter(Boolean);
                      const bulletLines = descLines.filter(l => /^[-•*]/.test(l));
                      const nonBulletLines = descLines.filter(l => !/^[-•*]/.test(l));
                      return (
                        <>
                          {nonBulletLines.length > 0 && (
                            <div className="space-y-1.5">
                              {nonBulletLines.map((line, i) => (
                                <p key={i} className="text-[14px] text-[#555] leading-relaxed">{line}</p>
                              ))}
                            </div>
                          )}
                          {bulletLines.length > 0 && (
                            <ul className={`space-y-1.5 ${nonBulletLines.length > 0 ? "mt-3" : ""}`}>
                              {bulletLines.map((line, i) => (
                                <li key={i} className="text-[13px] text-[#555] flex items-start gap-2">
                                  <span className="text-[#5C4B3D] mt-0.5 flex-shrink-0">•</span>
                                  <span>{line.replace(/^[-•*]\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {product.details.length > 0 && (
                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "productDetails" ? null : "productDetails")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">Product Details</span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "productDetails" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "productDetails" ? "max-h-[2000px] pb-4" : "max-h-0"}`}>
                    <ul className="space-y-2">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="text-[14px] text-[#444] flex items-start gap-2.5 leading-relaxed">
                          <span className="text-[#333] mt-[5px] flex-shrink-0 text-[8px]">●</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                )}

                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">Care Instruction</span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "care" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "care" ? "max-h-[500px] pb-4" : "max-h-0"}`}>
                    {(() => {
                      const text = product.careInstructions || "Hand wash recommended\nUse mild detergent\nDo not bleach\nSteam iron only";
                      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
                      if (lines.length > 1) {
                        return (
                          <ul className="space-y-1.5">
                            {lines.map((line, idx) => (
                              <li key={idx} className="text-[13px] text-[#555] flex items-start gap-2">
                                <span className="text-[#5C4B3D] mt-0.5">•</span>
                                {line}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return <p className="text-[14px] text-[#555] leading-relaxed">{text}</p>;
                    })()}
                  </div>
                </div>
              </div>

              {(product as any).customHamperEnabled ? (
                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "hamper" ? null : "hamper")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">
                      {(product as any).customHamperTitle || "Need a Custom Hamper?"}
                    </span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "hamper" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "hamper" ? "max-h-[600px] pb-4" : "max-h-0"}`}>
                    <div className="space-y-3">
                      {((product as any).customHamperBody || "").split("\n").filter((l: string) => l.trim()).map((para: string, idx: number) => (
                        <p key={idx} className="text-[14px] text-[#555] leading-relaxed">{para}</p>
                      ))}
                      {((product as any).customHamperInstagram || (product as any).customHamperContact) && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {(product as any).customHamperInstagram && (
                            <a
                              href={(product as any).customHamperInstagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-[13px] rounded-sm hover:bg-[#4A3C31] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                              DM on Instagram
                            </a>
                          )}
                          {(product as any).customHamperContact && (
                            <a
                              href={(product as any).customHamperContact}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-[#5C4B3D] text-[#5C4B3D] text-[13px] rounded-sm hover:bg-[#F5F2ED] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              Contact Page
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 p-4 bg-[#F5F2ED] rounded-lg border border-[#E8E4DE]">
                <p className="text-[12px] text-[#757575] leading-relaxed italic">
                  <span className="font-semibold text-[#1A1A1A]">Please Note:</span> While we try to display product colors as accurately as possible, slight variations may occur due to different screen settings and lighting conditions.
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#E8E4DE]">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={20} className="text-[#5C4B3D]" />
                  <span className="text-[11px] text-[#757575] uppercase tracking-wider">Free Shipping ₹1950+</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw size={20} className="text-[#5C4B3D]" />
                  <span className="text-[11px] text-[#757575] uppercase tracking-wider">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield size={20} className="text-[#5C4B3D]" />
                  <span className="text-[11px] text-[#757575] uppercase tracking-wider">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          <ProductReviews productId={product.id} productName={product.name} />

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-[24px] font-serif text-[#1A1A1A] text-center mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <a key={p.id} href={`/products/${p.handle}`} className="group flex flex-col">
                    <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1 group-hover:text-[#5C4B3D] transition-colors">
                        {p.name}
                      </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">{p.subtitle}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[15px] font-semibold text-[#1A1A1A]">
                              ₹{p.price.toLocaleString("en-IN")}.00
                            </span>
                            {p.compareAt && p.compareAt > p.price && (
                              <span className="text-[13px] text-[#757575] line-through">
                                ₹{p.compareAt.toLocaleString("en-IN")}.00
                              </span>
                            )}
                          </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
