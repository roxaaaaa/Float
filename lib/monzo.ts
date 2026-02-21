import { addDays } from "date-fns";

const MONZO_API = "https://api.monzo.com";

export function buildMonzoAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.MONZO_CLIENT_ID ?? "",
    redirect_uri: process.env.MONZO_REDIRECT_URI ?? "",
    response_type: "code",
    state,
  });
  return `${MONZO_API}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeMonzoCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.MONZO_CLIENT_ID ?? "",
    client_secret: process.env.MONZO_CLIENT_SECRET ?? "",
    redirect_uri: process.env.MONZO_REDIRECT_URI ?? "",
    code,
  });

  const response = await fetch(`${MONZO_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Monzo OAuth code");
  }

  return (await response.json()) as {
    access_token: string;
    refresh_token: string;
    user_id: string;
  };
}

export async function fetchMonzoAccounts(accessToken: string) {
  const response = await fetch(`${MONZO_API}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch Monzo accounts");
  const data = (await response.json()) as { accounts: Array<{ id: string; type: string }> };
  return data.accounts;
}

export async function fetchMonzoTransactions(accessToken: string, accountId: string) {
  const since = addDays(new Date(), -90).toISOString();
  const params = new URLSearchParams({
    account_id: accountId,
    since,
    "expand[]": "merchant",
  });
  const response = await fetch(`${MONZO_API}/transactions?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch Monzo transactions");
  const data = (await response.json()) as {
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      created: string;
      merchant?: { name?: string; category?: string };
    }>;
  };
  return data.transactions;
}

export async function fetchMonzoBalance(accessToken: string, accountId: string) {
  const response = await fetch(`${MONZO_API}/balance?account_id=${encodeURIComponent(accountId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch Monzo balance");
  return (await response.json()) as { balance: number; currency: string };
}

export function buildMockMonzoTransactions() {
  const now = Date.now();
  return Array.from({ length: 30 }).map((_, i) => {
    const income = i % 6 === 0;
    return {
      id: `mock_tx_${i}`,
      amount: income ? 120000 : -35000 - (i % 4) * 5000,
      description: income ? "Card revenue settlement" : "Supplier payment",
      created: new Date(now - i * 86400000).toISOString(),
      merchant: { name: income ? "Monzo Settlements" : "Supplier", category: income ? "income" : "supplies" },
    };
  });
}
