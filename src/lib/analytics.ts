declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function fire(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
  try {
    localStorage.setItem(
      "ga4_last_event",
      JSON.stringify({ event: eventName, time: new Date().toISOString() })
    );
  } catch {}
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export function trackProductView(params: {
  productId: string;
  productName: string;
  category?: string;
  price?: number;
}) {
  fire("view_item", {
    currency: "INR",
    value: params.price ?? 0,
    items: [
      {
        item_id: params.productId,
        item_name: params.productName,
        item_category: params.category ?? "",
        price: params.price ?? 0,
        quantity: 1,
      },
    ],
  });
}

export function trackAddToCart(params: {
  productId: string;
  productName: string;
  category?: string;
  price?: number;
  quantity?: number;
}) {
  const qty = params.quantity ?? 1;
  fire("add_to_cart", {
    currency: "INR",
    value: (params.price ?? 0) * qty,
    items: [
      {
        item_id: params.productId,
        item_name: params.productName,
        item_category: params.category ?? "",
        price: params.price ?? 0,
        quantity: qty,
      },
    ],
  });
}

export function trackBeginCheckout(params: {
  value: number;
  items: GA4Item[];
}) {
  fire("begin_checkout", {
    currency: "INR",
    value: params.value,
    items: params.items,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  items: GA4Item[];
}) {
  fire("purchase", {
    transaction_id: params.transactionId,
    currency: "INR",
    value: params.value,
    items: params.items,
  });
}

export function trackSearch(searchTerm: string) {
  fire("search", { search_term: searchTerm });
}

export function trackContactFormSubmit() {
  fire("contact_form_submit", { method: "web_form" });
}

export function trackWhatsAppClick(location: string) {
  fire("whatsapp_click", { event_category: "engagement", location });
}

export function sendTestEvent() {
  fire("admin_test_event", {
    event_category: "test",
    event_label: "Sent from Zayelle Admin Panel",
    timestamp: new Date().toISOString(),
  });
}
