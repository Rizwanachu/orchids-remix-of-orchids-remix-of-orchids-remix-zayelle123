import React from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function AboutUsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        {/* Hero */}
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              About Zayelle
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#757575] leading-relaxed">
              Where modesty meets elegance — crafted for the modern woman.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[900px] mx-auto">
          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-[24px] md:text-[28px] font-serif text-[#1A1A1A] mb-6">Our Story</h2>
            <div className="space-y-4 text-[15px] text-[#5C4B3D] leading-relaxed">
              <p>
                Zayelle was born from a simple belief — that modest fashion should never compromise on elegance, comfort, or quality. Founded in India, we set out to create a brand that celebrates the beauty of modesty through thoughtfully designed hijabs and accessories.
              </p>
              <p>
                Every piece in our collection is carefully curated to bring you premium fabrics with luxurious drapes. From the softness of our chiffon hijabs to the smooth elegance of our satin silk collection, we ensure that each product meets the highest standards of quality.
              </p>
              <p>
                We believe that what you wear is an extension of who you are. That&apos;s why we design for the woman who values grace in every detail — from the fabric against her skin to the way it flows with her movements.
              </p>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <h2 className="text-[24px] md:text-[28px] font-serif text-[#1A1A1A] mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Premium Quality",
                  description: "We source only the finest fabrics — chiffon, satin silk, jersey, modal — ensuring every hijab feels as beautiful as it looks.",
                },
                {
                  title: "Thoughtful Design",
                  description: "Each piece is designed with intention, combining timeless elegance with everyday practicality for the modern woman.",
                },
                {
                  title: "Inclusive Beauty",
                  description: "We celebrate modesty in all its forms, offering a wide range of styles, colors, and fabrics for every occasion.",
                },
              ].map((value) => (
                <div key={value.title} className="text-center p-6 bg-[#F5F2ED] rounded-[12px]">
                  <h3 className="text-[16px] font-semibold text-[#1A1A1A] uppercase tracking-wider mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[14px] text-[#757575] leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Promise */}
          <section className="mb-16">
            <h2 className="text-[24px] md:text-[28px] font-serif text-[#1A1A1A] mb-6">Our Promise</h2>
            <div className="space-y-4 text-[15px] text-[#5C4B3D] leading-relaxed">
              <p>
                At Zayelle, we promise to deliver more than just products. We deliver an experience. From the moment you visit our store to the day your order arrives at your doorstep, we strive to make every interaction seamless and delightful.
              </p>
              <p>
                We ship across India with careful packaging to ensure your hijabs arrive in perfect condition. Our customer support team is always ready to help you find the perfect piece for any occasion.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-10 border-t border-[#E8E4DE]">
            <h2 className="text-[24px] font-serif italic text-[#1A1A1A] mb-4">
              Join the Zayelle Community
            </h2>
            <p className="text-[15px] text-[#757575] mb-6 max-w-[500px] mx-auto">
              Follow us on Instagram for styling inspiration, new arrivals, and exclusive offers.
            </p>
            <a
              href="/collections/new-arrivals"
              className="inline-flex items-center justify-center bg-[#5C4B3D] text-[#FAF9F6] px-10 py-4 rounded-[12px] font-medium text-[14px] hover:bg-[#4A3C31] uppercase tracking-wider transition-colors"
            >
              Shop New Arrivals
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
