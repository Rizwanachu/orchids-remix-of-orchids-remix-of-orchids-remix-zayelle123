import React from 'react';
import { Truck, Clock, Headphones } from 'lucide-react';

const TrustBar = () => {
  const trustItems = [
    {
      icon: <Truck size={28} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Free Shipping",
      description: "For all orders above \u20B91950",
    },
    {
      icon: <Clock size={28} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Fast Delivery",
      description: "Estimated delivery 5-8 days across India",
    },
    {
      icon: <Headphones size={28} strokeWidth={1.25} className="text-[#5C4B3D]" />,
      title: "Support Online",
      description: "We\u2019re here Monday - Saturday, 10 AM - 6 PM",
    },
  ];

  return (
    <section className="bg-[#FAF9F6] border-t border-[#E8E4DE] py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center space-y-4 px-4"
            >
              <div className="transition-premium hover:scale-110">
                {item.icon}
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-[16px] font-medium text-[#1A1A1A] uppercase tracking-wider font-sans">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#757575] font-sans leading-relaxed">
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
