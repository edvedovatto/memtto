export function DashboardSkeleton() {
  const bar =
    "rounded bg-gradient-to-r from-surface-hover via-border/30 to-surface-hover bg-[length:200%_100%] animate-shimmer";

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`h-5 w-5 rounded ${bar}`} />
              <div className="space-y-1.5">
                <div className={`h-6 w-10 ${bar}`} />
                <div className={`h-3 w-16 ${bar}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: recent + quick access */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Recent entries */}
        <div className="xl:col-span-3">
          <div className={`mb-3 h-3 w-14 ${bar}`} />
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface px-5 py-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-[18px] w-14 rounded ${bar}`} />
                  <span className={`h-3 w-10 ${bar}`} />
                  <span className={`ml-auto h-3 w-16 ${bar}`} />
                </div>
                <div className={`h-[18px] w-3/4 ${bar}`} />
                <div className="mt-2 space-y-1.5">
                  <div className={`h-3.5 w-full ${bar}`} />
                  <div className={`h-3.5 w-1/2 ${bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick access */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <div className={`mb-3 h-3 w-16 ${bar}`} />
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <div className={`h-3.5 w-3.5 rounded-full ${bar}`} />
                  <div className={`h-3.5 w-2/3 ${bar}`} />
                  <div className={`ml-auto h-3 w-12 ${bar}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`mb-3 h-3 w-16 ${bar}`} />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-6 rounded-full ${bar}`}
                  style={{ width: `${60 + (i % 3) * 16}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context breakdown */}
      <div>
        <div className={`mb-3 h-3 w-20 ${bar}`} />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className={`h-3.5 w-16 ${bar}`} />
              <div className="flex-1">
                <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${80 - i * 20}%` }} />
              </div>
              <div className={`h-3 w-6 ${bar}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
