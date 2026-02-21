import { NextResponse } from "next/server";

import { buildMonzoAuthUrl } from "@/lib/monzo";

export async function GET() {
  const state = crypto.randomUUID();
  const url = buildMonzoAuthUrl(state);
  return NextResponse.redirect(url);
}
