"use client";

import { HelpCircleIcon, InboxIcon, PanelRightCloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RequestDetails } from "@/components/requests/RequestDetails";
import type { RequestSummary } from "@/lib/requestFixtures";
import type { RequestsState } from "@/lib/request-ui";

export type RequestsTab = "open" | "offers";
export type RequestsPanelProps = {
  state: RequestsState;
  requests: RequestSummary[];
  count: number;
  now: number | null;
  pulse: number;
  tab: RequestsTab;
  panelRef: React.RefObject<HTMLElement | null>;
  onCollapse: () => void;
  onMakeOffer: (request: RequestSummary) => void;
  onViewAll: () => void;
  onTabChange: (tab: RequestsTab) => void;
  onHowItWorks: () => void;
  onSimulate?: () => void;
};

export function RequestsPanel({
  state,
  requests,
  count,
  now,
  pulse,
  tab,
  panelRef,
  onCollapse,
  onMakeOffer,
  onViewAll,
  onTabChange,
  onHowItWorks,
  onSimulate,
}: Readonly<RequestsPanelProps>) {
  return (
    <aside
      id="requests-panel"
      ref={panelRef}
      tabIndex={-1}
      aria-label="Requests"
      className="requests-panel"
    >
      <div className="requests-header">
        <h2 className="text-sm font-semibold">Requests</h2>
        {/* The count never comes from the ten visible cards; it is an independent prop. */}
        {count > 0 && (
          <span
            key={pulse}
            className={`requests-count ${pulse ? "requests-pulse" : ""}`}
          >
            {count}
          </span>
        )}
        <Button
          className="ml-auto"
          variant="ghost"
          size="icon-sm"
          onClick={onCollapse}
          aria-label="Collapse requests"
          title="Collapse requests (Alt+Shift+Q)"
        >
          <PanelRightCloseIcon />
        </Button>
      </div>
      {state === "expanded" ? (
        // Phase two owns the table, filters, and pagination. Reserve only an empty workspace now.
        <div className="requests-scroll">
          <h3 className="text-sm font-medium mb-4">All requests</h3>
          <section
            aria-label="All requests placeholder"
            className="min-h-64 rounded-lg border border-dashed border-border"
          />
        </div>
      ) : (
        <>
          <div
            role="tablist"
            tabIndex={-1}
            aria-label="Request status"
            className="grid grid-cols-2 gap-1 border-b border-border p-2"
            onKeyDown={(event) => {
              // Both tabs support the standard arrow/Home/End keyboard interaction.
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              // Arrow keys switch tabs; Home and End select their fixed endpoints.
              let next: RequestsTab = tab === "open" ? "offers" : "open";
              if (event.key === "Home") {
                next = "open";
              } else if (event.key === "End") {
                next = "offers";
              }
              onTabChange(next);
              event.currentTarget
                .querySelector<HTMLButtonElement>(`#requests-tab-${next}`)
                ?.focus();
            }}
          >
            {(["open", "offers"] as const).map((value) => (
              <Button
                key={value}
                id={`requests-tab-${value}`}
                role="tab"
                aria-selected={tab === value}
                aria-controls={`requests-tabpanel-${value}`}
                tabIndex={tab === value ? 0 : -1}
                variant={tab === value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onTabChange(value)}
              >
                {value === "open" ? "Open" : "Offers sent"}
              </Button>
            ))}
          </div>
          <div
            id={`requests-tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`requests-tab-${tab}`}
            className="requests-scroll"
            tabIndex={0}
          >
            {tab === "offers" || count === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
                <InboxIcon
                  aria-hidden="true"
                  className="size-7 text-muted-foreground/40"
                />
                <p className="text-sm font-medium">
                  {tab === "offers" ? "No offers sent" : "No matching requests"}
                </p>
                <p className="text-xs text-muted-foreground max-w-56">
                  {tab === "offers"
                    ? "Requests you make an offer on will appear here."
                    : "New matching requests will appear here when available."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 10).map((request) => (
                  <article
                    key={request.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <RequestDetails
                      request={request}
                      now={now}
                      onMakeOffer={onMakeOffer}
                    />
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <Button className="w-full" variant="outline" onClick={onViewAll}>
              View all{count > 0 ? ` ${count} requests` : " requests"}
            </Button>
          </div>
        </>
      )}
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <Popover>
          <PopoverTrigger
            render={<Button variant="ghost" size="sm" onClick={onHowItWorks} />}
          >
            <HelpCircleIcon aria-hidden="true" />
            How it works
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="requests-flyout p-4"
          >
            <PopoverTitle>How requests work</PopoverTitle>
            <ol className="list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
              <li>Review the vehicle, route and pickup time.</li>
              <li>Make an offer before the request expires.</li>
              <li>Track your offers in Offers sent.</li>
            </ol>
          </PopoverContent>
        </Popover>
        {onSimulate && (
          <Button
            className="mr-12"
            variant="ghost"
            size="sm"
            onClick={onSimulate}
          >
            + New
          </Button>
        )}
      </div>
    </aside>
  );
}
