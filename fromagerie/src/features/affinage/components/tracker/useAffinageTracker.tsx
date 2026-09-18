import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../../authentication/hooks/useAuth";
import { stockApi, type EmplacementStock, type SortieAffinageRequest } from "../../../stocks/api/stockApi";
import type { FabricationListItem } from "../../../fabrications/types/fabrication.types";
import { affinageApi } from "../../api/affinageApi";
import type { AffinageDetail, AffinageListItem, CreateAffinageRequest, PlacementRequest } from "../../types/affinage.types";
import type { CaveApiResponse } from "../../types/cave.types";
import type { CareData } from "../AddCareDialog";
import type { AffinageLotItem } from "../AffinageLotList";
import type { PlacementDialogMode } from "../AffinagePlacementDialog";
import { daysBetween, toCareType } from "./affinageTracker.utils";

export function parseLotId(value: string | null): number | null {
  if (!value) return null;
  const lotId = Number(value);
  return Number.isInteger(lotId) && lotId > 0 ? lotId : null;
}

export function useAffinageTracker() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedLotId = parseLotId(searchParams.get("lot"));
  const initialRequestedLotId = useRef(requestedLotId);
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

  const loadCatalog = useCallback(async (preferredId?: number): Promise<number | null> => {
    setLoadError(null);
    try {
      const [nextLots, nextFabrications, nextCaves, nextStockLocations] = await Promise.all([
        affinageApi.findAll(),
        affinageApi.findFabrications(),
        affinageApi.findCaves(),
        stockApi.findEmplacements(),
      ]);
      const activeLots = nextLots.filter((lot) => lot.statut !== "TERMINE");
      setLots(activeLots);
      setFabrications(nextFabrications);
      setCaves(nextCaves);
      setStockLocations(nextStockLocations);
      const nextSelectedId = activeLots.some((lot) => lot.id === preferredId)
        ? preferredId ?? null
        : activeLots[0]?.id ?? null;
      setSelectedId(() => {
        return nextSelectedId;
      });
      return nextSelectedId;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Chargement du suivi impossible.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(initialRequestedLotId.current ?? undefined);
  }, [loadCatalog]);

  useEffect(() => {
    if (requestedLotId !== null && lots.some((lot) => lot.id === requestedLotId)) {
      setSelectedId(requestedLotId);
    }
  }, [lots, requestedLotId]);

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

  return {
    user,
    sidebarLots,
    selectedId,
    setSelectedId,
    detail,
    caves,
    isLoading,
    isDetailLoading,
    loadError,
    loadCatalog,
    careOpen,
    setCareOpen,
    placementMode,
    setPlacementMode,
    availableFabrications,
    usedCaveIds,
    stockLocations,
    releaseOpen,
    setReleaseOpen,
    handlePlacement,
    handleAddCare,
    handleRelease,
    handleCreateStockLocation,
  };
}
