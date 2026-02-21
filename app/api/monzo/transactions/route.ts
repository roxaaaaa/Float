import { NextResponse } from "next/server";

import { buildMockMonzoTransactions, fetchMonzoTransactions } from "@/lib/monzo";
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

  const monzoAccessToken = account?.monzo_access_token as string | undefined;
  const monzoAccountId = account?.monzo_account_id as string | undefined;

  const txs =
    monzoAccessToken && monzoAccountId
      ? await fetchMonzoTransactions(monzoAccessToken, monzoAccountId).catch(() => buildMockMonzoTransactions())
      : buildMockMonzoTransactions();

  const mapped = txs.map((tx) => ({
    id: tx.id,
    account_id: accountId,
    amount: tx.amount,
    merchant_name: tx.merchant?.name ?? null,
    category: tx.merchant?.category ?? null,
    description: tx.description ?? null,
    notes: null,
    is_income: tx.amount > 0,
    created: tx.created,
  }));

  const { error } = await admin.from("transactions").upsert(mapped, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: mapped.length });
}
