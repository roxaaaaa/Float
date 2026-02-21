import { NextRequest, NextResponse } from "next/server";

import { exchangeMonzoCode, fetchMonzoAccounts } from "@/lib/monzo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/onboarding?error=${encodeURIComponent(error)}`, request.url));
  }

  const supabase = createServerClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signInAnonymously();
  }
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.redirect(new URL("/onboarding?error=no_user", request.url));
  }

  const tokenPayload = code && process.env.MONZO_CLIENT_ID ? await exchangeMonzoCode(code) : null;

  let monzoAccountId = "demo_account_id";
  if (tokenPayload?.access_token) {
    const accounts = await fetchMonzoAccounts(tokenPayload.access_token);
    monzoAccountId = accounts[0]?.id ?? monzoAccountId;
  }

  await admin.from("accounts").upsert({
    user_id: currentUser.id,
    monzo_access_token: tokenPayload?.access_token ?? "demo_token",
    monzo_refresh_token: tokenPayload?.refresh_token ?? "demo_refresh",
    monzo_account_id: monzoAccountId,
    monzo_connected: true,
    onboarding_complete: false,
    business_name: "My Business",
  });

  return NextResponse.redirect(new URL("/onboarding?step=syncing", request.url));
}
