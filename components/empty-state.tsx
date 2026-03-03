"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface text-center fade-in-up ${
        compact ? "p-5" : "p-8"
      }`}
      style={{ opacity: 0, animationFillMode: "forwards" }}
    >
      <div className="mx-auto mb-3 text-muted-foreground/30">{icon}</div>
      <p className={`font-medium text-foreground/80 ${compact ? "text-sm" : "text-base"}`}>
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground/50">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-block text-sm text-accent hover:underline"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-3 text-sm text-accent hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
