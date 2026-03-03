"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortField, type SortOrder } from "@/types";

interface SortDropdownProps {
  field: SortField;
  order: SortOrder;
  onChange: (field: SortField, order: SortOrder) => void;
}

export function SortDropdown({ field, order, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.field === field && o.order === order);
  const label = current?.label || "Newest";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground hover:bg-surface-hover"
      >
        <ArrowUpDown className="h-3 w-3" />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] animate-slide-down-fade rounded-lg border border-border bg-surface py-1 shadow-lg">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onChange(opt.field, opt.order);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2.5 text-left text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                field === opt.field && order === opt.order
                  ? "text-foreground bg-surface-hover"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
