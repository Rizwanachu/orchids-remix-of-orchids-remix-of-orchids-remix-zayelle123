import { db } from "./server/db";
import { products } from "./shared/schema";

async function seedProducts() {
  console.log("Seeding products...");
  
  try {
    await db.insert(products).values([
      {
        handle: "classic-white-tee",
        name: "Classic White Tee",
        subtitle: "Essentials",
        price: "35",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
        description: "A timeless essential crafted from 100% organic cotton.",
        details: ["100% Organic Cotton", "Pre-shrunk", "Made in Portugal"],
        category: "essentials",
      },
      {
        handle: "denim-jacket",
        name: "Vintage Denim Jacket",
        subtitle: "Outerwear",
        price: "120",
        image: "https://images.unsplash.com/photo-1576871333021-475f4a15ebb9?q=80&w=1000&auto=format&fit=crop",
        hoverImage: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000&auto=format&fit=crop",
        description: "Classic fit denim jacket with a vintage wash.",
        details: ["Heavyweight Denim", "Metal Buttons", "Reinforced Stitching"],
        category: "outerwear",
      },
    ]).onConflictDoNothing();
    
    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
  
  process.exit(0);
}

seedProducts();
