"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, fetchShopifyProducts } from "./products";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByHandle: (handle: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

const PRODUCTS_KEY = "zayelle-products";
const PRODUCTS_VERSION_KEY = "zayelle-products-version";
const CURRENT_VERSION = 2; // bump when default product data changes

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshProducts = useCallback(async () => {
    // Force a fresh fetch from Shopify by bypassing any internal cache
    const shopifyProducts = await fetchShopifyProducts();
    if (shopifyProducts && shopifyProducts.length > 0) {
      setProducts(shopifyProducts);
      // Update local storage immediately to ensure consistency across tabs/refreshes
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(shopifyProducts));
    }
  }, []);

  useEffect(() => {
    refreshProducts().then(() => setLoaded(true));
    
    // Optional: Refresh products when the window regains focus to catch new Shopify publications
    const handleFocus = () => refreshProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshProducts]);

  useEffect(() => {
    if (!loaded || products.length === 0) return;
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
      value={{ products, addProduct, updateProduct, deleteProduct, getProductByHandle, searchProducts, refreshProducts }}
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
