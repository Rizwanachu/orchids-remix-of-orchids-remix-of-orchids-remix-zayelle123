"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

interface AddToCartButtonProps {
  onAdd: () => void;
  size?: "sm" | "md";
  className?: string;
}

export default function AddToCartButton({ onAdd, size = "sm", className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (added) return;
    onAdd();
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }, 120);
  };

  if (size === "md") {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 transition-all duration-200 ${
          added
            ? "bg-[#E8D9C5] text-[#1A1A1A] scale-95"
            : animating
            ? "scale-95 opacity-80"
            : ""
        } ${className ?? ""}`}
      >
        {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        {added ? "Added!" : "Add to Cart"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full py-2.5 rounded-[8px] font-medium text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 ${
        added
          ? "bg-[#E8D9C5] text-[#1A1A1A] scale-95"
          : animating
          ? "scale-95 opacity-80"
          : "bg-white/90 backdrop-blur-sm text-[#1A1A1A] hover:bg-[#5C4B3D] hover:text-white"
      } ${className ?? ""}`}
    >
      {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
