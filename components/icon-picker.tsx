"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CONTEXT_ICONS,
  CONTEXT_ICON_MAP,
  getIcon,
} from "@/lib/context-icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const CurrentIcon = getIcon(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-surface-hover"
      >
        <CurrentIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
            onMouseDown={() => setOpen(false)}
          >
            <div
              className="rounded-2xl border border-border bg-surface p-4 shadow-2xl animate-scale-in"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
                Choose icon
              </p>
              <div className="grid grid-cols-6 gap-1">
                {CONTEXT_ICONS.map((iconName) => {
                  const Icon = CONTEXT_ICON_MAP[iconName]!;
                  const isSelected = value === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName);
                        setOpen(false);
                      }}
                      title={iconName}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-accent text-white"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
