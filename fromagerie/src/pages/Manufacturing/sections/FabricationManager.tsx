import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Factory, Plus } from "lucide-react";

import { Button } from "./../../../components/ui/button";
import FabricationCreateModal, { type FabricationDraft } from "./FabricationCreateModal";
import { FabricationCard, STATUS_META, STATUS_ORDER } from "./FabricationCard";
import { ChooseCaveDialog } from "./ChooseCaveDialog";
import { FabricationDetailsModal } from "./FabricationDetailsModal";
import { FinishBatchModal, type BatchFormData } from "./FinishBatchModal";

import {
  caveActions,
  fabricationActions,
  useProductionStore,
  type Fabrication,
  type FabricationStatus,
} from "./../../../lib/production-store";

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export default function FabricationManager() {
  const { fabrications, caves } = useProductionStore();

  const [filter, setFilter] = useState<FabricationStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFabrication, setSelectedFabrication] = useState<Fabrication | null>(null);
  const [affinageTargetLot, setAffinageTargetLot] = useState<Fabrication | null>(null);
  const [finishTargetLot, setFinishTargetLot] = useState<Fabrication | null>(null);

  const filteredFabrications = useMemo(() => {
    return fabrications
      .filter((item) => (filter === "all" ? true : item.status === filter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [fabrications, filter]);

  const counts = useMemo(() => {
    const stats: Record<FabricationStatus, number> = {
      planifiee: 0,
      en_cours: 0,
      affinage: 0,
      terminee: 0,
    };
    fabrications.forEach((item) => {
      stats[item.status] = (stats[item.status] ?? 0) + 1;
    });
    return stats;
  }, [fabrications]);

  const totals = useMemo(
    () => ({
      liters: fabrications.reduce((acc, item) => acc + item.milkLiters, 0),
      pieces: fabrications.reduce((acc, item) => acc + item.yieldPieces, 0),
    }),
    [fabrications]
  );

  const handleCreateLot = useCallback((draft: FabricationDraft) => {
    const nextFabrication: Fabrication = {
      id: uid("fab"),
      recipeName: draft.productType,
      batchCode: draft.lotCode || `LOT-${Date.now().toString().slice(-6)}`,
      date: draft.startAt.slice(0, 10),
      milkLiters: Number(draft.milkQuantityL) || 0,
      yieldPieces: Number(draft.cheeseCount) || 0,
      temperatureC: Number(draft.temperature) || 0,
      operator: draft.operator || "Anonyme",
      status: "planifiee",
      notes: draft.observations.trim() || undefined,
    };

    fabricationActions.add(nextFabrication);
    setCreateOpen(false);
    toast.success("Lot de fabrication créé avec succès.");
  }, []);

  const handleAdvanceStatus = useCallback((lot: Fabrication) => {
    const currentIndex = STATUS_ORDER.indexOf(lot.status);
    const nextStatus = STATUS_ORDER[currentIndex + 1];

    if (nextStatus === "affinage") {
      setAffinageTargetLot(lot);
      return;
    }

    if (nextStatus === "terminee") {
      setFinishTargetLot(lot);
      return;
    }

    fabricationActions.advance(lot.id);
  }, []);

  const handleConfirmFinish = useCallback(
    (data: BatchFormData) => {
      if (!finishTargetLot) return;

      fabricationActions.advance(finishTargetLot.id);
      toast.success(
        `Lot ${finishTargetLot.batchCode} marqué comme terminé et mis en stock (${data.quantity} pièces).`
      );
      setFinishTargetLot(null);
    },
    [finishTargetLot]
  );

  const handleConfirmAffinage = useCallback(
    (caveId: string, days: number) => {
      if (!affinageTargetLot) return;

      const result = caveActions.placeInAffinage(caveId, affinageTargetLot.id, days);
      if (result.ok) {
        toast.success(`Lot placé en affinage pour ${days} jour${days > 1 ? "s" : ""}.`);
        setAffinageTargetLot(null);
      } else {
        toast.error(result.reason ?? "Impossible de placer le lot dans cette cave.");
      }
    },
    [affinageTargetLot]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Responsive */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Factory className="size-6 text-primary sm:size-7 shrink-0" />
            <span>Fabrications</span>
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Suivi des lots de production, de la planification jusqu'à la fin d'affinage.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto shrink-0 justify-center"
        >
          <Plus className="mr-1 size-4" /> Nouvelle fabrication
        </Button>
      </header>

      {/* Baromètre / Stats Filter Strip */}
      <section
        className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-6"
        aria-label="Statistiques de fabrication"
      >
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const Icon = meta.icon;
          const isActive = filter === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(isActive ? "all" : status)}
              className={`flex items-center justify-between min-w-0 rounded-lg border p-2.5 sm:p-3 text-left transition-colors ${
                isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`inline-block size-2 rounded-full shrink-0 ${meta.dot}`} />
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                    {meta.label}
                  </div>
                  <div className="text-base sm:text-lg font-semibold leading-tight">
                    {counts[status]}
                  </div>
                </div>
              </div>
              <Icon className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
            </button>
          );
        })}

        {/* Totaux harmonisés dans la grille (1 col sur mobile = 2 cartes par ligne au total) */}
        <div className="col-span-1 rounded-lg border p-2.5 sm:p-3">
          <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Lait total</div>
          <div className="text-base sm:text-lg font-semibold leading-tight">{totals.liters} L</div>
        </div>
        <div className="col-span-1 rounded-lg border p-2.5 sm:p-3">
          <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Pièces produites</div>
          <div className="text-base sm:text-lg font-semibold leading-tight">{totals.pieces}</div>
        </div>
      </section>

      {/* Timeline Liste des Lots */}
      <section className="relative" aria-label="Liste des lots de fabrication">
        <div className="pointer-events-none absolute bottom-2 left-[15px] top-2 w-px bg-border md:left-[19px]" />

        {filteredFabrications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 sm:p-8 text-center text-xs sm:text-sm text-muted-foreground">
            Aucune fabrication correspondant au filtre sélectionné.
          </div>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {filteredFabrications.map((lot) => (
              <FabricationCard
                key={lot.id}
                lot={lot}
                onSelectDetails={setSelectedFabrication}
                onAdvanceStatus={handleAdvanceStatus}
                onRemove={(id) => fabricationActions.remove(id)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Modals */}
      <FabricationCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateLot}
      />

      <FabricationDetailsModal
        fabrication={selectedFabrication}
        onClose={() => setSelectedFabrication(null)}
      />

      <ChooseCaveDialog
        fabrication={affinageTargetLot}
        caves={caves}
        onClose={() => setAffinageTargetLot(null)}
        onConfirm={handleConfirmAffinage}
      />

      <FinishBatchModal
        isOpen={!!finishTargetLot}
        onClose={() => setFinishTargetLot(null)}
        onSubmit={handleConfirmFinish}
        batchName={finishTargetLot?.recipeName}
        batchCode={finishTargetLot?.batchCode}
      />
    </div>
  );
}