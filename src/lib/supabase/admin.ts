import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "trainerportal",
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
