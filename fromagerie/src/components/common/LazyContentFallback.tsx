export function LazyContentFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-4 text-center text-sm text-muted-foreground"
    >
      Chargement du contenu...
    </div>
  );
}
