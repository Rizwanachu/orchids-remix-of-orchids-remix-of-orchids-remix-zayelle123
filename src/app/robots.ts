import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/order-confirmed",
          "/letsgetsuccessin2026/",
          "/api/admin/",
          "/api/auth/",
          "/api/orders",
          "/api/razorpay/",
          "/api/cron/",
          "/api/checkout/",
          "/api/contact",
          "/api/media/",
          "/api/test-email",
          "/api/coupons",
          "/api/reviews",
        ],
      },
    ],
    sitemap: "https://zayelle.in/sitemap.xml",
  };
}
