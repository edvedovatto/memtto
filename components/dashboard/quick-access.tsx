"use client";

import Link from "next/link";
import type { Entry, TagCount } from "@/types";

interface QuickAccessProps {
  favorites: Entry[];
  topTags: TagCount[];
}

export function QuickAccess({ favorites, topTags }: QuickAccessProps) {
  function handleTagClick(tag: string) {
    window.dispatchEvent(new CustomEvent("searchByTag", { detail: tag }));
  }

  function handleViewAllFavorites() {
    window.dispatchEvent(new CustomEvent("selectView", { detail: "favorites" }));
  }

  return (
    <div className="space-y-6">
      {/* Favoritos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Favorites
          </h2>
          {favorites.length > 0 && (
            <button
              onClick={handleViewAllFavorites}
              className="text-xs text-accent hover:underline"
            >
              View all
            </button>
          )}
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground/50">No favorites yet. Heart an entry to see it here.</p>
        ) : (
          <div className="space-y-1.5">
            {favorites.slice(0, 6).map((fav) => (
              <Link
                key={fav.id}
                href={`/entry/${fav.slug}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-hover"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-accent/60">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="truncate">{fav.title}</span>
                <span className="ml-auto flex-shrink-0 text-xs text-muted-foreground/50">
                  {fav.context}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Top tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => handleTagClick(t.tag)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
              >
                #{t.tag}
                <span className="ml-1 text-muted-foreground/40">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
