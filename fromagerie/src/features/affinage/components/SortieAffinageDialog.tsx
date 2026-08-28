import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import type { EmplacementStock, SortieAffinageRequest } from "../../stocks/api/stockApi";

interface Props {
  open: boolean;
  lotCode: string;
  quantity: number;
  emplacements: EmplacementStock[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: SortieAffinageRequest) => Promise<void>;
  canCreateLocation: boolean;
  onCreateLocation: (request: { nom: string; description?: string }) => Promise<EmplacementStock>;
}

export function SortieAffinageDialog({ open, lotCode, quantity, emplacements, onOpenChange, onSubmit, canCreateLocation, onCreateLocation }: Props) {
  const [emplacementId, setEmplacementId] = useState("");
  const [dateEntree, setDateEntree] = useState("");
  const [typeDate, setTypeDate] = useState<"DLC" | "DDM">("DLC");
  const [dateDurabilite, setDateDurabilite] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDescription, setNewLocationDescription] = useState("");
  const activeEmplacements = useMemo(() => emplacements.filter((item) => item.active), [emplacements]);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    setEmplacementId(activeEmplacements[0]?.id.toString() ?? "");
    setDateEntree(today);
    setDateDurabilite("");
    setTypeDate("DLC");
    setCommentaire("");
    setSubmitting(false);
    setCreatingLocation(false);
    setNewLocationName("");
    setNewLocationDescription("");
  }, [open]);

  async function handleCreateLocation() {
    if (!newLocationName.trim()) return;
    setSubmitting(true);
    try {
      const created = await onCreateLocation({
        nom: newLocationName.trim(),
        description: newLocationDescription.trim() || undefined,
      });
      setEmplacementId(String(created.id));
      setCreatingLocation(false);
      setNewLocationName("");
      setNewLocationDescription("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        emplacementStockId: Number(emplacementId),
        dateEntreeStock: dateEntree,
        typeDateDurabilite: typeDate,
        dateDurabilite,
        commentaire: commentaire.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      // Le parent affiche l'erreur et laisse le formulaire ouvert.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-[#FCFAF7]">
        <DialogHeader>
          <DialogTitle>Sortir l'affinage vers le stock</DialogTitle>
          <DialogDescription>
            Le lot {lotCode} ({quantity} fromage{quantity > 1 ? "s" : ""}) sera clôturé et tracé comme une entrée en stock fini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Emplacement stock</Label>
            <Select value={emplacementId} onValueChange={setEmplacementId} required>
              <SelectTrigger><SelectValue placeholder="Choisir un emplacement" /></SelectTrigger>
              <SelectContent>
                {activeEmplacements.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeEmplacements.length === 0 && (
              <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                <p>
                  {canCreateLocation
                    ? "Aucun emplacement stock actif n'est disponible. Créez-en un pour poursuivre."
                    : "Aucun emplacement stock actif n'est disponible. Demandez au propriétaire d'ajouter un emplacement stock."}
                </p>
                {canCreateLocation && !creatingLocation && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setCreatingLocation(true)}>
                    <Plus className="size-4" /> Créer un emplacement
                  </Button>
                )}
                {canCreateLocation && creatingLocation && (
                  <div className="space-y-2">
                    <Input value={newLocationName} onChange={(event) => setNewLocationName(event.target.value)} placeholder="Nom de l'emplacement" maxLength={120} autoFocus />
                    <Input value={newLocationDescription} onChange={(event) => setNewLocationDescription(event.target.value)} placeholder="Description (optionnelle)" maxLength={500} />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" disabled={submitting || !newLocationName.trim()} onClick={() => void handleCreateLocation()}>
                        {submitting ? "Création..." : "Créer"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingLocation(false)}>Annuler</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stock-entry-date">Entrée en stock</Label>
              <Input id="stock-entry-date" type="date" value={dateEntree} onChange={(event) => setDateEntree(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Durabilité</Label>
              <Select value={typeDate} onValueChange={(value: "DLC" | "DDM") => setTypeDate(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="DLC">DLC</SelectItem><SelectItem value="DDM">DDM</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-durability-date">
              {typeDate === "DLC"
                ? "Date limite de consommation (DLC)"
                : "Date de durabilité minimale (DDM)"}
            </Label>
            <Input id="stock-durability-date" type="date" value={dateDurabilite} onChange={(event) => setDateDurabilite(event.target.value)} min={dateEntree} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-release-comment">Commentaire (optionnel)</Label>
            <Textarea id="stock-release-comment" value={commentaire} onChange={(event) => setCommentaire(event.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting || !emplacementId || !dateDurabilite}>
              {submitting ? "Sortie en cours..." : "Confirmer la sortie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
