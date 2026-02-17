const IMG_BASE =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images";

export interface Product {
  id: string;
  handle: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage: string;
  badge?: string;
  description: string;
  details: string[];
  category: string;
}

export const allProducts: Product[] = [
  {
    id: "1",
    handle: "noor-chiffon-hijab",
    name: "The Noor Chiffon Hijab",
    subtitle: "Soft matte chiffon",
    price: 899,
    compareAt: 1299,
    image: `${IMG_BASE}/0004D5A6-8E3A-47CC-A349-E6285D790B40-1.jpg`,
    hoverImage: `${IMG_BASE}/CC153F58-50F6-4831-9E6F-77ED80B2258D-2.jpg`,
    badge: "New",
    description:
      "Our bestselling Noor Chiffon Hijab is crafted from premium matte chiffon that drapes beautifully and stays in place all day. Lightweight, breathable, and perfect for every occasion.",
    details: [
      "Material: Premium Matte Chiffon",
      "Size: 180cm x 70cm",
      "Weight: Light",
      "Care: Hand wash cold, hang dry",
      "Includes: Matching hijab pins",
    ],
    category: "chiffon-hijabs",
  },
  {
    id: "2",
    handle: "amal-satin-silk",
    name: "The Amal Satin Silk",
    subtitle: "Luxury smooth finish",
    price: 1299,
    compareAt: 1799,
    image: `${IMG_BASE}/8DFDBCF5-DCA5-44D3-BCBF-64FA4C3D7AAD-3.jpg`,
    hoverImage: `${IMG_BASE}/0004D5A6-8E3A-47CC-A349-E6285D790B40-1.jpg`,
    badge: "New",
    description:
      "Indulge in the luxurious feel of The Amal Satin Silk hijab. This exquisite piece features a smooth, glossy finish that elevates any outfit with effortless elegance.",
    details: [
      "Material: Pure Satin Silk",
      "Size: 185cm x 75cm",
      "Weight: Medium",
      "Care: Dry clean recommended",
      "Includes: Silk storage pouch",
    ],
    category: "satin-silk-hijabs",
  },
  {
    id: "3",
    handle: "layla-everyday-wrap",
    name: "The Layla Everyday Wrap",
    subtitle: "Breathable premium jersey",
    price: 999,
    compareAt: 1399,
    image: `${IMG_BASE}/CC153F58-50F6-4831-9E6F-77ED80B2258D-2.jpg`,
    hoverImage: `${IMG_BASE}/0004D5A6-8E3A-47CC-A349-E6285D790B40-1.jpg`,
    description:
      "The Layla Everyday Wrap is your go-to for daily comfort. Made from premium stretchy jersey, it moulds perfectly around your face and stays put without pins.",
    details: [
      "Material: Premium Jersey Cotton Blend",
      "Size: 175cm x 65cm",
      "Weight: Medium",
      "Care: Machine washable",
      "Stretch: 4-way stretch",
    ],
    category: "premium-jersey-wraps",
  },
  {
    id: "4",
    handle: "zahra-occasion-hijab",
    name: "The Zahra Occasion Hijab",
    subtitle: "Elegant formal drape",
    price: 1499,
    compareAt: 2099,
    image: `${IMG_BASE}/IMG_2813web2-16.jpg`,
    hoverImage: `${IMG_BASE}/IMG_2750web2-17.jpg`,
    description:
      "Make a statement at your next event with The Zahra Occasion Hijab. Featuring a luxurious drape and elegant sheen, this is the perfect piece for formal occasions.",
    details: [
      "Material: Premium Georgette Blend",
      "Size: 190cm x 80cm",
      "Weight: Light-Medium",
      "Care: Dry clean only",
      "Includes: Premium gift box",
    ],
    category: "occasion-hijabs",
  },
  {
    id: "5",
    handle: "amira-modal-hijab",
    name: "The Amira Modal Hijab",
    subtitle: "Ultra-soft modal fabric",
    price: 1099,
    compareAt: 1599,
    image: `${IMG_BASE}/IMG_2750web2-17.jpg`,
    hoverImage: `${IMG_BASE}/BB6FE085-B878-48D5-BE73-1E76A890F71B-26.jpg`,
    badge: "New",
    description:
      "Experience unmatched softness with The Amira Modal Hijab. Made from sustainably sourced modal fabric, it feels incredibly gentle against your skin.",
    details: [
      "Material: Modal (Beechwood Fiber)",
      "Size: 180cm x 70cm",
      "Weight: Light",
      "Care: Hand wash cold",
      "Eco-friendly: Sustainably sourced",
    ],
    category: "chiffon-hijabs",
  },
  {
    id: "6",
    handle: "haya-linen-hijab",
    name: "The Haya Linen Hijab",
    subtitle: "Textured linen blend",
    price: 1199,
    compareAt: 1499,
    image: `${IMG_BASE}/BB6FE085-B878-48D5-BE73-1E76A890F71B-26.jpg`,
    hoverImage: `${IMG_BASE}/3F3F8F7A-903E-417F-9349-2C27005D1B74-27.jpg`,
    badge: "Sale",
    description:
      "The Haya Linen Hijab brings a beautiful textured look to your wardrobe. Its natural linen blend keeps you cool while adding a touch of effortless sophistication.",
    details: [
      "Material: Linen Cotton Blend",
      "Size: 180cm x 75cm",
      "Weight: Medium",
      "Care: Machine wash gentle cycle",
      "Texture: Natural linen weave",
    ],
    category: "everyday-essentials",
  },
  {
    id: "7",
    handle: "premium-undercap-beige",
    name: "Premium Undercap - Beige",
    subtitle: "Essential styling piece",
    price: 349,
    compareAt: 499,
    image: `${IMG_BASE}/3F3F8F7A-903E-417F-9349-2C27005D1B74-27.jpg`,
    hoverImage: `${IMG_BASE}/IMG_2750web2-17.jpg`,
    description:
      "Our Premium Undercap in Beige is the perfect base for any hijab style. Made from breathable cotton with a secure fit that stays comfortable all day.",
    details: [
      "Material: Stretchy Cotton Blend",
      "Size: One size fits most",
      "Weight: Ultra-light",
      "Care: Machine washable",
      "Closure: Pull-on",
    ],
    category: "accessories",
  },
  {
    id: "8",
    handle: "hijab-pin-set-gold",
    name: "Hijab Pin Set - Gold",
    subtitle: "Set of 12 premium pins",
    price: 249,
    compareAt: 399,
    image: `${IMG_BASE}/0004D5A6-8E3A-47CC-A349-E6285D790B40-1.jpg`,
    hoverImage: `${IMG_BASE}/CC153F58-50F6-4831-9E6F-77ED80B2258D-2.jpg`,
    description:
      "Complete your look with our Gold Hijab Pin Set. Each set contains 12 premium-quality, rust-resistant pins with a beautiful gold finish.",
    details: [
      "Material: Rust-resistant alloy, gold finish",
      "Quantity: 12 pins per set",
      "Type: Standard straight pins",
      "Safe: Rounded safety tips",
      "Includes: Velvet storage pouch",
    ],
    category: "accessories",
  },
];

export function getProductByHandle(handle: string): Product | undefined {
  return allProducts.find((p) => p.handle === handle);
}
