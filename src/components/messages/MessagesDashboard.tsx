"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/badge";
import { TableSearch } from "@/components/TableSearch";
import { sampleCrew } from "@/lib/crewData";
import { cn } from "@/lib/utils";
import { MessageReaction } from "./MessageReaction";
type ChatMessage = {
  id: string;
  driverId: string;
  text: string;
  outgoing: boolean;
  time: string;
  reactions: string[];
};
const suggestions = [
  "Ano na ang ETA mo?",
  "Paki-send ng POD photo pagdating.",
  "May bagong booking ka sa app.",
  "Ingat sa biyahe.",
];
/*TAKE_NOTE: MOCK UP */
const initialMessages: ChatMessage[] = [
  {
    id: "a1",
    driverId: "arnel",
    text: "Arnel, may pickup ka sa Valenzuela Gateway after lunch. 6 pallets.",
    outgoing: true,
    time: "Nov 9, 8:21 PM",
    reactions: [],
  },
  {
    id: "a2",
    driverId: "arnel",
    text: "Noted po boss. Papunta na.",
    outgoing: false,
    time: "Nov 9, 9:27 PM",
    reactions: [],
  },
  {
    id: "r1",
    driverId: "rodel",
    text: "Copy. Ingat sa NLEX.",
    outgoing: true,
    time: "Nov 9, 7:15 PM",
    reactions: [],
  },
  {
    id: "m1",
    driverId: "mark",
    text: "Nandito na po sa Kapitolyo, naglo-load na.",
    outgoing: false,
    time: "Nov 9, 6:30 PM",
    reactions: [],
  },
];
const drivers = sampleCrew.filter((person) => person.role === "Driver");
type MessageBubbleProps = {
  message: ChatMessage;
  onReact: (id: string, emoji: string) => void;
};
function MessageBubble({ message, onReact }: Readonly<MessageBubbleProps>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        message.outgoing ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "flex max-w-[95%] items-center gap-1",
          message.outgoing && "flex-row-reverse",
        )}
      >
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs/relaxed wrap-break-word whitespace-pre-wrap",
            message.outgoing
              ? "border-primary/20 bg-primary text-primary-foreground"
              : "bg-card",
          )}
        >
          {message.text}
        </p>
        <MessageReaction onReact={(emoji) => onReact(message.id, emoji)} />
      </div>
      <span className="text-[10px] text-muted-foreground">{message.time}</span>
      <div className="flex gap-1">
        {message.reactions.map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            aria-pressed
            aria-label={`Remove ${emoji} reaction`}
            onClick={() => onReact(message.id, emoji)}
          >
            {emoji} 1
          </Button>
        ))}
      </div>
    </div>
  );
}
export function MessagesDashboard() {
  const [active, setActive] = useState("arnel");
  const [showChat, setShowChat] = useState(false);
  const [query, setQuery] = useState("");
  /*TAKE_NOTE: MOCK UP */
  const [messages, setMessages] = useState(initialMessages);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const driver = drivers.find((person) => person.id === active)!;
  const thread = messages.filter((message) => message.driverId === active);
  const draft = drafts[active] ?? "";
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, active]);
  /*TAKE_NOTE: MOCK UP */
  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        driverId: active,
        text,
        outgoing: true,
        time: new Intl.DateTimeFormat("en-PH", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        }).format(new Date()),
        reactions: [],
      },
    ]);
    setDrafts((current) => ({ ...current, [active]: "" }));
  }
  /*TAKE_NOTE: MOCK UP */
  function reactToMessage(id: string, emoji: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              reactions: message.reactions.includes(emoji)
                ? message.reactions.filter((item) => item !== emoji)
                : [...message.reactions, emoji],
            }
          : message,
      ),
    );
  }
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Chat with drivers on the FastMet driver app.
        </p>
      </header>
      <div className="flex h-[calc(100dvh-13rem)] min-h-110 overflow-hidden rounded-lg border bg-card">
        {/* ------ Driver conversations --------- */}
        <aside
          aria-label="Driver conversations"
          className={cn(
            "w-full shrink-0 flex-col border-r md:flex md:w-64",
            showChat ? "hidden" : "flex",
          )}
        >
          <div className="border-b p-3">
            <TableSearch
              label="Search drivers"
              placeholder="Search drivers…"
              value={query}
              onValueChange={setQuery}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-1.5">
            {drivers
              .filter((person) =>
                person.name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((person) => {
                const last = messages.findLast(
                  (message) => message.driverId === person.id,
                );
                let preview = "No messages yet";
                if (last) {
                  const prefix = last.outgoing ? "You: " : "";
                  preview = prefix + last.text;
                }
                return (
                  <button
                    key={person.id}
                    type="button"
                    aria-pressed={active === person.id}
                    onClick={() => {
                      setActive(person.id);
                      setShowChat(true);
                    }}
                    className={cn(
                      "mb-1 w-full rounded-md p-3 text-left hover:bg-muted",
                      active === person.id && "bg-primary/10",
                    )}
                  >
                    <p className="text-xs font-medium">{person.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {preview}
                    </p>
                  </button>
                );
              })}
          </div>
        </aside>
        {/* ------ Active conversation --------- */}
        <section
          aria-label={`Conversation with ${driver.name}`}
          className={cn(
            "min-w-0 flex-1 flex-col",
            showChat ? "flex" : "hidden md:flex",
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-2">
              <Button
                className="md:hidden"
                variant="ghost"
                size="icon"
                aria-label="Back to conversations"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft />
              </Button>
              <div>
                <h2 className="text-sm font-medium">{driver.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {driver.vehicle || "Reliever"} · {driver.phone}
                </p>
              </div>
            </div>
            <Badge variant="outline">{driver.status}</Badge>
          </header>
          <div
            role="log"
            aria-label="Messages"
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-muted/20 p-4"
          >
            {thread.length ? (
              thread.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onReact={reactToMessage}
                />
              ))
            ) : (
              <p className="m-auto text-xs text-muted-foreground">
                Start a conversation with {driver.name.split(" ")[0]}.
              </p>
            )}
            <div ref={end} />
          </div>
          {/* ------ Suggested replies and composer --------- */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="shrink-0 space-y-3 border-t p-3"
          >
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
                  className="shrink-0 rounded-full font-normal"
                  onClick={() => {
                    setDrafts((current) => ({ ...current, [active]: text }));
                    input.current?.focus();
                  }}
                >
                  {text}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Textarea
                ref={input}
                aria-label={`Message ${driver.name}`}
                placeholder={`Message ${driver.name.split(" ")[0]}…`}
                value={draft}
                maxLength={4000}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [active]: event.target.value,
                  }))
                }
                className="min-h-24 max-h-40 resize-none pb-12"
              />
              <Button
                type="submit"
                className="absolute right-2 bottom-2"
                disabled={!draft.trim()}
              >
                <Send />
                Send
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Preview only. Messages and reactions stay in this session and are
              not sent to drivers.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
