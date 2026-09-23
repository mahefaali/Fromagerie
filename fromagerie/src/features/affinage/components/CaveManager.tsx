import { LoaderCircle, Plus, Warehouse } from "lucide-react";


import { Button } from "../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

import { CaveSidebar } from "./CaveSidebar";
import { CaveHeaderCard } from "./CaveHeaderCard";
import { CaveGridPlan } from "./CaveGridPlan";
import { CaveDialog } from "./CaveDialog";

import { useCaveManager } from "./cave-manager/useCaveManager";

export function CaveManager() {
  const manager = useCaveManager();
  const {
    isOwner, caves, setSelectedId, selectedCave, isLoading, loadError,
    loadCaves, caveDialogOpen, setCaveDialogOpen, editingCave, setEditingCave,
    deleteDialogOpen, setDeleteDialogOpen, occupations, isLoadingOccupations,
    occupationError, loadOccupations, handleSaveCave, handleDeleteCave,
  } = manager;

  if (isLoading) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="relative flex min-h-[calc(100svh-8rem)] items-center justify-center overflow-hidden py-12 md:min-h-[calc(100svh-10rem)]"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl" />

        <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-border/60 bg-card/80 px-6 py-8 text-center shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.5)] backdrop-blur-sm">
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
        <div className="grid min-w-0 gap-4 py-3 xl:grid-cols-[250px_minmax(0,1fr)] xl:items-start">
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

        <section className="min-w-0 space-y-3">
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
        <section className="relative mx-auto my-5 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_70px_-45px_hsl(var(--foreground)/0.45)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
            <div className="mb-6 grid size-20 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <Warehouse className="size-9" strokeWidth={1.7} />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Référentiel des caves
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la cave ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Préférez désactiver une cave qui doit rester dans l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => { event.preventDefault(); void handleDeleteCave(); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
