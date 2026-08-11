import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";


import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import { CaveSidebar } from "./CaveSidebar";
import { CaveHeaderCard } from "./CaveHeaderCard";
import { CaveAffinageCard } from "./CaveAffinageCard";
import { CaveGridPlan } from "./CaveGridPlan";
import { CaveDialog } from "./CaveDialog";
import { ContenuDialog } from "./ContenuDialog";

import {
  caveActions,
  useProductionStore,
  type Cave,
  type Emplacement,
} from "./../../../lib/production-store";

export function CaveManager() {
  const { caves, fabrications } = useProductionStore();

  const [selectedId, setSelectedId] = useState<string>(caves[0]?.id ?? "");
  const [caveDialogOpen, setCaveDialogOpen] = useState(false);
  const [editingCave, setEditingCave] = useState<Cave | null>(null);
  const [contenuDialog, setContenuDialog] = useState<Emplacement | null>(null);
  const [selectedFabricationId, setSelectedFabricationId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!caves.find((c) => c.id === selectedId) && caves[0]) {
      setSelectedId(caves[0].id);
    }
  }, [caves, selectedId]);

  const selectedCave = useMemo(
    () => caves.find((c) => c.id === selectedId) ?? caves[0],
    [caves, selectedId]
  );

  const readyForAffinage = useMemo(
    () => fabrications.filter((f) => f.status === "en_cours"),
    [fabrications]
  );

  const freeSlots = selectedCave
    ? selectedCave.emplacements.filter((e) => !e.contenu).length
    : 0;

  const handlePlaceInAffinage = useCallback(() => {
    if (!selectedCave || !selectedFabricationId) return;

    const res = caveActions.placeInAffinage(selectedCave.id, selectedFabricationId);
    if (!res.ok) {
      toast.error(res.reason ?? "Impossible de placer le lot.");
      return;
    }

    const fab = fabrications.find((f) => f.id === selectedFabricationId);
    toast.success(`${fab?.recipeName ?? "Lot"} mis en affinage dans « ${selectedCave.nom} ».`);
    setSelectedFabricationId("");
  }, [selectedCave, selectedFabricationId, fabrications]);

  const handleSaveCave = useCallback((cave: Cave) => {
    caveActions.upsert(cave);
    setSelectedId(cave.id);
    setCaveDialogOpen(false);
  }, []);

  const handleSaveContenu = useCallback(
    (contenu: string) => {
      if (contenuDialog && selectedCave) {
        caveActions.setContenu(selectedCave.id, contenuDialog.id, contenu || undefined);
      }
      setContenuDialog(null);
    },
    [contenuDialog, selectedCave]
  );

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[280px_1fr]">

      <CaveSidebar
        caves={caves}
        selectedId={selectedCave?.id ?? ""}
        onSelectCave={setSelectedId}
        onCreateClick={() => {
          setEditingCave(null);
          setCaveDialogOpen(true);
        }}
      />

      {selectedCave ? (
        <section className="space-y-4">
          <CaveHeaderCard
            cave={selectedCave}
            canDelete={caves.length > 1}
            onEdit={() => {
              setEditingCave(selectedCave);
              setCaveDialogOpen(true);
            }}
            onDelete={() => setDeleteDialogOpen(true)}
          />

          <CaveAffinageCard
            readyLots={readyForAffinage}
            selectedLotId={selectedFabricationId}
            freeSlots={freeSlots}
            onSelectLot={setSelectedFabricationId}
            onConfirmAffinage={handlePlaceInAffinage}
          />

          <CaveGridPlan cave={selectedCave} onSelectSlot={setContenuDialog} />
        </section>
      ) : (
        <p className="text-muted-foreground">Aucune cave. Créez-en une pour commencer.</p>
      )}

      {/* Modals */}
      <CaveDialog
        open={caveDialogOpen}
        initial={editingCave}
        onOpenChange={setCaveDialogOpen}
        onSave={handleSaveCave}
      />

      <ContenuDialog
        emplacement={contenuDialog}
        onOpenChange={(open) => !open && setContenuDialog(null)}
        onSave={handleSaveContenu}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la cave ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Les lots éventuellement placés dans cette cave seront détachés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCave) caveActions.remove(selectedCave.id);
                setDeleteDialogOpen(false);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}