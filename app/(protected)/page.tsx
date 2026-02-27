"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { EntryCard } from "@/components/entry-card";
import { searchEntries, getContexts, getFavorites } from "@/lib/services/entries";
import type { Entry } from "@/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [contexts, setContexts] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [favScrolled, setFavScrolled] = useState(false);

  const isActive = query.length >= 2;

  const fetchEntries = useCallback(async () => {
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
  }, [query, context, isActive]);

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
      }
    }
    window.addEventListener("searchByTag", handleTagSearch);
    return () => window.removeEventListener("searchByTag", handleTagSearch);
  }, []);

  function handleClear() {
    setQuery("");
    setContext("");
    setEntries([]);
  }

  const showResults = isActive || context !== "";

  return (
    <div className="relative flex flex-col" style={{ minHeight: "calc(100dvh - 109px)" }}>
      {/* Search container — centered when idle, top when active */}
      <div
        className={`relative z-10 flex w-full flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showResults ? "" : "flex-1 justify-center"
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
          className="w-full max-w-[720px]"
        />

        {/* Favorites strip — below search bar, only when idle */}
        {!showResults && favorites.length > 0 && (
          <div className="relative mt-4 w-full max-w-[720px] fade-in-up">
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
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/entry/${fav.slug}`}
                  className="flex-shrink-0 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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

      {/* Results area */}
      {showResults && (
        <div className="mx-auto mt-6 w-full max-w-[720px] fade-in-up">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground/60">
              Searching...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center fade-in-up">
              <p className="text-sm text-muted-foreground/60">
                No results found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground/50 fade-in-up">
                {entries.length} {entries.length === 1 ? "result" : "results"}
              </p>
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
