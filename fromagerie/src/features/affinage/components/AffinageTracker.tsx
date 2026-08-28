import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Warehouse } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "../../../components/ui/button";
import { affinageApi } from "../api/affinageApi";
import { stockApi, type EmplacementStock, type SortieAffinageRequest } from "../../stocks/api/stockApi";
import type {
  AffinageDetail,
  AffinageListItem,
  CreateAffinageRequest,
  PlacementRequest,
  SoinAffinage,
  TypeSoinAffinage,
} from "../types/affinage.types";
import type { CaveApiResponse } from "../types/cave.types";
import type { FabricationListItem } from "../../fabrications/types/fabrication.types";
import { AddCareDialog, type CareData } from "./AddCareDialog";
import {
  AffinageCareJournal,
  type CareLogEntry,
  type CareSummary,
} from "./AffinageCareJournal";
import { AffinageLotHeader, type LotAffinageDetail } from "./AffinageLotHeader";
import { AffinageLotList, type AffinageLotItem } from "./AffinageLotList";
import {
  AffinagePlacementDialog,
  type PlacementDialogMode,
} from "./AffinagePlacementDialog";
import { SortieAffinageDialog } from "./SortieAffinageDialog";
import { useAuth } from "../../authentication/hooks/useAuth";

const CARE_LABELS: Record<TypeSoinAffinage, string> = {
  RETOURNEMENT: "Retournement",
  LAVAGE: "Lavage",
  BROSSAGE: "Brossage",
  OBSERVATION: "Observation",
  AUTRE: "Autre",
};

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00`).getTime();
  const endDate = new Date(`${end}T12:00:00`).getTime();
  return Math.max(0, Math.round((endDate - startDate) / 86_400_000));
}

function toHeaderDetail(detail: AffinageDetail, caves: CaveApiResponse[]): LotAffinageDetail {
  const totalDays = Math.max(1, daysBetween(detail.dateMiseEnCave, detail.dateSortiePrevue));
  const daysElapsed = Math.min(totalDays, daysBetween(detail.dateMiseEnCave, new Date().toISOString().slice(0, 10)));
  const locations = detail.placementsActifs.map(
    (placement) => `${placement.caveNom} · E${placement.etagereNumero}-R${placement.rangeeNumero} · ${placement.positionDebut}-${placement.positionFin}`
  );
  const currentCave = caves.find((cave) => cave.id === detail.placementsActifs[0]?.caveId);

  return {
    id: String(detail.id),
    batchCode: detail.numeroLot,
    recipeName: detail.fromageNom,
    variant: detail.recetteNom,
    pieceCount: detail.quantiteInitiale,
    operator: detail.operateurNom,
    location: locations.length > 0 ? locations.join(" ; ") : "En attente de placement",
    entryDate: formatDate(detail.dateMiseEnCave),
    expectedExitDate: formatDate(detail.dateSortiePrevue),
    daysRemaining: detail.joursRestants,
    daysElapsed,
    totalDays,
    caveTargetInfo: currentCave
      ? `${currentCave.nom} · ${currentCave.temperature} °C · ${currentCave.humidite} % HR`
      : "Aucune cave active pour ce lot",
    quantityRemaining: detail.quantiteRestante,
    quantityPlaced: detail.quantitePlacee,
  };
}

function toCareSummary(soins: SoinAffinage[], rindState: string | null): CareSummary {
  const lastFlip = soins.find((care) => care.type === "RETOURNEMENT");
  const lastWashing = soins.find((care) => care.type === "LAVAGE");
  return {
    lastFlip: lastFlip ? formatDate(lastFlip.dateHeure) : "Jamais",
    lastWashing: lastWashing ? formatDate(lastWashing.dateHeure) : "Jamais",
    rindState: rindState || "Non renseigné",
  };
}

function toCareLogs(soins: SoinAffinage[]): CareLogEntry[] {
  return soins.map((care) => ({
    id: String(care.id),
    type: CARE_LABELS[care.type],
    date: formatDate(care.dateHeure),
    operator: care.utilisateurNom,
    rindState: care.etatCroute ?? undefined,
    notes: care.observation ?? undefined,
  }));
}

function toCareType(label: string): TypeSoinAffinage {
  if (label === "Retournement") return "RETOURNEMENT";
  if (label === "Lavage") return "LAVAGE";
  if (label === "Brossage") return "BROSSAGE";
  if (label === "Observation") return "OBSERVATION";
  return "AUTRE";
}

export default function AffinageTracker() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [lots, setLots] = useState<AffinageListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AffinageDetail | null>(null);
  const [fabrications, setFabrications] = useState<FabricationListItem[]>([]);
  const [caves, setCaves] = useState<CaveApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [careOpen, setCareOpen] = useState(false);
  const [placementMode, setPlacementMode] = useState<PlacementDialogMode | null>(null);
  const [stockLocations, setStockLocations] = useState<EmplacementStock[]>([]);
  const [releaseOpen, setReleaseOpen] = useState(false);

  useEffect(() => {
    const lotParam = searchParams.get("lot");
    if (!lotParam) return;
    const candidate = Number(lotParam);
    if (!Number.isNaN(candidate)) {
      setSelectedId(candidate);
    }
  }, [searchParams]);

  const loadCatalog = async (preferredId?: number): Promise<number | null> => {
    setLoadError(null);
    try {
      const [nextLots, nextFabrications, nextCaves, nextStockLocations] = await Promise.all([
        affinageApi.findAll(),
        affinageApi.findFabrications(),
        affinageApi.findCaves(),
        stockApi.findEmplacements(),
      ]);
      setLots(nextLots.filter((lot) => lot.statut !== "TERMINE"));
      setFabrications(nextFabrications);
      setCaves(nextCaves);
      setStockLocations(nextStockLocations);
      const nextSelectedId = nextLots.some((lot) => lot.id === (preferredId ?? selectedId))
        ? (preferredId ?? selectedId)
        : nextLots[0]?.id ?? null;
      setSelectedId(() => {
        return nextSelectedId;
      });
      return nextSelectedId;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Chargement du suivi impossible.");
    } finally {
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let active = true;
    setIsDetailLoading(true);
    affinageApi.findById(selectedId)
      .then((nextDetail) => active && setDetail(nextDetail))
      .catch((error) => active && toast.error(error instanceof Error ? error.message : "Chargement du lot impossible."))
      .finally(() => active && setIsDetailLoading(false));
    return () => {
      active = false;
    };
  }, [selectedId]);

  const availableFabrications = useMemo(() => {
    const usedIds = new Set(lots.map((lot) => lot.fabricationId));
    return fabrications.filter((fabrication) => !usedIds.has(fabrication.id));
  }, [fabrications, lots]);

  const usedCaveIds = useMemo(
    () => [...new Set(detail?.placementsActifs.map((placement) => placement.caveId) ?? [])],
    [detail],
  );

  const sidebarLots: AffinageLotItem[] = lots.map((lot) => ({
    id: String(lot.id),
    batchCode: lot.numeroLot,
    recipeName: lot.fromageNom,
    variant: lot.recetteNom,
    daysRemaining: lot.joursRestants,
    totalDays: daysBetween(lot.dateMiseEnCave, lot.dateSortiePrevue),
  }));

  const refreshSelected = async (id: number) => {
    const [nextDetail] = await Promise.all([affinageApi.findById(id), loadCatalog(id)]);
    setDetail(nextDetail);
    return nextDetail;
  };

  const proposeRemainingPlacement = (nextDetail: AffinageDetail) => {
    setDetail(nextDetail);
    window.setTimeout(() => setPlacementMode("remaining"), 0);
  };

  const handlePlacement = async (request: CreateAffinageRequest | PlacementRequest) => {
    try {
      if (placementMode === "create") {
        const created = await affinageApi.create(request as CreateAffinageRequest);
        await loadCatalog(created.id);
        setDetail(created);
        if (created.quantiteRestante > 0) {
          toast.warning(
            `${created.quantitePlacee} fromage(s) placé(s), choisissez une autre cave pour les ${created.quantiteRestante} restant(s).`,
          );
          proposeRemainingPlacement(created);
        } else {
          toast.success("Lot mis en affinage.");
        }
        return;
      }
      if (selectedId === null) return;
      const placement = request as PlacementRequest;
      const result = placementMode === "move"
          ? await affinageApi.move(selectedId, {
            caveDestinationId: placement.caveId,
            rangeeDepartId: placement.rangeeDepartId,
          })
        : await affinageApi.place(selectedId, placement);
      const nextDetail = await refreshSelected(selectedId);
      if (result.placementComplet) {
        toast.success(placementMode === "move" ? "Lot déplacé." : "Placement terminé.");
      } else {
        toast.warning(
          `${result.quantitePlacee} fromage(s) placé(s), choisissez une autre cave pour les ${result.quantiteRestante} restant(s).`,
        );
        proposeRemainingPlacement(nextDetail);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
      throw error;
    }
  };

  const handleAddCare = async (care: CareData) => {
    if (selectedId === null) return;
    try {
      await affinageApi.addCare(selectedId, {
        type: toCareType(care.type),
        dateHeure: `${care.date}T12:00:00`,
        observation: care.notes || null,
        etatCroute: care.rindState || null,
      });
      await refreshSelected(selectedId);
      toast("Soin ajouté au journal.", {
        icon: <CheckCircle2 className="size-5 text-emerald-800" />,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ajout du soin impossible.");
      throw error;
    }
  };

  const handleRelease = async (request: SortieAffinageRequest) => {
    if (selectedId === null) return;
    try {
      await stockApi.sortirAffinage(selectedId, request);
      setDetail(null);
      const nextSelectedId = await loadCatalog();
      if (nextSelectedId !== null) {
        setIsDetailLoading(true);
        try {
          setDetail(await affinageApi.findById(nextSelectedId));
        } finally {
          setIsDetailLoading(false);
        }
      }
      setReleaseOpen(false);
      toast.success("Affinage sorti et stock fini créé.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sortie de l'affinage impossible.");
      throw error;
    }
  };

  const handleCreateStockLocation = async (request: { nom: string; description?: string }) => {
    try {
      const created = await stockApi.createEmplacement(request);
      setStockLocations((current) => [...current, created].sort((left, right) => left.nom.localeCompare(right.nom)));
      toast.success("Emplacement stock créé.");
      return created;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Création de l'emplacement impossible.");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[62vh] items-center justify-center p-6">
        <div className="rounded-2xl border bg-card px-8 py-7 text-center shadow-sm">
          <Warehouse className="mx-auto mb-3 size-8 animate-pulse text-emerald-800" />
          <p className="font-semibold">Chargement des lots en affinage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-6">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {loadError && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={() => void loadCatalog()}>Réessayer</Button>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
        <div className="w-full shrink-0 xl:w-72">
          <AffinageLotList
            lots={sidebarLots}
            selectedId={selectedId === null ? null : String(selectedId)}
            onSelectLot={(id) => setSelectedId(Number(id))}
            onCreateLot={() => setPlacementMode("create")}
          />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-6">
          {detail && !isDetailLoading ? (
            <>
              <AffinageLotHeader
                lot={toHeaderDetail(detail, caves)}
                onAddCare={() => setCareOpen(true)}
                onPlaceRemaining={() => setPlacementMode("remaining")}
                onMove={() => setPlacementMode("move")}
                onRelease={() => setReleaseOpen(true)}
                canRelease={user?.role !== "VENTE" && detail.statut !== "TERMINE" && detail.quantiteRestante === 0 && detail.joursRestants <= 0}
              />
              <AffinageCareJournal
                summary={toCareSummary(detail.soins, detail.etatCroute)}
                logs={toCareLogs(detail.soins)}
              />
            </>
          ) : selectedId !== null ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
              Chargement du lot...
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 p-8 text-center">
              <Warehouse className="mb-3 size-9 text-emerald-800" />
              <h2 className="font-semibold">Aucun lot en affinage</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Commencez par mettre une fabrication en cave afin de suivre ses placements et ses soins.
              </p>
              <Button className="mt-5" onClick={() => setPlacementMode("create")}>Mettre un lot en affinage</Button>
            </div>
          )}
        </div>
      </div>

      <AddCareDialog
        open={careOpen}
        onOpenChange={setCareOpen}
        onSubmitCare={handleAddCare}
      />
      <AffinagePlacementDialog
        open={placementMode !== null}
        mode={placementMode ?? "create"}
        fabrications={availableFabrications}
        caves={caves}
        excludedCaveIds={placementMode === "remaining" ? usedCaveIds : undefined}
        quantity={placementMode === "remaining" ? detail?.quantiteRestante : placementMode === "move" ? detail?.quantitePlacee : undefined}
        onOpenChange={(open) => !open && setPlacementMode(null)}
        onSubmit={handlePlacement}
      />
      {detail && (
        <SortieAffinageDialog
          open={releaseOpen}
          lotCode={detail.numeroLot}
          quantity={detail.quantitePlacee}
          emplacements={stockLocations}
          onOpenChange={setReleaseOpen}
          onSubmit={handleRelease}
          canCreateLocation={user?.role === "PROPRIETAIRE"}
          onCreateLocation={handleCreateStockLocation}
        />
      )}
    </div>
  );
}
