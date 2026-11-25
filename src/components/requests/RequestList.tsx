"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { RequestCard } from "@/components/requests/RequestCard";
import { compareRequestExpiry, type RequestSummary } from "@/lib/requestTypes";

interface RequestListProps {
  requests: readonly RequestSummary[];
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

const visibleLimit = 3;

export function RequestList({
  requests,
  now,
  onMakeOffer,
}: Readonly<RequestListProps>) {
  // Derive the visible list from the sorted requests and the user's disclosure choice.
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const ordered = requests.toSorted(compareRequestExpiry);
  const remaining = ordered.length - visibleLimit;
  const visible = showAll ? ordered : ordered.slice(0, visibleLimit);

  return (
    <ul
      id={listId}
      aria-label="Requests for this vehicle"
      className="requests-list"
    >
      {visible.map((request, index) => (
        <li
          key={request.id}
          data-last-visible={index === visible.length - 1}
          className="requests-list-item relative pt-2 pl-6"
        >
          {/* The trunk and elbow are decorative. The list provides the accessible grouping. */}
          <span aria-hidden="true" className="requests-card-trunk" />
          <span aria-hidden="true" className="requests-card-elbow" />
          <RequestCard request={request} now={now} onMakeOffer={onMakeOffer} />

          {/* Keep the control before the extra cards in tab order without adding a list item. */}
          {remaining > 0 && index === visibleLimit - 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-muted-foreground"
              aria-controls={listId}
              aria-expanded={showAll}
              onClick={() => setShowAll((open) => !open)}
            >
              {showAll ? "Show less" : `Show ${remaining} more`}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
