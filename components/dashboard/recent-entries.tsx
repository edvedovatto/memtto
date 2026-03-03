"use client";

import { EntryCard } from "@/components/entry-card";
import { EmptyState } from "@/components/empty-state";
import type { Entry } from "@/types";

interface RecentEntriesProps {
  entries: Entry[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent
      </h2>
      {entries.length === 0 ? (
        <EmptyState
          icon={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
              <line x1="8" y1="18" x2="12" y2="18" />
            </svg>
          }
          title="No entries yet"
          description="Start capturing your thoughts and ideas."
          actionLabel="Create your first entry"
          actionHref="/new"
          compact
        />
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="fade-in-up"
              style={{
                opacity: 0,
                animationDelay: `${index * 60}ms`,
                animationFillMode: "forwards",
              }}
            >
              <EntryCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
