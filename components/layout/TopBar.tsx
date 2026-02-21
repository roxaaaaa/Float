"use client";

import { Bell, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="fixed left-[240px] right-0 top-0 z-20 h-[60px] border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-lg font-semibold">{title}</h1>

        <button
          className="relative hidden w-[360px] items-center justify-start rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex"
          onClick={() => router.push("/chat")}
        >
          <Search className="mr-2 h-4 w-4" />
          Ask Float anything...
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
