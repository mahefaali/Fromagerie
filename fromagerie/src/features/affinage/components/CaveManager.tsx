import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { LoaderCircle, Plus, Warehouse } from "lucide-react";
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
import { CaveGridPlan } from "./CaveGridPlan";
import { CaveDialog } from "./CaveDialog";
import { caveApi } from "../api/caveApi";
import { useAuth } from "../../authentication/hooks/useAuth";
import { type Cave } from "../../../services/production-store";
import type { CaveOccupation } from "../types/cave.types";

const MIN_LOADING_DURATION_MS = 700;

function waitForMinimumLoadingDuration(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_DURATION_MS));
}

export function CaveManager() {
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

  if (isLoading) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="relative flex min-h-[calc(100svh-8rem)] items-center justify-center overflow-hidden py-12 md:min-h-[calc(100svh-10rem)]"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl" />

        <div className="relative flex w-full max-w-md flex-col items-center rounded-3xl border border-border/60 bg-card/80 px-8 py-12 text-center shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.5)] backdrop-blur-sm">
          <div className="relative mb-7 grid size-20 place-items-center">
            <div className="absolute inset-0 rounded-2xl border border-primary/15 bg-primary/10" />
            <Warehouse className="relative size-8 text-primary" strokeWidth={1.7} />
            <LoaderCircle className="absolute -right-1 -top-1 size-6 animate-spin text-primary motion-reduce:animate-none" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Référentiel des caves
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Chargement en cours
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nous préparons la structure de vos caves et de leurs étagères.
          </p>

          <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
                style={{ animationDelay: `${index * 180}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 p-6 text-sm text-destructive">
        <p>{loadError}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadCaves()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <>
      {selectedCave ? (
        <div className="grid gap-6 py-6 lg:grid-cols-[280px_1fr]">
          <CaveSidebar
            caves={caves}
            selectedId={selectedCave.id}
            onSelectCave={setSelectedId}
            onCreateClick={() => {
              setEditingCave(null);
              setCaveDialogOpen(true);
            }}
            canManage={isOwner}
          />

        <section className="space-y-4">
          <CaveHeaderCard
            cave={selectedCave}
            canDelete={isOwner}
            canEdit={isOwner}
            onEdit={() => {
              setEditingCave(selectedCave);
              setCaveDialogOpen(true);
            }}
            onDelete={() => setDeleteDialogOpen(true)}
          />

          <CaveGridPlan
            cave={selectedCave}
            occupations={occupations}
            isLoadingOccupations={isLoadingOccupations}
            occupationError={occupationError}
            onRetryOccupations={() => loadOccupations(selectedCave.id)}
          />
        </section>
        </div>
      ) : (
        <section className="relative mx-auto my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_24px_70px_-45px_hsl(var(--foreground)/0.45)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="mb-6 grid size-20 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <Warehouse className="size-9" strokeWidth={1.7} />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Référentiel des caves
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Aucune cave configurée
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              {isOwner
                ? "Ajoutez votre première cave et définissez ses étagères, ses rangées et leurs capacités."
                : "Demandez au propriétaire d’ajouter les caves pour pouvoir consulter leur structure physique."}
            </p>

            {isOwner && (
              <Button
                size="lg"
                className="mt-8 rounded-xl px-6 shadow-md shadow-primary/15"
                onClick={() => {
                  setEditingCave(null);
                  setCaveDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                Ajouter une cave
              </Button>
            )}
          </div>
        </section>
      )}

      <CaveDialog
        open={caveDialogOpen}
        initial={editingCave}
        onOpenChange={setCaveDialogOpen}
        onSave={handleSaveCave}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la cave ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Préférez désactiver une cave qui doit rester dans l'historique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedCave) return;
                void caveApi.remove(selectedCave.id)
                  .then(() => {
                    setCaves((current) => current.filter((cave) => cave.id !== selectedCave.id));
                    setDeleteDialogOpen(false);
                    toast.success("Cave supprimée.");
                  })
                  .catch((error: unknown) => {
                    toast.error(error instanceof Error ? error.message : "Suppression impossible.");
                  });
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
