"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface BundleOffer {
  quantity: number;
  price: number;
}

export interface CartItem {
  id: string;
  handle: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
  bundlePricing?: BundleOffer[] | null;
  isFreeShipping?: boolean;
  shippingCost?: number;
  shippingCostKerala?: number;
  deliveryCharges?: { zones?: { pincodes: string[]; charge: number }[] } | null;
}

export function getItemTotal(item: CartItem): number {
  if (item.bundlePricing && item.bundlePricing.length > 0) {
    const sorted = [...item.bundlePricing].sort((a, b) => b.quantity - a.quantity);
    const match = sorted.find(b => item.quantity >= b.quantity);
    if (match) return match.price;
  }
  return item.price * item.quantity;
}

export function getBestBundle(bundlePricing: BundleOffer[] | null | undefined, quantity: number): BundleOffer | null {
  if (!bundlePricing || bundlePricing.length === 0) return null;
  const sorted = [...bundlePricing].sort((a, b) => b.quantity - a.quantity);
  return sorted.find(b => quantity >= b.quantity) ?? null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("zayelle-cart");
      const savedWishlist = localStorage.getItem("zayelle-wishlist");
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("zayelle-cart", JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("zayelle-wishlist", JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, ...item, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + getItemTotal(i), 0);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isInWishlist = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
