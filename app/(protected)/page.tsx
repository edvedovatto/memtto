"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { EntryCard } from "@/components/entry-card";
import { EmptyState } from "@/components/empty-state";
import { Dashboard } from "@/components/dashboard/dashboard";
import {
  searchEntries,
  getContexts,
  getFavorites,
  getArchivedEntries,
} from "@/lib/services/entries";
import type { Entry } from "@/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [contexts, setContexts] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [favScrolled, setFavScrolled] = useState(false);
  const [viewFilter, setViewFilter] = useState<"all" | "favorites" | "archived">("all");

  const isActive = query.length >= 2;

  const fetchEntries = useCallback(async () => {
    // View filter takes precedence
    if (viewFilter === "favorites") {
      setLoading(true);
      try {
        const results = await getFavorites();
        setEntries(results);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (viewFilter === "archived") {
      setLoading(true);
      try {
        const results = await getArchivedEntries();
        setEntries(results);
      } catch (err) {
        console.error("Failed to fetch archived:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isActive && context === "") {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchEntries({
        query: isActive ? query : undefined,
        context: context || undefined,
      });
      setEntries(results);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setLoading(false);
    }
  }, [query, context, isActive, viewFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const loadFavorites = useCallback(() => {
    getFavorites().then(setFavorites).catch(console.error);
  }, []);

  useEffect(() => {
    getContexts().then(setContexts).catch(console.error);
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    const handler = () => loadFavorites();
    window.addEventListener("favoritesChanged", handler);
    return () => window.removeEventListener("favoritesChanged", handler);
  }, [loadFavorites]);

  useEffect(() => {
    const reset = () => handleClear();
    window.addEventListener("resetSearch", reset);
    return () => window.removeEventListener("resetSearch", reset);
  });

  useEffect(() => {
    function handleTagSearch(e: Event) {
      const tag = (e as CustomEvent).detail;
      if (tag) {
        setQuery(tag);
        setContext("");
        setViewFilter("all");
      }
    }
    window.addEventListener("searchByTag", handleTagSearch);
    return () => window.removeEventListener("searchByTag", handleTagSearch);
  }, []);

  // Sidebar: select context
  useEffect(() => {
    function handleSelectContext(e: Event) {
      const ctx = (e as CustomEvent).detail;
      if (ctx) {
        setContext(ctx);
        setQuery("");
        setViewFilter("all");
      }
    }
    window.addEventListener("selectContext", handleSelectContext);
    return () => window.removeEventListener("selectContext", handleSelectContext);
  }, []);

  // Sidebar: select view (all / favorites / archived)
  useEffect(() => {
    function handleSelectView(e: Event) {
      const view = (e as CustomEvent).detail as "all" | "favorites" | "archived";
      if (view === "all") {
        handleClear();
      } else {
        setViewFilter(view);
        setQuery("");
        setContext("");
      }
    }
    window.addEventListener("selectView", handleSelectView);
    return () => window.removeEventListener("selectView", handleSelectView);
  }, []);

  function handleClear() {
    setQuery("");
    setContext("");
    setViewFilter("all");
    setEntries([]);
  }

  const showResults = isActive || context !== "" || viewFilter !== "all";

  return (
    <div className="relative flex flex-col min-h-[calc(100dvh-109px)] lg:min-h-screen">
      {/* Search container — centered when idle (mobile), top when active or desktop */}
      <div
        className={`relative z-10 flex w-full flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showResults ? "" : "flex-1 justify-center lg:flex-none lg:justify-start"
        }`}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          contexts={contexts}
          selectedContext={context}
          onContextChange={setContext}
          size={showResults ? "default" : "lg"}
          className="relative z-20 w-full max-w-[720px]"
        />

        {/* Mobile: Favorites strip — below search bar, only when idle */}
        {!showResults && favorites.length > 0 && (
          <div className="relative mt-4 w-full max-w-[720px] lg:hidden">
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
              onScroll={(e) => setFavScrolled(e.currentTarget.scrollLeft > 0)}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollBy({ left: e.deltaY, behavior: "smooth" });
                  e.preventDefault();
                }
              }}
            >
              {favorites.map((fav, index) => (
                <Link
                  key={fav.id}
                  href={`/entry/${fav.slug}`}
                  className="flex-shrink-0 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground fade-in-up"
                  style={{
                    opacity: 0,
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {fav.title}
                </Link>
              ))}
            </div>
            {/* Fade on edges */}
            {favScrolled && <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent" />}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
      </div>

      {/* Desktop: Dashboard — only when idle */}
      {!showResults && (
        <div className="hidden lg:block w-full mt-8">
          <Dashboard favorites={favorites} contexts={contexts} />
        </div>
      )}

      {/* Results area */}
      {showResults && (
        <div className="mx-auto mt-6 w-full max-w-[720px] fade-in-up">
          {loading ? (
            <div className="flex items-center justify-center gap-1.5 py-16">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot" style={{ animationDelay: "160ms" }} />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot" style={{ animationDelay: "320ms" }} />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8">
              {viewFilter === "favorites" ? (
                <EmptyState
                  icon={
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  }
                  title="No favorites yet"
                  description="Heart an entry to save it here."
                  actionLabel="Browse entries"
                  onAction={() => {
                    handleClear();
                    window.dispatchEvent(new CustomEvent("selectView", { detail: "all" }));
                  }}
                />
              ) : viewFilter === "archived" ? (
                <EmptyState
                  icon={
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  }
                  title="No archived entries"
                  description="Archived entries will appear here."
                />
              ) : (
                <EmptyState
                  icon={
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  }
                  title="No results found"
                  description="Try a different search term or filter."
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 fade-in-up">
                {viewFilter !== "all" && (
                  <span className="text-xs font-medium text-foreground/70 capitalize">
                    {viewFilter === "favorites" ? "Favorites" : "Archived"}
                  </span>
                )}
                <p className="text-xs text-muted-foreground/50">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="flex flex-col gap-6">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="fade-in-up"
                    style={{
                      opacity: 0,
                      animationDelay: `${index * 80}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <EntryCard entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
