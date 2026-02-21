import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";
import { extractInvoiceFromFile } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const accountId = await requireAccountId();
  const admin = createAdminClient();
  const path = `${accountId}/${Date.now()}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const base64 = Buffer.from(uint8).toString("base64");

  const upload = await admin.storage.from("invoice-uploads").upload(path, uint8, {
    contentType: file.type,
    upsert: true,
  });
  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const parsed = await extractInvoiceFromFile({
    mimeType: file.type || "application/pdf",
    base64Data: base64,
  });

  const { data: inserted, error: insertError } = await admin
    .from("invoices")
    .insert({
      account_id: accountId,
      client_name: parsed.client_name,
      client_email: parsed.client_email ?? null,
      client_phone: parsed.client_phone ?? null,
      invoice_number: parsed.invoice_number ?? null,
      amount: parsed.amount,
      invoice_date: parsed.invoice_date ?? null,
      due_date: parsed.due_date ?? null,
      status: "unpaid",
    })
    .select("*")
    .single();

  await admin.storage.from("invoice-uploads").remove([path]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: inserted, extracted: parsed });
}
