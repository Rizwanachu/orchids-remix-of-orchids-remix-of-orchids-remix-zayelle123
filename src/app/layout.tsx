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
import { db } from "@/../server/db";
import { siteSettings } from "@/../shared/schema";
import { eq } from "drizzle-orm";

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
  metadataBase: new URL("https://zayelle.in"),
  title: "Best Hijabs in India | Premium Satin, Jersey & Chiffon Hijabs — Zayelle",
  description:
    "Shop India's best hijabs — premium satin silk, soft jersey, and chiffon hijabs. Zayelle offers modest fashion for the modern Indian woman. Free delivery above ₹1,950. All-India shipping.",
  keywords:
    "best hijab in india, buy hijabs online india, premium satin hijab, best jersey hijab india, chiffon hijab india, best abaya brand india, modest fashion india, soft jersey hijab india, hijab brand india, best hijab brand india, premium hijab online india",
  authors: [{ name: "Zayelle", url: "https://zayelle.in" }],
  creator: "Zayelle",
  publisher: "Zayelle",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    siteName: "Zayelle",
    locale: "en_IN",
    type: "website",
  },
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

async function getVerificationCodes() {
  try {
    const rows = await db.select().from(siteSettings).where(
      eq(siteSettings.key, "analytics_search_console_verification")
    );
    const mcRows = await db.select().from(siteSettings).where(
      eq(siteSettings.key, "analytics_merchant_center_verification")
    );
    return {
      searchConsole: rows[0]?.value ?? "",
      merchantCenter: mcRows[0]?.value ?? "",
    };
  } catch {
    return { searchConsole: "", merchantCenter: "" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { searchConsole, merchantCenter } = await getVerificationCodes();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {searchConsole && <meta name="google-site-verification" content={searchConsole} />}
        {merchantCenter && <meta name="google-merchant-center-site-verification" content={merchantCenter} />}
      </head>
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
          gtag('config', 'G-TDCQB6VNVW');
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
