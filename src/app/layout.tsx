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
  title: "Zayelle - Premium Hijabs & Modest Accessories | India",
  description:
    "Zayelle offers premium hijabs and modest accessories in India. Shop chiffon, satin silk, jersey wraps, and elegant everyday essentials with all-India delivery.",
  keywords:
    "premium hijabs India, buy hijabs online India, satin hijabs India, chiffon hijabs online, modest fashion India, hijab accessories India, luxury hijabs India",
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
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1957976071510679&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased`}
        >
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
