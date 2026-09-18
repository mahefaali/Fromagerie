import { Warehouse } from "lucide-react";
import { Toaster } from "sonner";

import { Button } from "../../../components/ui/button";
import { AddCareDialog } from "./AddCareDialog";
import { AffinageCareJournal } from "./AffinageCareJournal";
import { AffinageLotHeader } from "./AffinageLotHeader";
import { AffinageLotList } from "./AffinageLotList";
import { AffinagePlacementDialog } from "./AffinagePlacementDialog";
import { SortieAffinageDialog } from "./SortieAffinageDialog";
import {
  toCareLogs,
  toCareSummary,
  toHeaderDetail,
} from "./tracker/affinageTracker.utils";
import { useAffinageTracker } from "./tracker/useAffinageTracker";

export default function AffinageTracker() {
  const tracker = useAffinageTracker();

  if (tracker.isLoading) {
    return (
      <div className="flex min-h-[62vh] items-center justify-center p-6">
        <div className="rounded-2xl border bg-card px-8 py-7 text-center shadow-sm">
          <Warehouse className="mx-auto mb-3 size-8 animate-pulse text-emerald-800" />
          <p className="font-semibold">Chargement des lots en affinage...</p>
        </div>
      </div>
    );
  }

  const canRelease = tracker.user?.role !== "VENTE"
    && tracker.detail?.statut !== "TERMINE"
    && tracker.detail?.quantiteRestante === 0
    && tracker.detail?.joursRestants <= 0;

  return (
    <div className="relative mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-6">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {tracker.loadError && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <span>{tracker.loadError}</span>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void tracker.loadCatalog(tracker.selectedId ?? undefined)}>Réessayer</Button>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
        <div className="w-full shrink-0 xl:w-72">
          <AffinageLotList
            lots={tracker.sidebarLots}
            selectedId={tracker.selectedId === null ? null : String(tracker.selectedId)}
            onSelectLot={(id) => tracker.setSelectedId(Number(id))}
            onCreateLot={() => tracker.setPlacementMode("create")}
          />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-6">
          {tracker.detail && !tracker.isDetailLoading ? (
            <>
              <AffinageLotHeader
                lot={toHeaderDetail(tracker.detail, tracker.caves)}
                onAddCare={() => tracker.setCareOpen(true)}
                onPlaceRemaining={() => tracker.setPlacementMode("remaining")}
                onMove={() => tracker.setPlacementMode("move")}
                onRelease={() => tracker.setReleaseOpen(true)}
                canRelease={canRelease}
              />
              <AffinageCareJournal
                summary={toCareSummary(tracker.detail.soins, tracker.detail.etatCroute)}
                logs={toCareLogs(tracker.detail.soins)}
              />
            </>
          ) : tracker.selectedId !== null ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">Chargement du lot...</div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 p-8 text-center">
              <Warehouse className="mb-3 size-9 text-emerald-800" />
              <h2 className="font-semibold">Aucun lot en affinage</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Commencez par mettre une fabrication en cave afin de suivre ses placements et ses soins.
              </p>
              <Button className="mt-5 rounded-lg" onClick={() => tracker.setPlacementMode("create")}>Mettre un lot en affinage</Button>
            </div>
          )}
        </div>
      </div>

      {tracker.detail && (
        <AddCareDialog open={tracker.careOpen} onOpenChange={tracker.setCareOpen} onSubmitCare={tracker.handleAddCare} />
      )}
      <AffinagePlacementDialog
        open={tracker.placementMode !== null}
        mode={tracker.placementMode ?? "create"}
        fabrications={tracker.availableFabrications}
        caves={tracker.caves}
        excludedCaveIds={tracker.placementMode === "remaining" ? tracker.usedCaveIds : undefined}
        quantity={tracker.placementMode === "remaining" ? tracker.detail?.quantiteRestante : tracker.placementMode === "move" ? tracker.detail?.quantitePlacee : undefined}
        onOpenChange={(open) => !open && tracker.setPlacementMode(null)}
        onSubmit={tracker.handlePlacement}
      />
      {tracker.detail && (
        <SortieAffinageDialog
          open={tracker.releaseOpen}
          lotCode={tracker.detail.numeroLot}
          quantity={tracker.detail.quantitePlacee}
          emplacements={tracker.stockLocations}
          onOpenChange={tracker.setReleaseOpen}
          onSubmit={tracker.handleRelease}
          canCreateLocation={tracker.user?.role === "PROPRIETAIRE"}
          onCreateLocation={tracker.handleCreateStockLocation}
        />
      )}
    </div>
  );
}
