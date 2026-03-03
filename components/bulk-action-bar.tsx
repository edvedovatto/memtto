"use client";

import { useState } from "react";
import { Trash2, Heart, Archive, X } from "lucide-react";
import { bulkDelete, bulkToggleFavorite, bulkToggleArchive } from "@/lib/services/entries";
import { toast } from "sonner";

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: Set<string>;
  onComplete: () => void;
  onCancel: () => void;
}

export function BulkActionBar({ selectedCount, selectedIds, onComplete, onCancel }: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const ids = Array.from(selectedIds);

  async function handleAction(
    action: () => Promise<void>,
    successMessage: string
  ) {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
      onComplete();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 shadow-2xl fade-in-up lg:left-[calc(50%+8rem)]">
      <span className="mr-2 text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction(
          () => bulkToggleFavorite(ids, true),
          `${selectedCount} entries favorited`
        )}
        className="btn-press rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-accent disabled:opacity-50"
        title="Favorite"
      >
        <Heart className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction(
          () => bulkToggleArchive(ids, true),
          `${selectedCount} entries archived`
        )}
        className="btn-press rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
        title="Archive"
      >
        <Archive className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction(
          () => bulkDelete(ids),
          `${selectedCount} entries deleted`
        )}
        className="btn-press rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="ml-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        title="Cancel"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
