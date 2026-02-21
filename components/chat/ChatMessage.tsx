import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ChatMessage({
  role,
  content,
  createdAt,
}: {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}) {
  const user = role === "user";
  return (
    <div className={cn("flex w-full gap-3", user ? "justify-end" : "justify-start")}>
      {!user && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>F</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
          user ? "rounded-br-md border-primary/50 bg-primary text-primary-foreground" : "rounded-bl-md border-border/70 bg-card/90",
        )}
      >
        <p>{content}</p>
        <p className={cn("mt-2 text-[10px]", user ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {new Date(createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
