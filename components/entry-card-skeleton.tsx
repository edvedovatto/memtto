export function EntryCardSkeleton() {
  const bar =
    "rounded bg-gradient-to-r from-surface-hover via-border/30 to-surface-hover bg-[length:200%_100%] animate-shimmer";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          {/* Header: badge + type + date + heart */}
          <div className="mb-2 flex items-center gap-2">
            <span className={`h-[18px] w-14 rounded ${bar}`} />
            <span className={`h-3 w-10 ${bar}`} />
            <span className={`ml-auto h-3 w-16 ${bar}`} />
            <span className={`h-4 w-4 rounded-full ${bar}`} />
          </div>

          {/* Title */}
          <div className={`h-[18px] w-3/4 ${bar}`} />

          {/* Content lines */}
          <div className="mt-2.5 space-y-1.5">
            <div className={`h-3.5 w-full ${bar}`} />
            <div className={`h-3.5 w-2/3 ${bar}`} />
          </div>

          {/* Tags */}
          <div className="mt-3 flex gap-2">
            <span className={`h-5 w-12 rounded-full ${bar}`} />
            <span className={`h-5 w-16 rounded-full ${bar}`} />
            <span className={`h-5 w-10 rounded-full ${bar}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
