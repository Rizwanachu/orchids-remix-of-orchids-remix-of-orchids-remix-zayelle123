import type { Metadata } from "next";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://zayelle.in";

type Props = { params: Promise<{ handle: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;

  try {
    const rows = await db
      .select({
        name: products.name,
        subtitle: products.subtitle,
        description: products.description,
        price: products.price,
        compareAt: products.compareAt,
        image: products.image,
        material: products.material,
        category: products.category,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(eq(products.handle, handle))
      .limit(1);

    const product = rows[0];

    if (!product) {
      return { alternates: { canonical: `${BASE_URL}/products/${handle}` } };
    }

    const title = `${product.name} | Buy Online India — Zayelle`;
    const descBase = product.description
      ? product.description.replace(/<[^>]*>/g, "").slice(0, 140)
      : product.subtitle || "";
    const material = product.material ? ` Made from ${product.material}.` : "";
    const description = `${product.name} — ${descBase}${material} Shop premium modest wear at Zayelle. Free delivery above ₹1,950. All-India shipping.`.slice(0, 160);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/products/${handle}`,
        type: "website",
        images: product.image
          ? [{ url: product.image, alt: product.name }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.image ? [product.image] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/products/${handle}`,
      },
      other: {
        "product:price:amount": String(product.price),
        "product:price:currency": "INR",
      },
    };
  } catch {
    return { alternates: { canonical: `${BASE_URL}/products/${handle}` } };
  }
}

export default async function ProductHandleLayout({ params, children }: Props) {
  const { handle } = await params;

  let productJsonLd: object | null = null;
  let breadcrumbJsonLd: object | null = null;

  try {
    const rows = await db
      .select({
        name: products.name,
        subtitle: products.subtitle,
        description: products.description,
        price: products.price,
        compareAt: products.compareAt,
        image: products.image,
        material: products.material,
        category: products.category,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(eq(products.handle, handle))
      .limit(1);

    const product = rows[0];

    if (product) {
      const inStock = (product.stockQuantity ?? 0) > 0;
      const descBase = product.description
        ? product.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : product.subtitle || "";

      const additionalProperty: object[] = [];
      if (product.material) {
        additionalProperty.push({
          "@type": "PropertyValue",
          name: "Material",
          value: product.material,
        });
      }
      if (product.category) {
        additionalProperty.push({
          "@type": "PropertyValue",
          name: "Category",
          value: product.category,
        });
      }

      productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: descBase || product.subtitle,
        sku: handle,
        image: product.image,
        brand: { "@type": "Brand", name: "Zayelle" },
        ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
        offers: {
          "@type": "Offer",
          url: `${BASE_URL}/products/${handle}`,
          priceCurrency: "INR",
          price: product.price,
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "Zayelle" },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: "49",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "IN",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 3,
                maxValue: 7,
                unitCode: "DAY",
              },
            },
          },
        },
      };

      breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Products", item: `${BASE_URL}/products` },
          { "@type": "ListItem", position: 3, name: product.name, item: `${BASE_URL}/products/${handle}` },
        ],
      };
    }
  } catch {
    // Fail silently
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
