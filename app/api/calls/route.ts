import { NextResponse } from "next/server";

import { requireAccountId } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("calls")
    .select("*")
    .eq("account_id", accountId)
    .order("initiated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ calls: data ?? [] });
}
