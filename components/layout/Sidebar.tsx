"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BellRing, MessageSquare, Phone, Siren, FileText, Settings, RefreshCw } from "lucide-react";

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
    <aside className="fixed left-0 top-0 z-30 h-screen w-[240px] border-r border-border/40 bg-[#0a101a] px-4 py-5">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/30" />
          <p className="text-xl font-semibold">Float</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{businessName}</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href.includes("#") && pathname === "/dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 space-y-3">
        <Badge variant={monzoConnected ? "success" : "destructive"} className="w-full justify-center">
          {monzoConnected ? "Monzo Connected" : "Reconnect Monzo"}
        </Badge>
        <div className="rounded-lg border border-border/70 bg-card p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Synced 2m ago</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
