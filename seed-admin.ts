import { db } from "./server/db";
import { users } from "./shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  const email = "admin@example.com";
  const password = "adminpassword123";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Seeding admin user...");
  
  try {
    await db.insert(users).values({
      name: "Admin User",
      email: email,
      password: hashedPassword,
      role: "admin",
    }).onConflictDoNothing();
    
    console.log("Admin user seeded successfully!");
    console.log("Email: " + email);
    console.log("Password: " + password);
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
  
  process.exit(0);
}

seed();
