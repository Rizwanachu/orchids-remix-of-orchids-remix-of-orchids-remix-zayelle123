import { db } from "../../server/db";
import { adminActivityLogs } from "../../shared/schema";

export async function logAdminActivity(adminId: number | null, adminEmail: string | null, action: string, details?: string) {
  try {
    await db.insert(adminActivityLogs).values({
      adminId,
      adminEmail,
      action,
      details,
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
  }
}
