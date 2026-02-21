import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockAccount } from "@/lib/mockData";

export async function requireAccountId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return mockAccount.id as string;

  const admin = createAdminClient();
  const { data: account } = await admin.from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  return (account?.id as string) ?? (mockAccount.id as string);
}
