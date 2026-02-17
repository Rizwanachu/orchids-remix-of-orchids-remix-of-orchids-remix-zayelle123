"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, allProducts as defaultProducts } from "./products";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByHandle: (handle: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | null>(null);

const PRODUCTS_KEY = "zayelle-products";
const PRODUCTS_VERSION_KEY = "zayelle-products-version";
const CURRENT_VERSION = 2; // bump when default product data changes

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
      try {
        const savedVersion = localStorage.getItem(PRODUCTS_VERSION_KEY);
        const version = savedVersion ? parseInt(savedVersion, 10) : 0;
        if (version < CURRENT_VERSION) {
          // Reset to new defaults when product data schema changes
          localStorage.removeItem(PRODUCTS_KEY);
          localStorage.setItem(PRODUCTS_VERSION_KEY, CURRENT_VERSION.toString());
        } else {
          const saved = localStorage.getItem(PRODUCTS_KEY);
          if (saved) {
            setProducts(JSON.parse(saved));
          }
        }
      } catch {}
      setLoaded(true);
    }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products, loaded]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const id = Date.now().toString();
    setProducts((prev) => [...prev, { ...product, id }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProductByHandle = useCallback(
    (handle: string) => products.find((p) => p.handle === handle),
    [products]
  );

  const searchProducts = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return products;
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    },
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, getProductByHandle, searchProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
