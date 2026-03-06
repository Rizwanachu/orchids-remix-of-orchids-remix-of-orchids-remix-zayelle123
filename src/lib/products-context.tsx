"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "./products";

interface ProductsContextType {
  products: Product[];
  loaded: boolean;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByHandle: (handle: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);

  useEffect(() => {
    refreshProducts().then(() => setLoaded(true));
  }, [refreshProducts]);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      
      if (res.ok) {
        const newProduct = await res.json();
        setProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      } else {
        const errorData = await res.json();
        console.error("Failed to add product:", errorData.error || res.statusText);
        throw new Error(errorData.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
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
      value={{ products, loaded, addProduct, updateProduct, deleteProduct, getProductByHandle, searchProducts, refreshProducts }}
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
