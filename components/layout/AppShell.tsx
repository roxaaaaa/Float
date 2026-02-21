import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({
  title,
  businessName,
  monzoConnected,
  children,
}: {
  title: string;
  businessName?: string;
  monzoConnected?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar businessName={businessName} monzoConnected={monzoConnected} />
      <TopBar title={title} />
      <main className="ml-[240px] pt-[60px]">{children}</main>
    </div>
  );
}
