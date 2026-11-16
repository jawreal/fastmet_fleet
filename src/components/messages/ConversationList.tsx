import { TableSearch } from "@/components/TableSearch";
import type { CrewMember } from "@/lib/crewData";
import type { ChatMessage } from "../../lib/messageData";
import { cn } from "@/lib/utils";
type ConversationListProps = {
  drivers: CrewMember[];
  messages: ChatMessage[];
  active: string;
  showChat: boolean;
  query: string;
  setQuery: (value: string) => void;
  onSelect: (id: string) => void;
};
export function ConversationList({
  drivers,
  messages,
  active,
  showChat,
  query,
  setQuery,
  onSelect,
}: Readonly<ConversationListProps>) {
  return (
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
                  onSelect(person.id);
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
  );
}
