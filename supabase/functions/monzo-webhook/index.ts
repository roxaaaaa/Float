// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const serviceRole = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, serviceRole);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const payload = await req.json();

  const transaction = payload?.data?.transaction ?? payload?.transaction;
  const accountId = payload?.data?.account_id ?? payload?.account_id;
  if (!transaction || !accountId) return new Response("Missing transaction payload", { status: 400 });

  await supabase.from("transactions").upsert(
    {
      id: transaction.id,
      account_id: accountId,
      amount: transaction.amount,
      merchant_name: transaction.merchant?.name ?? null,
      category: transaction.merchant?.category ?? null,
      description: transaction.description ?? null,
      is_income: transaction.amount > 0,
      created: transaction.created ?? new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  const [{ data: account }, { data: recent }] = await Promise.all([
    supabase.from("accounts").select("*").eq("id", accountId).single(),
    supabase.from("transactions").select("*").eq("account_id", accountId).order("created", { ascending: false }).limit(30),
  ]);

  const dailyNet =
    (recent ?? []).reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) / Math.max(1, (recent ?? []).length);
  const nextBalance = (account?.latest_balance_pence ?? 0) + Math.round(dailyNet);

  await supabase.from("accounts").update({ latest_balance_pence: nextBalance, last_synced_at: new Date().toISOString() }).eq("id", accountId);

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
