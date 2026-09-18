import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Factory, Milk, PackageCheck, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { affinageApi } from "../../affinage/api/affinageApi";
import { AffinagePlacementDialog } from "../../affinage/components/AffinagePlacementDialog";
import type { CreateAffinageRequest, PlacementRequest } from "../../affinage/types/affinage.types";
import type { CaveApiResponse } from "../../affinage/types/cave.types";
import { FabricationCard } from "./FabricationCard";
import FabricationCreateModal from "./FabricationCreateModal";
import { FabricationDetailsModal } from "./FabricationDetailsModal";
import { useFabrications } from "../hooks/useFabrications";
import { fabricationApi } from "../api/fabricationApi";
import type { CreateFabricationRequest, FabricationListItem } from "../types/fabrication.types";
import { formatNumber } from "../utils/fabricationFormatters";
import type { FabricationDetail } from "../types/fabrication.types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

const PAGE_SIZE = 6;

export default function FabricationManager() {
  const {
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
  } = useFabrications();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFabricationId, setSelectedFabricationId] = useState<number | null>(null);
  const [affinageFabrication, setAffinageFabrication] = useState<FabricationListItem | null>(null);
  const [affinageFabricationIds, setAffinageFabricationIds] = useState<Set<number>>(new Set());
  const [isAffinageCatalogLoaded, setIsAffinageCatalogLoaded] = useState(false);
  const [caves, setCaves] = useState<CaveApiResponse[]>([]);
  const [preparingAffinageId, setPreparingAffinageId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingFabrication, setEditingFabrication] = useState<FabricationDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FabricationListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totals = useMemo(
    () => ({
      milk: fabrications.reduce((total, item) => total + item.quantiteLait, 0),
      cheeses: fabrications.reduce((total, item) => total + item.nombreFromages, 0),
    }),
    [fabrications],
  );

  const filteredFabrications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return fabrications;
    return fabrications.filter((item) =>
      [item.numeroLot, item.fromageNom, item.recetteNom, item.operateurNom]
        .some((value) => value.toLocaleLowerCase("fr").includes(query)),
    );
  }, [fabrications, search]);
  const pageCount = Math.max(1, Math.ceil(filteredFabrications.length / PAGE_SIZE));
  const visibleFabrications = filteredFabrications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);

  useEffect(() => {
    let active = true;
    affinageApi.findAll()
      .then((lots) => {
        if (active) {
          setAffinageFabricationIds(new Set(lots.map((lot) => lot.fabricationId)));
          setIsAffinageCatalogLoaded(true);
        }
      })
      .catch(() => {
        if (active) toast.error("Impossible de vérifier les fabrications déjà en affinage.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (request: CreateFabricationRequest): Promise<void> => {
    const created = await createFabrication(request);
    toast.success(`Fabrication ${created.numeroLot} enregistrée avec succès.`);
  };

  const openEdit = async (fabrication: FabricationListItem) => {
    try {
      setEditingFabrication(await fabricationApi.findById(fabrication.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement de la fabrication impossible.");
    }
  };

  const handleUpdate = async (request: CreateFabricationRequest) => {
    if (!editingFabrication) return;
    const updated = await updateFabrication(editingFabrication.id, request);
    toast.success(`Fabrication ${updated.numeroLot} modifiée.`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFabrication(deleteTarget.id);
      toast.success(`Fabrication ${deleteTarget.numeroLot} supprimée.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible.");
    } finally {
      setIsDeleting(false);
    }
  };

  const prepareAffinage = async (fabrication: FabricationListItem) => {
    setPreparingAffinageId(fabrication.id);
    try {
      setCaves(await affinageApi.findCaves());
      setAffinageFabrication(fabrication);
    } catch (requestError) {
      toast.error(requestError instanceof Error
        ? requestError.message
        : "Impossible de charger les caves disponibles.");
    } finally {
      setPreparingAffinageId(null);
    }
  };

  const createAffinage = async (request: CreateAffinageRequest | PlacementRequest) => {
    if (affinageFabrication === null) return;
    await affinageApi.create(request as CreateAffinageRequest);
    setAffinageFabricationIds((ids) => new Set(ids).add(affinageFabrication.id));
    toast.success("La fabrication a été mise en affinage.");
  };

  return (
    <div className="min-h-[calc(100vh-7.5rem)] w-full space-y-6 py-4 sm:py-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Traçabilité de production
          </p>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Factory className="size-7 shrink-0 text-primary" />
            Registre des fabrications
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Consultez les lots enregistrés et saisissez les paramètres réels de fabrication.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setCreateOpen(true)}
          className="min-h-12 w-full rounded-full px-5 sm:w-auto"
        >
          <Plus className="size-5" /> Nouvelle fabrication
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Synthèse des fabrications">
        <SummaryCard
          icon={<Factory className="size-5" />}
          label="Lots enregistrés"
          value={String(fabrications.length)}
        />
        <SummaryCard
          icon={<Milk className="size-5" />}
          label="Lait transformé"
          value={`${formatNumber(totals.milk)} L`}
        />
        <SummaryCard
          icon={<PackageCheck className="size-5" />}
          label="Fromages produits"
          value={formatNumber(totals.cheeses)}
        />
      </section>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un lot, un fromage, une recette..."
          aria-label="Rechercher une fabrication"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-border/70 bg-card/60 p-10 text-center text-sm text-muted-foreground"
        >
          Chargement des fabrications...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-medium text-foreground">Impossible de charger les fabrications.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={loadFabrications}>
            <RefreshCw className="size-4" /> Réessayer
          </Button>
        </div>
      ) : fabrications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/35 bg-primary/[0.03] p-10 text-center">
          <Factory className="mx-auto size-9 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Aucune fabrication enregistrée.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enregistrez le premier lot pour démarrer le registre de traçabilité.
          </p>
          <Button type="button" size="lg" className="mt-5 min-h-12" onClick={() => setCreateOpen(true)}>
            <Plus className="size-5" /> Créer la première fabrication
          </Button>
        </div>
      ) : filteredFabrications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucune fabrication ne correspond à « {search} ».
        </div>
      ) : (<>
        <ul className="grid gap-4 lg:grid-cols-2" aria-label="Liste des fabrications">
          {visibleFabrications.map((fabrication) => (
            <FabricationCard
              key={fabrication.id}
              fabrication={fabrication}
              onSelect={setSelectedFabricationId}
              canStartAffinage={isAffinageCatalogLoaded && !affinageFabricationIds.has(fabrication.id)}
              isPreparingAffinage={preparingAffinageId === fabrication.id}
              onStartAffinage={(item) => void prepareAffinage(item)}
              onEdit={(item) => void openEdit(item)}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
        {pageCount > 1 && <nav aria-label="Pagination des fabrications" className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="icon" aria-label="Page précédente" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-medium">Page {page} sur {pageCount}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Page suivante" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4" /></Button>
        </nav>}
      </>)}

      <FabricationCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
        recettes={recettes}
        isLoadingRecettes={isLoadingRecettes}
        recettesError={recettesError}
        onRetryRecettes={loadRecettes}
      />

      <FabricationDetailsModal
        fabricationId={selectedFabricationId}
        onClose={() => setSelectedFabricationId(null)}
      />

      <FabricationCreateModal
        key={editingFabrication?.id ?? "edit-fabrication"}
        open={editingFabrication !== null}
        onOpenChange={(open) => !open && setEditingFabrication(null)}
        onCreate={handleUpdate}
        fabrication={editingFabrication}
        recettes={recettes}
        isLoadingRecettes={isLoadingRecettes}
        recettesError={recettesError}
        onRetryRecettes={loadRecettes}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer cette fabrication ?</AlertDialogTitle><AlertDialogDescription>Le lot {deleteTarget?.numeroLot} sera définitivement supprimé. Cette action est impossible dès son passage en affinage.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel><AlertDialogAction disabled={isDeleting} onClick={(event) => { event.preventDefault(); void confirmDelete(); }} className="bg-destructive text-white hover:bg-destructive/90">{isDeleting ? "Suppression..." : "Supprimer"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {affinageFabrication && (
        <AffinagePlacementDialog
          open
          mode="create"
          fabrications={[affinageFabrication]}
          caves={caves}
          onOpenChange={(open) => !open && setAffinageFabrication(null)}
          onSubmit={createAffinage}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
