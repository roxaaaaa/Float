"use client";

import { Bell, Command, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[60px] border-b border-border/60 bg-background/80 backdrop-blur-sm lg:left-[240px]">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Live
          </Badge>
        </div>

        <button
          className="relative hidden w-[360px] items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary md:flex"
          onClick={() => router.push("/chat")}
        >
          <span className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Ask Float anything...
          </span>
          <span className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px]">
            <Command className="h-3 w-3" />
            K
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
