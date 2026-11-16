import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageReaction } from "./MessageReaction";
import type { ChatMessage } from "../../lib/messageData";

type MessageBubbleProps = {
  message: ChatMessage;
  onReact: (id: string, emoji: string) => void;
};

export function MessageBubble({
  message,
  onReact,
}: Readonly<MessageBubbleProps>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        message.outgoing ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "group relative max-w-[calc(100%-2.5rem)] sm:max-w-[85%]",
        )}
      >
        <div className="min-w-0">
          {message.image && (
            <a
              href={message.image.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open attached image ${message.image.name}`}
            >
              <Image
                unoptimized
                width={480}
                height={320}
                src={message.image.url}
                alt={message.image.name}
                className="mb-1 max-h-56 max-w-full rounded-lg border object-contain"
              />
            </a>
          )}
          {message.text && (
            <p
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs/relaxed wrap-break-word whitespace-pre-wrap",
                message.outgoing
                  ? "border-primary/20 bg-primary text-primary-foreground"
                  : "bg-card",
              )}
            >
              {message.text}
            </p>
          )}
        </div>
        {message.reactions.length > 0 && (
          <div
            className={cn(
              "absolute bottom-0 flex max-w-full translate-y-1/2 gap-1 overflow-x-auto rounded-full bg-card",
              message.outgoing ? "right-2" : "left-2",
            )}
          >
            {message.reactions.map((emoji) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="h-5 shrink-0 rounded-full px-1.5 text-[10px]"
                aria-pressed
                aria-label={`Remove ${emoji} reaction`}
                onClick={() => onReact(message.id, emoji)}
              >
                {emoji} 1
              </Button>
            ))}
          </div>
        )}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            message.outgoing ? "right-full pr-2" : "left-full pl-2",
          )}
        >
          <MessageReaction
            outgoing={message.outgoing}
            onReact={(emoji) => onReact(message.id, emoji)}
          />
        </div>
      </div>
      <span
        className={cn(
          "text-[10px] text-muted-foreground",
          message.reactions.length > 0 && "mt-3",
        )}
      >
        {message.time}
      </span>
    </div>
  );
}
