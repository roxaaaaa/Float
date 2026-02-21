import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role";

  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
