import { useEffect, useState } from "react";

import { Badge } from "../../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import type { RecetteHistoryItem } from "../../types/recipe.types";
import { formatCurrency, formatDate, requestErrorMessage } from "./recipe.utils";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: number;
  loadHistory: (id: number) => Promise<RecetteHistoryItem[]>;
}

export function HistoryDialog({ open, onOpenChange, recipeId, loadHistory }: HistoryDialogProps) {
  const [history, setHistory] = useState<RecetteHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setIsLoading(true); setError(null);
    void loadHistory(recipeId).then((items) => { if (active) setHistory(items); }).catch((requestError: unknown) => { if (active) setError(requestErrorMessage(requestError)); }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [open, recipeId, loadHistory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Historique des modifications</DialogTitle><DialogDescription>Chaque version conserve son coût matière estimé.</DialogDescription></DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? <p role="status" className="text-sm text-muted-foreground">Chargement de l’historique...</p> : error ? <p role="alert" className="text-sm text-destructive">{error}</p> : history.length === 0 ? <p className="text-sm text-muted-foreground">Aucun historique disponible.</p> : (
            <ol className="space-y-4">{history.map((revision) => <li key={revision.id} className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">Version {revision.version} · {revision.nom}</p><p className="text-xs text-muted-foreground">{formatDate(revision.dateCreation)}</p></div><Badge variant={revision.active ? "default" : "outline"}>{revision.active ? "Courante" : "Historique"}</Badge></div><p className="mt-3 text-sm">Coût matière estimé : {formatCurrency(revision.coutMatiereEstime)}</p></li>)}</ol>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
