import { useEffect, useState } from "react";

import { fabricationApi } from "../api/fabricationApi";
import type {
  CreateFabricationRequest,
  FabricationDetail,
  FabricationListItem,
  RecetteOption,
} from "../types/fabrication.types";

export function useFabrications() {
  const [fabrications, setFabrications] = useState<FabricationListItem[]>([]);
  const [recettes, setRecettes] = useState<RecetteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecettes, setIsLoadingRecettes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recettesError, setRecettesError] = useState<string | null>(null);

  const loadFabrications = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setFabrications(await fabricationApi.findAll());
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecettes = async (): Promise<void> => {
    setIsLoadingRecettes(true);
    setRecettesError(null);

    try {
      setRecettes(await fabricationApi.findRecettes());
    } catch (requestError: unknown) {
      setRecettesError(
        requestError instanceof Error ? requestError.message : "Chargement des recettes impossible.",
      );
    } finally {
      setIsLoadingRecettes(false);
    }
  };

  useEffect(() => {
    void loadFabrications();
    void loadRecettes();
  }, []);

  const createFabrication = async (
    request: CreateFabricationRequest,
  ): Promise<FabricationDetail> => {
    const created = await fabricationApi.create(request);
    await loadFabrications();
    return created;
  };

  const updateFabrication = async (id: number, request: CreateFabricationRequest): Promise<FabricationDetail> => {
    const updated = await fabricationApi.update(id, request);
    await loadFabrications();
    return updated;
  };

  const deleteFabrication = async (id: number): Promise<void> => {
    await fabricationApi.delete(id);
    await loadFabrications();
  };

  return {
    fabrications,
    recettes,
    isLoading,
    isLoadingRecettes,
    error,
    recettesError,
    loadFabrications,
    loadRecettes,
    createFabrication,
    updateFabrication,
    deleteFabrication,
  };
}
