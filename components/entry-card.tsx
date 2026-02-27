"use client";

import { memo, useState } from "react";
import Link from "next/link";
// eslint-disable-next-line @next/next/no-img-element
import { Star, Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/services/entries";
import type { Entry, ChecklistItem } from "@/types";

function formatPrice(cents: number): string {
  const reais = (cents / 100).toFixed(2);
  const [intPart, decPart] = reais.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withThousands},${decPart}`;
}

export const EntryCard = memo(function EntryCard({ entry }: { entry: Entry }) {
  const hasImage = !!entry.image_url;
  const [imageLayout, setImageLayout] = useState<"side" | "top">("side");
  const [isFav, setIsFav] = useState(entry.is_favorite);

  function handleTagClick(e: React.MouseEvent, tag: string) {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("searchByTag", { detail: tag }));
  }

  async function handleFavoriteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFav;
    setIsFav(next);
    try {
      await toggleFavorite(entry.id, next);
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
    } catch {
      setIsFav(!next);
    }
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.naturalWidth / img.naturalHeight > 1.8) {
      setImageLayout("top");
    }
  }

  const hasRating = entry.rating !== null;
  const hasPrice = entry.price_cents !== null && entry.price_cents > 0;
  const hasMetadata = hasRating || hasPrice;

  return (
    <Link href={`/entry/${entry.slug}`}>
      <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-200 ease-in-out hover:bg-surface-hover">
        {/* Banner image for wide/ultrawide images */}
        {hasImage && imageLayout === "top" && (
          <div className="overflow-hidden">
            <img
              src={entry.image_url!}
              alt={entry.title}
              onLoad={handleImageLoad}
              className="h-[160px] w-full object-cover"
            />
          </div>
        )}

        <div className={`flex gap-4 ${hasImage && imageLayout === "side" ? "p-3" : "px-5 py-4"}`}>
          {/* Side thumbnail for normal/portrait images */}
          {hasImage && imageLayout === "side" && (
            <div className="flex-shrink-0 self-stretch overflow-hidden rounded-lg">
              <img
                src={entry.image_url!}
                alt={entry.title}
                onLoad={handleImageLoad}
                className="h-full w-[100px] object-cover"
              />
            </div>
          )}

          <div className={`min-w-0 flex-1 ${hasImage && imageLayout === "side" ? "py-0.5 pr-1" : ""}`}>
            {/* Header: context badge, type, date, favorite */}
            <div className="mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/60">
              <span className="rounded border border-border px-1.5 py-0.5 font-medium text-muted-foreground">
                {entry.context}
              </span>
              <span>{entry.type}</span>
              <span className="ml-auto">
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={handleFavoriteClick}
                className="-mr-1 ml-1 rounded-md p-2 transition-colors hover:text-accent"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFav ? "fill-accent text-accent" : ""
                  }`}
                />
              </button>
            </div>

            <h3 className="text-[15px] font-medium leading-snug text-foreground group-hover:text-foreground/90">
              {entry.title}
            </h3>

            {entry.content_format === "checklist" ? (
              (() => {
                try {
                  const items: ChecklistItem[] = JSON.parse(entry.content_text);
                  const checked = items.filter((i) => i.checked).length;
                  return (
                    <div className="mt-1.5 space-y-1">
                      {items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[13px]">
                          <div
                            className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[3px] border ${
                              item.checked
                                ? "border-accent/50 bg-accent/20"
                                : "border-muted-foreground/20"
                            }`}
                          >
                            {item.checked && (
                              <svg className="h-2.5 w-2.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={item.checked ? "text-muted-foreground/40 line-through" : "text-muted-foreground/70"}>{item.text}</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="pl-5.5 text-[11px] text-muted-foreground/40">
                          +{items.length - 3} more
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="h-1 w-16 rounded-full bg-border/50">
                          <div
                            className="h-1 rounded-full bg-accent/60 transition-all"
                            style={{ width: `${(checked / items.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground/40">
                          {checked}/{items.length}
                        </span>
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()
            ) : entry.content_text ? (
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground/70">
                {entry.content_text}
              </p>
            ) : null}

            {/* Rating + Price */}
            {hasMetadata && (
              <div className="mt-2 flex items-center gap-3">
                {hasRating && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= entry.rating!
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {hasPrice && (
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {formatPrice(entry.price_cents!)}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => handleTagClick(e, tag)}
                    className="rounded-full bg-surface-hover/50 px-2 py-0.5 text-xs text-muted-foreground/60 transition-colors hover:bg-surface-hover hover:text-accent"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
