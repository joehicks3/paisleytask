import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createQuickCaptureHandler, insertForCaptureUser } from "@/lib/quickCapture.mjs";

export const runtime = "nodejs";

export const POST = createQuickCaptureHandler({
  getConfig: () => ({
    digest: process.env.QUICK_CAPTURE_TOKEN_SHA256,
    userId: process.env.QUICK_CAPTURE_USER_ID,
    email: process.env.QUICK_CAPTURE_USER_EMAIL,
    password: process.env.QUICK_CAPTURE_USER_PASSWORD,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }),
  insert: async (config: Parameters<typeof insertForCaptureUser>[1], title: string) => {
    await insertForCaptureUser(createClient, config, title);
    // A cache invalidation failure must not turn a successful insert into a retry.
    try { revalidatePath("/"); } catch { /* Next request will reload uncached tasks. */ }
  },
});
