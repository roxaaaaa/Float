import { redirect } from "next/navigation";

import { getViewerAndAccount } from "@/lib/data";

export default async function HomePage() {
  const { account } = await getViewerAndAccount();
  if (account.onboarding_complete) {
    redirect("/dashboard");
  }
  redirect("/onboarding");
}
