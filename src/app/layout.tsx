import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { ProductsProvider } from "@/lib/products-context";
import { OrdersProvider } from "@/lib/orders-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Zayelle - Premium Hijabs & Modest Accessories | India",
  description:
    "Zayelle offers premium hijabs and modest accessories in India. Shop chiffon, satin silk, jersey wraps, and elegant everyday essentials with all-India delivery.",
  keywords:
    "premium hijabs India, buy hijabs online India, satin hijabs India, chiffon hijabs online, modest fashion India, hijab accessories India, luxury hijabs India",
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zayelle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased`}
        >
          <AuthProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <CartProvider>
                    {children}
                  </CartProvider>
                </OrdersProvider>
              </ProductsProvider>
            </AuthProvider>
          <VisualEditsMessenger />
        </body>
    </html>
  );
}
