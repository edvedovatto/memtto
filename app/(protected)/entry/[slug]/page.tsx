"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import { getEntryBySlug } from "@/lib/services/entries";
import type { Entry } from "@/types";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-xl font-semibold text-foreground">{entry.title}</h1>
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
