"use client";

import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface FooterLink {
  name: string;
  href: string;
}

const defaultMainMenuLinks: FooterLink[] = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Collections", href: "/collections" },
  { name: "About Us", href: "/pages/about-us" },
  { name: "Contact", href: "/pages/contact" },
  { name: "FAQ", href: "/pages/faq" },
];

const defaultSupportLinks: FooterLink[] = [
  { name: "Shipping Policy", href: "/pages/shipping-policy" },
  { name: "Returns & Exchange", href: "/pages/returns-exchange" },
  { name: "Privacy Policy", href: "/pages/privacy-policy" },
  { name: "Terms of Service", href: "/pages/terms-of-service" },
  { name: "Track Your Order", href: "/pages/track-order" },
];

const defaultAccountLinks: FooterLink[] = [
  { name: "Login", href: "/account/login" },
  { name: "My Orders", href: "/account/orders" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Profile", href: "/account" },
];

const Footer = () => {
  const [tagline, setTagline] = useState("Where Modesty Meets Elegance");
  const [about1, setAbout1] = useState("Zayelle is a premium hijab and modest accessories brand created for women who value grace, comfort, and timeless design. Our pieces are thoughtfully selected to bring effortless elegance into your everyday wardrobe.");
  const [about2, setAbout2] = useState("We ship across India and focus on quality fabrics that feel as beautiful as they look.");
  const [mainMenuLinks, setMainMenuLinks] = useState<FooterLink[]>(defaultMainMenuLinks);
  const [supportLinks, setSupportLinks] = useState<FooterLink[]>(defaultSupportLinks);
  const [accountLinks, setAccountLinks] = useState<FooterLink[]>(defaultAccountLinks);
  const [contactEmail, setContactEmail] = useState("zayelle.in@gmail.com");
  const [contactWhatsapp, setContactWhatsapp] = useState("+91 8891485648");
  const [contactHours, setContactHours] = useState("Mon - Sat | 10 AM - 6 PM");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/zayelle.in");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [copyrightText, setCopyrightText] = useState("Copyright © Zayelle.in all rights reserved.");
  const [whatsappFloatUrl, setWhatsappFloatUrl] = useState("https://wa.me/918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648918891485648");
  const [whatsappFloatText, setWhatsappFloatText] = useState("Need Help? Chat with us");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data: Record<string, string> | null) => {
        if (!data) return;
        if (data["footer_tagline"]) setTagline(data["footer_tagline"]);
        if (data["footer_about_1"]) setAbout1(data["footer_about_1"]);
        if (data["footer_about_2"]) setAbout2(data["footer_about_2"]);
        if (data["footer_contact_email"]) setContactEmail(data["footer_contact_email"]);
        if (data["footer_contact_whatsapp"]) setContactWhatsapp(data["footer_contact_whatsapp"]);
        if (data["footer_contact_hours"]) setContactHours(data["footer_contact_hours"]);
        if (data["footer_instagram_url"]) setInstagramUrl(data["footer_instagram_url"]);
        if (data["footer_facebook_url"] !== undefined) setFacebookUrl(data["footer_facebook_url"]);
        if (data["footer_x_url"] !== undefined) setXUrl(data["footer_x_url"]);
        if (data["footer_copyright"]) setCopyrightText(data["footer_copyright"]);
        if (data["footer_whatsapp_float_url"]) setWhatsappFloatUrl(data["footer_whatsapp_float_url"]);
        if (data["footer_whatsapp_float_text"]) setWhatsappFloatText(data["footer_whatsapp_float_text"]);
        try {
          const parsed = JSON.parse(data["footer_main_menu"] || "");
          if (Array.isArray(parsed) && parsed.length > 0) setMainMenuLinks(parsed);
        } catch {}
        try {
          const parsed = JSON.parse(data["footer_support_links"] || "");
          if (Array.isArray(parsed) && parsed.length > 0) setSupportLinks(parsed);
        } catch {}
        try {
          const parsed = JSON.parse(data["footer_account_links"] || "");
          if (Array.isArray(parsed) && parsed.length > 0) setAccountLinks(parsed);
        } catch {}
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-[#D4C8BE] text-[#5C4B3D] pt-[60px] pb-[30px] font-sans">
      <div className="container mx-auto px-5 md:px-8">
        <div className="text-center mb-16 max-w-[700px] mx-auto">
          <h3 className="font-serif italic text-[28px] md:text-[32px] text-[#1A1A1A] mb-6">
            {tagline}
          </h3>
          <p className="text-[15px] leading-relaxed text-[#5C4B3D] mb-4">
            {about1}
          </p>
          <p className="text-[15px] leading-relaxed text-[#5C4B3D]">
            {about2}
          </p>
        </div>

        <div className="w-full border-t border-[#5C4B3D]/10 mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-[50px]">
          
          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Main Menu</h4>
            <ul className="flex flex-col gap-3">
              {mainMenuLinks.map((link, i) => (
                <li key={i}><a href={link.href} className="text-[14px] hover:underline transition-all">{link.name}</a></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Support</h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map((link, i) => (
                <li key={i}><a href={link.href} className="text-[14px] hover:underline transition-all">{link.name}</a></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Customer Account</h4>
            <ul className="flex flex-col gap-3">
              {accountLinks.map((link, i) => (
                <li key={i}><a href={link.href} className="text-[14px] hover:underline transition-all">{link.name}</a></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Contact Us</h4>
            <p className="text-[14px] mb-5 leading-relaxed opacity-90">
              Have a question? We&apos;re here to help.
            </p>
            
            <div className="flex flex-col gap-2 text-[14px] mb-4">
              <p><span className="font-semibold">Email:</span> {contactEmail}</p>
              <p><span className="font-semibold">WhatsApp:</span> {contactWhatsapp}</p>
              <p><span className="font-semibold">Hours:</span> {contactHours}</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#5C4B3D] transition-colors hover:bg-[#5C4B3D] hover:text-white"
                  title="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#5C4B3D] transition-colors hover:bg-[#5C4B3D] hover:text-white"
                  title="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {xUrl && (
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#5C4B3D] transition-colors hover:bg-[#5C4B3D] hover:text-white"
                  title="X (Twitter)"
                >
                  <XIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#5C4B3D]/10 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-[13px] opacity-70">
            {copyrightText}
          </p>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2">
        <div className="hidden md:block bg-white text-[#1A1A1A] px-4 py-2 rounded-md shadow-soft text-[14px] font-medium border border-border">
          {whatsappFloatText}
        </div>
        <a href={whatsappFloatUrl} target="_blank" rel="noopener noreferrer" className="w-[44px] h-[44px] md:w-[50px] md:h-[50px] bg-[#25D366] rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
