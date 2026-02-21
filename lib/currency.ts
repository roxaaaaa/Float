const FALLBACK_RATE = 1.17;

let cachedRate: { value: number; updatedAt: number } | null = null;

export async function getGbpToEurRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && now - cachedRate.updatedAt < 1000 * 60 * 60 * 6) {
    return cachedRate.value;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/GBP", { next: { revalidate: 21600 } });
    if (!response.ok) throw new Error("Failed to fetch FX rate");
    const data = (await response.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.EUR ?? FALLBACK_RATE;
    cachedRate = { value: rate, updatedAt: now };
    return rate;
  } catch {
    cachedRate = { value: FALLBACK_RATE, updatedAt: now };
    return FALLBACK_RATE;
  }
}

export async function penceToEurCents(pence: number): Promise<number> {
  const rate = await getGbpToEurRate();
  return Math.round(pence * rate);
}

export async function formatEurFromPence(pence: number): Promise<string> {
  const cents = await penceToEurCents(pence);
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
