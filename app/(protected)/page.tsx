"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/search-bar";
import { EntryCard } from "@/components/entry-card";
import { searchEntries, getContexts } from "@/lib/services/entries";
import type { Entry } from "@/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [contexts, setContexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    getContexts().then(setContexts).catch(console.error);
  }, []);

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
    <div className="relative flex flex-col" style={{ minHeight: "calc(100vh - 105px)" }}>
      {/* Search container — centered when idle, top when active */}
      <div
        className={`flex w-full flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
