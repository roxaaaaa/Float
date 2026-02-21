import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAccountId } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invoices")
    .select("*")
    .eq("account_id", accountId)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: data ?? [] });
}

const updateInvoiceContactSchema = z.object({
  invoice_id: z.string().uuid(),
  client_name: z.string().min(1),
  client_phone: z.string().min(6),
});

export async function PATCH(request: NextRequest) {
  const rawBody = await request.json();
  const parsedBody = updateInvoiceContactSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const accountId = await requireAccountId();
  const admin = createAdminClient();
  const body = parsedBody.data;

  const { data, error } = await admin
    .from("invoices")
    .update({
      client_name: body.client_name.trim(),
      client_phone: body.client_phone.trim(),
    })
    .eq("id", body.invoice_id)
    .eq("account_id", accountId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}
