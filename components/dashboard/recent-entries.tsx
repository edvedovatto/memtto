"use client";

import Link from "next/link";
import { EntryCard } from "@/components/entry-card";
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
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted-foreground/60">No entries yet.</p>
          <Link
            href="/new"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Create your first entry
          </Link>
        </div>
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
