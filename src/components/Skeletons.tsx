export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}