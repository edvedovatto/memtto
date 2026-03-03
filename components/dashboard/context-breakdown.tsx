"use client";

import { ContextIcon } from "@/components/context-icon";
import type { ContextCount } from "@/types";

interface ContextBreakdownProps {
  contexts: ContextCount[];
  contextIcons?: Record<string, string>;
}

export function ContextBreakdown({ contexts, contextIcons = {} }: ContextBreakdownProps) {
  if (contexts.length === 0) return null;

  const max = contexts[0]?.count ?? 1;

  function handleContextClick(context: string) {
    window.dispatchEvent(new CustomEvent("selectContext", { detail: context }));
  }

  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        By context
      </h2>
      <div className="space-y-2">
        {contexts.map((ctx, index) => (
          <button
            key={ctx.context}
            onClick={() => handleContextClick(ctx.context)}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover fade-in-up"
            style={{
              opacity: 0,
              animationDelay: `${index * 40}ms`,
              animationFillMode: "forwards",
            }}
          >
            <ContextIcon name={contextIcons[ctx.context]} className="h-4 w-4 flex-shrink-0" />
            <span className="flex-shrink-0 text-sm text-foreground/80 group-hover:text-foreground">
              {ctx.context}
            </span>
            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent/40 transition-all group-hover:bg-accent/60"
                  style={{ width: `${(ctx.count / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground/60">
              {ctx.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
