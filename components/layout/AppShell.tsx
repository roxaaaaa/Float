import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, MessageSquare, Phone, Siren } from "lucide-react";

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
    <div className="min-h-screen page-reveal">
      <Sidebar businessName={businessName} monzoConnected={monzoConnected} />
      <TopBar title={title} />
      <main className="pb-16 pt-[60px] lg:ml-[240px] lg:pb-0">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-border bg-background/90 px-2 py-2 backdrop-blur lg:hidden">
        <Link className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground" href="/dashboard">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground" href="/chat">
          <MessageSquare className="h-4 w-4" />
          Chat
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground" href="/calls">
          <Phone className="h-4 w-4" />
          Calls
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground" href="/incidents">
          <Siren className="h-4 w-4" />
          Incidents
        </Link>
      </nav>
    </div>
  );
}
