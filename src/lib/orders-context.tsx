"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface OrderItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userEmail: string;
  date: string;
  status: "Confirmed" | "Packed" | "Shipped" | "Delivered";
  total: number;
  items: OrderItem[];
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date">) => Order;
  getUserOrders: (email: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

const ORDERS_KEY = "zayelle-orders";

let orderCounter = 10001;

function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredOrders();
    setOrders(stored);
    // Set counter to max existing order number + 1
    if (stored.length > 0) {
      const maxNum = Math.max(
        ...stored.map((o) => {
          const num = parseInt(o.id.replace("ZAY-", ""));
          return isNaN(num) ? 10000 : num;
        })
      );
      orderCounter = maxNum + 1;
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveOrders(orders);
  }, [orders, loaded]);

  const addOrder = useCallback((orderData: Omit<Order, "id" | "date">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ZAY-${orderCounter++}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const getUserOrders = useCallback(
    (email: string) => orders.filter((o) => o.userEmail.toLowerCase() === email.toLowerCase()),
    [orders]
  );

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id.toUpperCase() === id.toUpperCase()),
    [orders]
  );

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getUserOrders, getOrderById, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
