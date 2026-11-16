"use client";
import { useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
type MessageReactionProps = {
  outgoing: boolean;
  onReact: (emoji: string) => void;
};

const pickerStyle = {
  "--epr-bg-color": "var(--popover)",
  "--epr-category-label-bg-color": "var(--popover)",
  "--epr-text-color": "var(--foreground)",
  "--epr-search-input-bg-color": "var(--muted)",
  "--epr-search-input-bg-color-active": "var(--muted)",
  "--epr-search-input-text-color": "var(--foreground)",
  "--epr-search-input-placeholder-color": "var(--muted-foreground)",
  "--epr-picker-border-color": "transparent",
  "--epr-highlight-color": "var(--primary)",
  "--epr-hover-bg-color": "var(--accent)",
  "--epr-focus-bg-color": "var(--accent)",
  "--epr-category-icon-active-color": "var(--foreground)",
  "--epr-category-icon-color": "var(--muted-foreground)",
  "--epr-search-border-color": "var(--input)",
  "--epr-search-border-color-active": "var(--ring)",
  "--epr-preview-text-color": "var(--muted-foreground)",
  "--epr-emoji-size": "26px",
} as CSSProperties;

export function MessageReaction({
  outgoing,
  onReact,
}: Readonly<MessageReactionProps>) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Add reaction"
            className="rounded-full bg-card text-muted-foreground shadow-xs transition-opacity hover:text-foreground [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 aria-expanded:opacity-100"
          />
        }
      >
        <SmilePlus />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align={outgoing ? "end" : "start"}
        className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0"
      >
        <EmojiPicker
          colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
          style={pickerStyle}
          width={280}
          height={340}
          onEmojiClick={(data) => {
            onReact(data.emoji);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
