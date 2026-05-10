import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { ProductsProvider } from "@/lib/products-context";
import { OrdersProvider } from "@/lib/orders-context";
import { ThemeProvider } from "@/lib/theme-context";
import ScrollToTop from "@/components/scroll-to-top";

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
  title: "Best Hijabs in India | Premium Satin, Jersey & Chiffon Hijabs — Zayelle",
  description:
    "Shop India's best hijabs — premium satin silk, soft jersey, and chiffon hijabs. Zayelle offers modest fashion for the modern Indian woman. Free delivery above ₹1,950. All-India shipping.",
  keywords:
    "best hijab in india, buy hijabs online india, premium satin hijab, best jersey hijab india, chiffon hijab india, best abaya brand india, modest fashion india, soft jersey hijab india, hijab brand india, best hijab brand india, premium hijab online india",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GT-NBJ3X3R8"
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GT-NBJ3X3R8');
        `}
      </Script>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1957976071510679');
          fbq('track', 'PageView');
        `}
      </Script>
          <AuthProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <CartProvider>
                    <ThemeProvider>
                      <ScrollToTop />
                      {children}
                    </ThemeProvider>
                  </CartProvider>
                </OrdersProvider>
              </ProductsProvider>
            </AuthProvider>
        </body>
    </html>
  );
}
