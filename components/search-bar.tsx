"use client";

import { Search, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  contexts?: string[];
  selectedContext?: string;
  onContextChange?: (context: string) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
}

export function SearchBar({
  value,
  onChange,
  onClear,
  contexts = [],
  selectedContext = "",
  onContextChange,
  placeholder = "Search your memories...",
  className,
  size = "default",
}: SearchBarProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only autofocus on desktop (>= 768px) to avoid keyboard covering content on mobile
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setContextOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showContextSelector = contexts.length > 0 && onContextChange;
  const showClear = value.length > 0 && onClear;
  const contextLabel = selectedContext || "All";

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        className={cn(
          "w-full rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-border",
          "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          size === "lg"
            ? "py-4 pl-12 text-base"
            : "py-3 pl-11 text-sm",
          showClear && showContextSelector
            ? size === "lg" ? "pr-40" : "pr-36"
            : showClear
            ? size === "lg" ? "pr-14" : "pr-12"
            : showContextSelector
            ? size === "lg" ? "pr-28" : "pr-24"
            : "pr-4"
        )}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-2 text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground hover:bg-surface-hover"
          >
            <X className={cn(size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          </button>
        )}
        {showContextSelector && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setContextOpen(!contextOpen)}
              className={cn(
                "flex items-center gap-1 rounded-full border border-border bg-surface px-3 text-xs text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground hover:bg-surface-hover",
                size === "lg" ? "py-1.5" : "py-1"
              )}
            >
              {contextLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
            {contextOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border bg-surface py-1 shadow-lg">
                <button
                  onClick={() => {
                    onContextChange("");
                    setContextOpen(false);
                  }}
                  className={cn(
                    "block w-full px-3 py-2.5 text-left text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    selectedContext === ""
                      ? "text-foreground bg-surface-hover"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  All
                </button>
                {contexts.map((ctx) => (
                  <button
                    key={ctx}
                    onClick={() => {
                      onContextChange(ctx);
                      setContextOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2.5 text-left text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      selectedContext === ctx
                        ? "text-foreground bg-surface-hover"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {ctx}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
