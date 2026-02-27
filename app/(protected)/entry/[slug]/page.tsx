"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Pencil, Trash2, Heart } from "lucide-react";
import { getEntryBySlug, deleteEntry, toggleChecklistItem, toggleFavorite } from "@/lib/services/entries";
import { toast } from "sonner";
import type { Entry, ChecklistItem } from "@/types";

function formatPrice(cents: number): string {
  const reais = (cents / 100).toFixed(2);
  const [intPart, decPart] = reais.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withThousands},${decPart}`;
}

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isFav, setIsFav] = useState(false);
  const togglingRef = useRef(new Set<number>());

  useEffect(() => {
    async function load() {
      try {
        const data = await getEntryBySlug(params.slug as string);
        setEntry(data);
        if (data) setIsFav(data.is_favorite);
        if (data?.content_format === "checklist") {
          try {
            setChecklistItems(JSON.parse(data.content_text));
          } catch { /* ignore parse errors */ }
        }
      } catch (err) {
        console.error("Failed to load entry:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  async function handleToggleItem(index: number) {
    if (!entry || togglingRef.current.has(index)) return;
    togglingRef.current.add(index);
    // Optimistic update
    setChecklistItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
    try {
      const updated = await toggleChecklistItem(entry.id, index);
      setChecklistItems(updated);
    } catch {
      // Revert on error
      setChecklistItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, checked: !item.checked } : item
        )
      );
    } finally {
      togglingRef.current.delete(index);
    }
  }

  async function handleToggleFavorite() {
    if (!entry) return;
    const next = !isFav;
    setIsFav(next);
    try {
      await toggleFavorite(entry.id, next);
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
    } catch {
      setIsFav(!next);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
      toast.success("Entry deleted");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete entry");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Entry not found.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-xs text-foreground underline"
        >
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{entry.title}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-accent"
            >
              <Heart className={`h-[18px] w-[18px] ${isFav ? "fill-accent text-accent" : ""}`} />
            </button>
            <Link
              href={`/entry/${entry.slug}/edit`}
              className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <Pencil className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2.5 py-1 text-sm text-muted-foreground">
            {entry.context}
          </span>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-sm text-muted-foreground">
            {entry.type}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-base font-semibold text-foreground">Delete entry?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone. The entry &quot;{entry.title}&quot; will be permanently deleted.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {entry.image_url && (
        <div className="overflow-hidden rounded-lg">
          <Image
            src={entry.image_url}
            alt={entry.title}
            width={600}
            height={400}
            className="w-full object-cover"
          />
        </div>
      )}

      {entry.content_format === "checklist" ? (
        <div className="rounded-lg border border-border bg-surface">
          <div className="divide-y divide-border/50">
            {checklistItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleToggleItem(index)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
              >
                <div
                  className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] border transition-all ${
                    item.checked
                      ? "border-accent bg-accent text-background"
                      : "border-muted-foreground/25"
                  }`}
                >
                  {item.checked && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm transition-all ${
                    item.checked
                      ? "text-muted-foreground/50 line-through"
                      : "text-foreground"
                  }`}
                >
                  {item.text}
                </span>
              </button>
            ))}
          </div>
          {checklistItems.length > 0 && (
            <div className="border-t border-border/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-secondary">
                  <div
                    className="h-1 rounded-full bg-accent transition-all"
                    style={{ width: `${(checklistItems.filter((i) => i.checked).length / checklistItems.length) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground/50">
                  {checklistItems.filter((i) => i.checked).length}/{checklistItems.length}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {entry.content_text}
        </div>
      )}

      {(entry.rating || entry.price_cents) && (
        <div className="flex items-center gap-4 border-t border-border pt-4">
          {entry.rating && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= entry.rating!
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          {entry.price_cents != null && (
            <span className="text-sm text-muted-foreground">
              {formatPrice(entry.price_cents!)}
            </span>
          )}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {entry.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("searchByTag", { detail: tag })
                );
                router.push("/");
              }}
              className="rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
