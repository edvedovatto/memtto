"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Layers,
  Heart,
  Archive,
  Settings,
} from "lucide-react";
import { getContexts } from "@/lib/services/entries";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  handler: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [contexts, setContexts] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getContexts().then(setContexts).catch(() => {});
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setQuery("");
      setSelected(0);
    }, 200);
  }, []);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          close();
        } else {
          setOpen(true);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Focus input on open
  useEffect(() => {
    if (open && !closing) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, closing]);

  const navigate = useCallback(
    (path: string) => {
      close();
      if (pathname !== path) router.push(path);
    },
    [close, router, pathname]
  );

  const dispatch = useCallback(
    (event: string, detail?: string) => {
      close();
      if (pathname !== "/") router.push("/");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(event, detail ? { detail } : undefined)
        );
      }, 100);
    },
    [close, router, pathname]
  );

  const actions: Action[] = [
    {
      id: "new",
      label: "New entry",
      icon: <Plus className="h-4 w-4" />,
      handler: () => navigate("/new"),
    },
    {
      id: "all",
      label: "All entries",
      icon: <Layers className="h-4 w-4" />,
      handler: () => dispatch("selectView", "all"),
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="h-4 w-4" />,
      handler: () => dispatch("selectView", "favorites"),
    },
    {
      id: "archived",
      label: "Archived",
      icon: <Archive className="h-4 w-4" />,
      handler: () => dispatch("selectView", "archived"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      handler: () => navigate("/settings"),
    },
    ...contexts.map((ctx) => ({
      id: `ctx-${ctx}`,
      label: ctx,
      icon: <span className="flex h-4 w-4 items-center justify-center"><span className="h-2 w-2 rounded-full bg-accent/40" /></span>,
      handler: () => dispatch("selectContext", ctx),
    })),
  ];

  const filtered = query
    ? actions.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  // Reset selection when filter changes
  useEffect(() => {
    setSelected(0);
  }, [query]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      filtered[selected].handler();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-background/80 backdrop-blur-sm ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      onClick={close}
    >
      <div
        className={`mx-4 mt-[20vh] h-fit w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl ${closing ? "animate-scale-out" : "animate-scale-in"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground/40 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Actions */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground/50">
              No results
            </p>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                type="button"
                onClick={action.handler}
                onMouseEnter={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  i === selected
                    ? "bg-accent/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
