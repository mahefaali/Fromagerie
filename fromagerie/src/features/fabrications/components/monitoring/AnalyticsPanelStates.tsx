import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";

export function AnalyticsCard({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="min-w-0 overflow-hidden rounded-3xl border-border/70 bg-card/70 shadow-sm">
      <CardHeader><div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        <div><CardTitle className="font-serif text-xl">{title}</CardTitle><CardDescription className="mt-1 leading-relaxed">{description}</CardDescription></div>
      </div></CardHeader>
      <CardContent className="min-w-0 overflow-x-auto">{children}</CardContent>
    </Card>
  );
}

export function LoadingState() {
  return <div role="status" aria-live="polite" className="space-y-4">
    <span className="sr-only">Chargement du suivi des paramètres...</span>
    <div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />)}</div>
    <div className="grid gap-5 xl:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-muted" />)}</div>
  </div>;
}

export function PanelLoadingState() {
  return <div role="status" aria-live="polite" className="space-y-3">
    <span className="sr-only">Chargement des anomalies...</span>
    {[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
  </div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
    <p className="font-medium">Impossible de charger cette analyse.</p><p className="mt-1 text-sm text-muted-foreground">{message}</p>
    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}><RefreshCw /> Réessayer</Button>
  </div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-border bg-background/35 p-6 text-center text-sm text-muted-foreground">{message}</div>;
}
