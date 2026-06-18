import React from 'react';
import { Truck, ShieldCheck, RefreshCcw, Heart } from 'lucide-react';

const TrustBar = () => {
  const trustItems = [
    {
      icon: <ShieldCheck size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Secure Payments",
      description: "UPI, Cards, Net Banking & Cash on Delivery",
    },
    {
      icon: <Truck size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Pan India Shipping",
      description: "Estimated delivery 3–7 business days",
    },
    {
      icon: <RefreshCcw size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Easy Returns",
      description: "Hassle-free exchange & return policy",
    },
    {
      icon: <Heart size={26} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Made With Love",
      description: "Small business supporting Indian women",
    },
  ];

  return (
    <section className="bg-[#FAF9F6] border-t border-[#E8E4DE] py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center space-y-3 px-4"
            >
              <div className="transition-all hover:scale-110">
                {item.icon}
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] uppercase tracking-wider font-sans">
                  {item.title}
                </h3>
                <p className="text-[12px] sm:text-[13px] text-[#757575] font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
