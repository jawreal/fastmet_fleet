"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConversationList } from "./ConversationList";
import { sampleCrew } from "@/lib/crewData";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { initialMessages } from "../../lib/messageData";
const drivers = sampleCrew.filter((person) => person.role === "Driver");

export function MessagesDashboard() {
  const [active, setActive] = useState("arnel");
  const [showChat, setShowChat] = useState(false);
  const [query, setQuery] = useState("");
  /*TAKE_NOTE: MOCK UP */
  const [messages, setMessages] = useState(initialMessages);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const end = useRef<HTMLDivElement>(null);
  const driver = drivers.find((person) => person.id === active)!;
  const thread = messages.filter((message) => message.driverId === active);
  const draft = drafts[active] ?? "";

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, active]);

  /*TAKE_NOTE: MOCK UP */
  function sendMessage(image?: { name: string; url: string }) {
    const text = draft.trim();
    if (!text && !image) return;
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
        image,
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
        <ConversationList
          drivers={drivers}
          messages={messages}
          active={active}
          showChat={showChat}
          query={query}
          setQuery={setQuery}
          onSelect={(id) => {
            setActive(id);
            setShowChat(true);
          }}
        />
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
          <MessageComposer
            key={active}
            name={driver.name}
            draft={draft}
            onDraftChange={(value) =>
              setDrafts((current) => ({ ...current, [active]: value }))
            }
            onSend={sendMessage}
          />
        </section>
      </div>
    </div>
  );
}
