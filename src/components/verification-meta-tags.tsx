import { db } from "@/../server/db";
import { siteSettings } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export default async function VerificationMetaTags() {
  try {
    const [scRows, mcRows] = await Promise.all([
      db.select().from(siteSettings).where(eq(siteSettings.key, "analytics_search_console_verification")),
      db.select().from(siteSettings).where(eq(siteSettings.key, "analytics_merchant_center_verification")),
    ]);
    const searchConsole = scRows[0]?.value ?? "";
    const merchantCenter = mcRows[0]?.value ?? "";
    return (
      <>
        {searchConsole && <meta name="google-site-verification" content={searchConsole} />}
        {merchantCenter && <meta name="google-merchant-center-site-verification" content={merchantCenter} />}
      </>
    );
  } catch {
    return null;
  }
}
