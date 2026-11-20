export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="h-8 w-36 rounded-lg bg-slate-200 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-20 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner Skeleton */}
        <div className="mb-8 h-40 rounded-3xl bg-slate-200 animate-pulse" />

        {/* Categories Skeleton */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 shrink-0 rounded-full bg-slate-200 animate-pulse" />
          ))}
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="aspect-square w-full rounded-xl bg-slate-200 animate-pulse" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-5 w-16 rounded bg-slate-200 animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
