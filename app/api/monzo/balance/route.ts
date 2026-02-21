import { NextResponse } from "next/server";

import { fetchMonzoBalance } from "@/lib/monzo";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";

export async function GET() {
  const accountId = await requireAccountId();
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("accounts")
    .select("monzo_access_token, monzo_account_id")
    .eq("id", accountId)
    .maybeSingle();

  let balance = 620000;
  if (account?.monzo_access_token && account?.monzo_account_id) {
    const data = await fetchMonzoBalance(account.monzo_access_token, account.monzo_account_id).catch(() => ({ balance }));
    balance = data.balance;
  }

  await admin
    .from("accounts")
    .update({ latest_balance_pence: balance, last_synced_at: new Date().toISOString() })
    .eq("id", accountId);

  return NextResponse.json({ balance_pence: balance });
}
