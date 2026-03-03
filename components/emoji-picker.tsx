"use client";

import { useState, useRef, useEffect } from "react";
import { CONTEXT_ICONS, DEFAULT_CONTEXT_ICON } from "@/lib/context-icons";

interface EmojiPickerProps {
  value: string;
  onChange: (icon: string) => void;
  size?: "sm" | "md";
}

export function EmojiPicker({ value, onChange, size = "md" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const btnSize = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${btnSize} flex items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-surface-hover`}
      >
        {value || DEFAULT_CONTEXT_ICON}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 grid grid-cols-6 gap-1 rounded-xl border border-border bg-surface p-2 shadow-xl animate-fade-in">
          {CONTEXT_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-surface-hover ${
                value === icon ? "bg-accent/10 ring-1 ring-accent" : ""
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
