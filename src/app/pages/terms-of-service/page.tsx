import React from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-[16px] text-[#757575]">
              Last updated: February 2026
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto space-y-8 text-[15px] text-[#5C4B3D] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Agreement to Terms</h2>
            <p>By accessing and using the Zayelle website (zayelle.in), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Products & Pricing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.</li>
              <li>We reserve the right to modify prices at any time without prior notice.</li>
              <li>Product colors may vary slightly from the images shown on the website due to screen settings and photography.</li>
              <li>We make every effort to ensure product descriptions and images are accurate, but minor variations may occur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Orders & Payment</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>By placing an order, you confirm that all information provided is accurate and complete.</li>
              <li>We reserve the right to cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud.</li>
              <li>Payment must be completed before order processing begins (except for COD orders).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Intellectual Property</h2>
            <p>All content on this website — including text, images, logos, graphics, and design — is the property of Zayelle and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Limitation of Liability</h2>
            <p>Zayelle shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the specific product in question.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after any changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Contact</h2>
            <p>For questions about these Terms of Service, please contact us at <a href="mailto:support@zayelle.in" className="underline underline-offset-4">support@zayelle.in</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
