"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({ onSend, disabled }: { onSend: (message: string) => void; disabled?: boolean }) {
  const [message, setMessage] = useState("");

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask Float anything..."
        className="min-h-[64px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!disabled && message.trim()) {
              onSend(message.trim());
              setMessage("");
            }
          }
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Enter to send - Shift+Enter new line - {message.length}/1200
        </span>
        <Button
          disabled={disabled || !message.trim()}
          onClick={() => {
            onSend(message.trim());
            setMessage("");
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
