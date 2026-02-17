import React from 'react';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#D4C8BE] text-[#5C4B3D] pt-[60px] pb-[30px] font-sans">
      <div className="container mx-auto px-5 md:px-8">
        {/* About Preview */}
        <div className="text-center mb-16 max-w-[700px] mx-auto">
          <h3 className="font-serif italic text-[28px] md:text-[32px] text-[#1A1A1A] mb-6">
            Where Modesty Meets Elegance
          </h3>
          <p className="text-[15px] leading-relaxed text-[#5C4B3D] mb-4">
            Zayelle is a premium hijab and modest accessories brand created for women who value grace, comfort, and timeless design. Our pieces are thoughtfully selected to bring effortless elegance into your everyday wardrobe.
          </p>
          <p className="text-[15px] leading-relaxed text-[#5C4B3D]">
            We ship across India and focus on quality fabrics that feel as beautiful as they look.
          </p>
        </div>

        <div className="w-full border-t border-[#5C4B3D]/10 mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-[50px]">
          
          {/* Main Menu */}
          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Main Menu</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/" className="text-[14px] hover:underline transition-all">Home</a></li>
                <li><a href="/products" className="text-[14px] hover:underline transition-all">All Products</a></li>
                <li><a href="/new-arrivals" className="text-[14px] hover:underline transition-all">New Arrivals</a></li>
              <li><a href="/collections" className="text-[14px] hover:underline transition-all">Collections</a></li>
              <li><a href="/pages/about-us" className="text-[14px] hover:underline transition-all">About Us</a></li>
              <li><a href="/pages/contact" className="text-[14px] hover:underline transition-all">Contact</a></li>
              <li><a href="/pages/faq" className="text-[14px] hover:underline transition-all">FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Support</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/pages/shipping-policy" className="text-[14px] hover:underline transition-all">Shipping Policy</a></li>
              <li><a href="/pages/returns-exchange" className="text-[14px] hover:underline transition-all">Returns &amp; Exchange</a></li>
              <li><a href="/pages/privacy-policy" className="text-[14px] hover:underline transition-all">Privacy Policy</a></li>
              <li><a href="/pages/terms-of-service" className="text-[14px] hover:underline transition-all">Terms of Service</a></li>
              <li><a href="/pages/track-order" className="text-[14px] hover:underline transition-all">Track Your Order</a></li>
            </ul>
          </div>

          {/* Customer Account */}
          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Customer Account</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/account/login" className="text-[14px] hover:underline transition-all">Login</a></li>
              <li><a href="/account/orders" className="text-[14px] hover:underline transition-all">My Orders</a></li>
              <li><a href="/wishlist" className="text-[14px] hover:underline transition-all">Wishlist</a></li>
              <li><a href="/account" className="text-[14px] hover:underline transition-all">Profile</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col">
            <h4 className="text-[14px] font-semibold mb-6 uppercase tracking-wider">Contact Us</h4>
            <p className="text-[14px] mb-5 leading-relaxed opacity-90">
              Have a question? We&apos;re here to help.
            </p>
            
            <div className="flex flex-col gap-2 text-[14px] mb-4">
              <p><span className="font-semibold">Email:</span> support@zayelle.in</p>
              <p><span className="font-semibold">WhatsApp:</span> +91 XXXXX XXXXX</p>
              <p><span className="font-semibold">Hours:</span> Mon - Sat | 10 AM - 6 PM</p>
            </div>

            <div className="mt-4">
              <a 
                href="https://instagram.com/zayelle.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#5C4B3D] transition-colors hover:bg-[#5C4B3D] hover:text-white"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#5C4B3D]/10 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-[13px] opacity-70">
            Copyright &copy; Zayelle.in all rights reserved.
          </p>
        </div>
      </div>

      {/* WhatsApp Floating */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <div className="hidden md:block bg-white text-[#1A1A1A] px-4 py-2 rounded-md shadow-soft text-[14px] font-medium border border-border">
          Need Help? Chat with us
        </div>
        <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="w-[50px] h-[50px] bg-[#25D366] rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
