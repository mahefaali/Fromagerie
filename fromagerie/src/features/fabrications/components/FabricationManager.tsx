import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Factory, Milk, PackageCheck, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { CompactFilterCard } from "../../../components/ui/compact-filter-card";
import { PaginationControls } from "../../../components/ui/pagination-controls";
import { affinageApi } from "../../affinage/api/affinageApi";
import { AffinagePlacementDialog } from "../../affinage/components/AffinagePlacementDialog";
import type { CreateAffinageRequest, PlacementRequest, StatutLotAffinage } from "../../affinage/types/affinage.types";
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
type FabricationStatusFilter = "all" | "fabrique" | "affinage" | "termine";

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
  const [affinageStatuses, setAffinageStatuses] = useState<Map<number, StatutLotAffinage>>(new Map());
  const [isAffinageCatalogLoaded, setIsAffinageCatalogLoaded] = useState(false);
  const [caves, setCaves] = useState<CaveApiResponse[]>([]);
  const [preparingAffinageId, setPreparingAffinageId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FabricationStatusFilter>("all");
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

  const statusCounts = useMemo(() => fabrications.reduce(
    (counts, item) => {
      const status = affinageStatuses.get(item.id);
      if (!status) counts.fabrique += 1;
      else if (status === "TERMINE") counts.termine += 1;
      else counts.affinage += 1;
      return counts;
    },
    { fabrique: 0, affinage: 0, termine: 0 },
  ), [affinageStatuses, fabrications]);

  const filteredFabrications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return fabrications.filter((item) => {
      const affinageStatus = affinageStatuses.get(item.id);
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "fabrique" && !affinageStatus)
        || (statusFilter === "affinage" && Boolean(affinageStatus) && affinageStatus !== "TERMINE")
        || (statusFilter === "termine" && affinageStatus === "TERMINE");
      const matchesSearch = !query || [item.numeroLot, item.fromageNom, item.recetteNom, item.operateurNom]
        .some((value) => value.toLocaleLowerCase("fr").includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [affinageStatuses, fabrications, search, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredFabrications.length / PAGE_SIZE));
  const visibleFabrications = filteredFabrications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);

  useEffect(() => {
    let active = true;
    affinageApi.findAll()
      .then((lots) => {
        if (active) {
          setAffinageStatuses(new Map(lots.map((lot) => [lot.fabricationId, lot.statut])));
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
    const created = await affinageApi.create(request as CreateAffinageRequest);
    setAffinageStatuses((statuses) => new Map(statuses).set(affinageFabrication.id, created.statut));
    toast.success("La fabrication a été mise en affinage.");
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-7.5rem)] w-full max-w-[1440px] space-y-5 py-3 sm:py-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Traçabilité de production
          </p>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <Factory className="size-6 shrink-0 text-primary" />
            Registre des fabrications
          </h2>
          <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Consultez les lots enregistrés et saisissez les paramètres réels de fabrication.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="min-h-11 w-full rounded-full px-4 sm:w-auto"
        >
          <Plus className="size-4" /> Nouvelle fabrication
        </Button>
      </header>

      <div className="space-y-5 pl-2 sm:pl-3 lg:pl-4">
      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Synthèse des fabrications">
        <SummaryCard icon={<Factory />} label="Lots enregistrés" value={String(fabrications.length)} />
        <SummaryCard icon={<Milk />} label="Lait transformé" value={`${formatNumber(totals.milk)} L`} />
        <SummaryCard icon={<PackageCheck />} label="Fromages produits" value={formatNumber(totals.cheeses)} />
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <section className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Filtrer les fabrications par statut">
          <CompactFilterCard icon={<Factory />} label="Fabriqué" tone="amber" value={statusCounts.fabrique} active={statusFilter === "fabrique"} onClick={() => setStatusFilter((current) => current === "fabrique" ? "all" : "fabrique")} />
          <CompactFilterCard icon={<RefreshCw />} label="En affinage" tone="sky" value={statusCounts.affinage} active={statusFilter === "affinage"} onClick={() => setStatusFilter((current) => current === "affinage" ? "all" : "affinage")} />
          <CompactFilterCard icon={<CheckCircle2 />} label="Terminé" tone="green" value={statusCounts.termine} active={statusFilter === "termine"} onClick={() => setStatusFilter((current) => current === "termine" ? "all" : "termine")} />
        </section>

        <div className="relative w-full lg:ml-auto lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un lot, un fromage, une recette..."
            aria-label="Rechercher une fabrication"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-border/70 bg-card/60 p-6 text-center text-sm text-muted-foreground sm:p-8"
        >
          Chargement des fabrications...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-foreground">Impossible de charger les fabrications.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={loadFabrications}>
            <RefreshCw className="size-4" /> Réessayer
          </Button>
        </div>
      ) : fabrications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/35 bg-primary/[0.03] p-6 text-center sm:p-8">
          <Factory className="mx-auto size-8 text-primary" />
          <h3 className="mt-3 text-base font-semibold">Aucune fabrication enregistrée.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enregistrez le premier lot pour démarrer le registre de traçabilité.
          </p>
          <Button type="button" className="mt-4 min-h-11" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Créer la première fabrication
          </Button>
        </div>
      ) : filteredFabrications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:p-8">
          Aucune fabrication ne correspond aux filtres sélectionnés{search ? ` pour « ${search} »` : ""}.
        </div>
      ) : (<>
        <ul className="grid gap-3 xl:grid-cols-2" aria-label="Liste des fabrications">
          {visibleFabrications.map((fabrication) => (
            <FabricationCard
              key={fabrication.id}
              fabrication={fabrication}
              onSelect={setSelectedFabricationId}
              canStartAffinage={isAffinageCatalogLoaded && !affinageStatuses.has(fabrication.id)}
              isPreparingAffinage={preparingAffinageId === fabrication.id}
              onStartAffinage={(item) => void prepareAffinage(item)}
              onEdit={(item) => void openEdit(item)}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
        <div className="flex justify-end pb-16 lg:pb-12"><PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} label="Pagination des fabrications" /></div>
      </>)}
      </div>

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

function SummaryCard({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-3 shadow-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-4">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
