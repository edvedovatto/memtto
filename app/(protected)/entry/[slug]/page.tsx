"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Pencil, Trash2 } from "lucide-react";
import { getEntryBySlug, deleteEntry } from "@/lib/services/entries";
import { toast } from "sonner";
import type { Entry } from "@/types";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEntryBySlug(params.slug as string);
        setEntry(data);
      } catch (err) {
        console.error("Failed to load entry:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

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
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{entry.title}</h1>
          <div className="flex items-center gap-1">
            <Link
              href={`/entry/${entry.slug}/edit`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {entry.context}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {entry.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-sm font-semibold text-foreground">Delete entry?</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              This action cannot be undone. The entry &quot;{entry.title}&quot; will be permanently deleted.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {entry.content_text}
      </div>

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
              R$ {(entry.price_cents / 100).toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
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
              className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
