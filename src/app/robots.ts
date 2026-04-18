import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/letsgetsuccessin2026/",
          "/api/",
          "/checkout",
          "/cart",
        ],
      },
    ],
    sitemap: "https://zayelle.in/sitemap.xml",
  };
}
