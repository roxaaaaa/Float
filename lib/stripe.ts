import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeClient;
}

export async function createStripePaymentLink({
  invoiceId,
  clientName,
  invoiceNumber,
  amountPence,
}: {
  invoiceId: string;
  clientName: string;
  invoiceNumber: string;
  amountPence: number;
}) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      url: `https://pay.stripe.com/mock/${invoiceId}`,
      payment_intent_id: `pi_mock_${invoiceId.replace(/-/g, "")}`,
    };
  }

  const product = await stripe.products.create({
    name: `Invoice ${invoiceNumber} - ${clientName}`,
    metadata: { invoice_id: invoiceId },
  });

  const price = await stripe.prices.create({
    unit_amount: amountPence,
    currency: "gbp",
    product: product.id,
  });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoice_id: invoiceId },
  });

  return {
    url: link.url,
    payment_intent_id: null,
  };
}

export function verifyStripeSignature(rawBody: string, signature: string | null) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !signature) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}
