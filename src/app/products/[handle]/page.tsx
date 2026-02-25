"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield, Loader2, ChevronDown } from "lucide-react";
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
  const [addedToCart, setAddedToCart] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

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

  const images = [product.image, product.hoverImage];
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
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {product.badge && (
                  <span className={`absolute top-4 left-4 px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-full ${product.badge === "Sale" ? "bg-[#991B1B] text-white" : "bg-[#5C4B3D] text-white"}`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-[8px] overflow-hidden border-2 transition-colors ${activeImage === idx ? "border-[#5C4B3D]" : "border-transparent hover:border-[#D4C8BE]"}`}
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
                          {Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

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
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "description" ? "max-h-[500px] pb-4" : "max-h-0"}`}>
                    <p className="text-[14px] text-[#555] leading-relaxed">{product.description}</p>
                    {product.details.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="text-[13px] text-[#555] flex items-start gap-2">
                            <span className="text-[#5C4B3D] mt-0.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">Shipping Policy</span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "shipping" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "shipping" ? "max-h-[500px] pb-4" : "max-h-0"}`}>
                    <p className="text-[14px] text-[#555] leading-relaxed">
                      {product.shippingPolicy || "Free shipping on orders above Rs. 1,950. Standard delivery within 5-7 business days across India. Express shipping available at checkout."}
                    </p>
                  </div>
                </div>

                <div className="border-b border-[#E8E4DE]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "returns" ? null : "returns")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#1A1A1A] uppercase tracking-wider">Return Policy</span>
                    <ChevronDown size={18} className={`text-[#757575] transition-transform duration-300 ${openAccordion === "returns" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "returns" ? "max-h-[500px] pb-4" : "max-h-0"}`}>
                    <p className="text-[14px] text-[#555] leading-relaxed">
                      {product.returnPolicy || "Easy returns within 7 days of delivery. Product must be unused, unwashed, and in original packaging with tags attached. Refunds are processed within 5-7 business days."}
                    </p>
                  </div>
                </div>
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
