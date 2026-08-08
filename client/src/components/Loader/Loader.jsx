const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

/**
 * Simple spinner. Usage: <Loader /> or <Loader size="sm" label="Loading requests…" />
 */
const Loader = ({ size = "md", label }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-6 text-ink/50">
    <span
      className={`inline-block animate-spin rounded-full border-river-100 border-t-river-600 ${sizeMap[size]}`}
      role="status"
      aria-label="Loading"
    />
    {label && <span className="text-xs">{label}</span>}
  </div>
);

/** Skeleton block for content placeholders, e.g. <SkeletonCard count={3} /> */
export const SkeletonCard = ({ count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card animate-pulse space-y-2">
        <div className="h-4 w-1/3 rounded bg-river-100" />
        <div className="h-3 w-full rounded bg-river-50" />
        <div className="h-3 w-2/3 rounded bg-river-50" />
      </div>
    ))}
  </div>
);

export default Loader;
