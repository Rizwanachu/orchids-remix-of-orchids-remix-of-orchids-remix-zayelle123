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
          "/api/",
          "/letsgetsuccessin2026/",
        ],
      },
    ],
    sitemap: "https://zayelle.in/sitemap.xml",
  };
}
