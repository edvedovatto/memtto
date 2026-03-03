"use client";

import { useState, useRef, useEffect } from "react";
import {
  CONTEXT_ICONS,
  CONTEXT_ICON_MAP,
  DEFAULT_CONTEXT_ICON,
  getIcon,
} from "@/lib/context-icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
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

  const CurrentIcon = getIcon(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-surface-hover"
      >
        <CurrentIcon className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface p-3 shadow-xl animate-fade-in">
          <div className="grid grid-cols-6 gap-1.5">
            {CONTEXT_ICONS.map((iconName) => {
              const Icon = CONTEXT_ICON_MAP[iconName]!;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  title={iconName}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-hover ${
                    value === iconName
                      ? "bg-accent/10 text-accent ring-1 ring-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
