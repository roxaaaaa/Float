"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  async function sendMessage(content: string) {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreaming(true);

    const response = await fetch("/api/claude/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, history: messages.slice(-20) }),
    });

    if (!response.body) {
      setStreaming(false);
      return;
    }

    const assistantId = crypto.randomUUID();
    let assistantText = "";
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() }]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        const chunk = decoder.decode(result.value, { stream: true });
        chunk.split("\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            const payload = line.replace("data: ", "");
            if (payload === "[DONE]") return;
            assistantText += payload;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m)),
            );
          }
        });
      }
    }
    setStreaming(false);
  }

  return (
    <AppShell title="AI Chat" businessName="The Cobblestone Kitchen" monzoConnected>
      <div className="flex h-[calc(100vh-60px)] flex-col p-4 md:p-6">
        <div className="mb-3 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
          Using: 90 days transactions - 2 open invoices - latest balance - updated 2m ago
        </div>

        <Card className="flex-1 border-border/70 bg-card/60">
          <CardContent className="flex h-full flex-col gap-4 p-4">
            <ScrollArea className="h-[calc(100vh-280px)] pr-2">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="mx-auto mt-12 max-w-xl space-y-5 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Ask me anything about your business finances.</h2>
                    <p className="text-sm text-muted-foreground">
                      I have full access to your Monzo transactions, invoices, and cashflow data.
                    </p>
                    <SuggestedQuestions onPick={sendMessage} />
                  </div>
                ) : (
                  messages.map((m) => <ChatMessage key={m.id} role={m.role} content={m.content} createdAt={m.created_at} />)
                )}
              </div>
            </ScrollArea>
            <div className="space-y-2">
              <ChatInput onSend={sendMessage} disabled={streaming} />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
                  Clear conversation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
