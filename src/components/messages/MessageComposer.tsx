"use client";
import Image from "next/image";

import { useRef, useState } from "react";
import { Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import { readVehicleFile } from "@/lib/vehicleFileData";
import { suggestions } from "../../lib/messageData";

type ChatImage = { name: string; url: string };
type MessageComposerProps = {
  name: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (image?: ChatImage) => void;
};

export function MessageComposer({
  name,
  draft,
  onDraftChange,
  onSend,
}: Readonly<MessageComposerProps>) {
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<ChatImage>();
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const canSend = !reading && Boolean(draft.trim() || image);

  function send() {
    if (!canSend) return;
    onSend(image);
    setImage(undefined);
    input.current?.focus();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className="shrink-0 space-y-2.5 border-t bg-card p-3 sm:p-4"
    >
      {/* ------ Quick replies --------- */}
      <div
        aria-label="Suggested replies"
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {suggestions.map((text) => (
          <Button
            key={text}
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-md px-2.5 font-normal"
            onClick={() => {
              onDraftChange(text);
              input.current?.focus();
            }}
          >
            {text}
          </Button>
        ))}
      </div>
      {/* ------ Image attachment and composer --------- */}
      <div className="rounded-xl border bg-background p-2 transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
        {image && (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/50 p-2">
            <Image
              unoptimized
              width={480}
              height={320}
              src={image.url}
              alt="Attachment preview"
              className="size-10 rounded object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-xs">
              {image.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove attached image"
              onClick={() => setImage(undefined)}
            >
              <X />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            aria-label="Attach photo"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (!["image/jpeg", "image/png"].includes(file.type)) {
                setError("Choose a JPG or PNG image.");
                return;
              }
              setReading(true);
              setError("");
              try {
                const result = await readVehicleFile(file);
                setImage({ name: result.name, url: result.url });
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : "Image could not be read.",
                );
              } finally {
                setReading(false);
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={reading}
            aria-label="Attach image"
            title="Attach JPG or PNG image"
            onClick={() => fileInput.current?.click()}
          >
            <Plus />
          </Button>
          <Textarea
            ref={input}
            aria-label={`Message ${name}`}
            placeholder={`Message ${name.split(" ")[0]}…`}
            value={draft}
            maxLength={4000}
            rows={1}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                send();
              }
            }}
            className="min-h-7 max-h-32 flex-1 resize-none rounded-none border-0 bg-transparent px-0 py-1 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
          >
            <Send />
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">
        Enter to send · Shift+Enter for a new line. Preview only; nothing is
        sent to drivers.
      </p>
    </form>
  );
}
