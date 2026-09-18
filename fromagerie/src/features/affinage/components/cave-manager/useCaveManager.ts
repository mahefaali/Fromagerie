import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../../authentication/hooks/useAuth";
import { caveApi } from "../../api/caveApi";
import type { Cave } from "../../domain/cave";
import type { CaveOccupation } from "../../types/cave.types";

const MIN_LOADING_DURATION_MS = 700;
const waitForMinimumLoadingDuration = (): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_DURATION_MS));

export function useCaveManager() {
  const { user } = useAuth();
  const isOwner = user?.role === "PROPRIETAIRE";
  const [caves, setCaves] = useState<Cave[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [caveDialogOpen, setCaveDialogOpen] = useState(false);
  const [editingCave, setEditingCave] = useState<Cave | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [occupations, setOccupations] = useState<CaveOccupation[]>([]);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  const [occupationError, setOccupationError] = useState<string | null>(null);
  const occupationRequestId = useRef(0);

  const loadCaves = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [loaded] = await Promise.all([
        caveApi.findAll(),
        waitForMinimumLoadingDuration(),
      ]);
      setCaves(loaded);
      setSelectedId((current) => loaded.some((cave) => cave.id === current)
        ? current
        : loaded[0]?.id ?? "");
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : "Chargement des caves impossible.");
    } finally {
      setIsLoading(false);
    }
  };

  const initialize = useEffectEvent(() => {
    void loadCaves();
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!caves.find((c) => c.id === selectedId) && caves[0]) {
      setSelectedId(caves[0].id);
    }
  }, [caves, selectedId]);

  const selectedCave = useMemo(
    () => caves.find((c) => c.id === selectedId) ?? caves[0],
    [caves, selectedId]
  );

  const loadOccupations = useCallback(async (caveId: string): Promise<void> => {
    const requestId = ++occupationRequestId.current;
    setIsLoadingOccupations(true);
    setOccupationError(null);
    try {
      const loaded = await caveApi.findOccupations(caveId);
      if (requestId === occupationRequestId.current) setOccupations(loaded);
    } catch (error: unknown) {
      if (requestId === occupationRequestId.current) {
        setOccupations([]);
        setOccupationError(error instanceof Error ? error.message : "Chargement des occupations impossible.");
      }
    } finally {
      if (requestId === occupationRequestId.current) setIsLoadingOccupations(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCave) {
      occupationRequestId.current++;
      setOccupations([]);
      setIsLoadingOccupations(false);
      setOccupationError(null);
      return;
    }
    void loadOccupations(selectedCave.id);
  }, [selectedCave, loadOccupations]);

  const handleSaveCave = useCallback(async (cave: Cave) => {
    try {
      const saved = editingCave ? await caveApi.update(cave) : await caveApi.create(cave);
      setCaves((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists
          ? current.map((item) => item.id === saved.id ? saved : item)
          : [...current, saved].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      });
      setSelectedId(saved.id);
      setCaveDialogOpen(false);
      toast.success(editingCave ? "Cave modifiée." : "Cave créée.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    }
  }, [editingCave]);


  const handleDeleteCave = async (): Promise<void> => {
    if (!selectedCave) return;
    try {
      await caveApi.remove(selectedCave.id);
      setCaves((current) => current.filter((cave) => cave.id !== selectedCave.id));
      setDeleteDialogOpen(false);
      toast.success("Cave supprimée.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible.");
    }
  };

  return {
    isOwner, caves, selectedId, setSelectedId, selectedCave, isLoading, loadError,
    loadCaves, caveDialogOpen, setCaveDialogOpen, editingCave, setEditingCave,
    deleteDialogOpen, setDeleteDialogOpen, occupations, isLoadingOccupations,
    occupationError, loadOccupations, handleSaveCave, handleDeleteCave,
  };
}
