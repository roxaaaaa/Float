"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronRight, FileText, MessageSquare, Phone, RefreshCw, Settings, Siren } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/incidents", label: "Incidents", icon: Siren },
  { href: "/dashboard#invoices", label: "Invoices", icon: FileText },
  { href: "#", label: "Settings", icon: Settings },
];

export function Sidebar({ businessName = "My Business", monzoConnected = false }: { businessName?: string; monzoConnected?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col border-r border-sidebar-border bg-[hsl(var(--sidebar))] lg:flex">
      <div className="px-4 pb-4 pt-5">
        <div className="rounded-xl border border-border/60 bg-card/30 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-semibold text-primary">
              F
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">Float</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">AI CFO Console</p>
            </div>
          </div>
          <p className="mt-3 truncate text-xs text-muted-foreground">{businessName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href.includes("#") && pathname === "/dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.35)] hover:bg-primary/90 hover:text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              <ChevronRight className={cn("ml-auto h-3.5 w-3.5 opacity-0 transition-opacity", active && "opacity-80")} />
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
        <Badge variant={monzoConnected ? "success" : "destructive"} className="w-full justify-center">
          {monzoConnected ? "Monzo Connected" : "Reconnect Monzo"}
        </Badge>
        <div className="rounded-lg border border-border/70 bg-card/50 p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Synced 2m ago</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
