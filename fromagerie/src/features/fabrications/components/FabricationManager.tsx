import { useMemo, useState } from "react";
import { Factory, Milk, PackageCheck, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { FabricationCard } from "./FabricationCard";
import FabricationCreateModal from "./FabricationCreateModal";
import { FabricationDetailsModal } from "./FabricationDetailsModal";
import { useFabrications } from "../hooks/useFabrications";
import type { CreateFabricationRequest } from "../types/fabrication.types";
import { formatNumber } from "../utils/fabricationFormatters";

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
  } = useFabrications();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFabricationId, setSelectedFabricationId] = useState<number | null>(null);

  const totals = useMemo(
    () => ({
      milk: fabrications.reduce((total, item) => total + item.quantiteLait, 0),
      cheeses: fabrications.reduce((total, item) => total + item.nombreFromages, 0),
    }),
    [fabrications],
  );

  const handleCreate = async (request: CreateFabricationRequest): Promise<void> => {
    const created = await createFabrication(request);
    toast.success(`Fabrication ${created.numeroLot} enregistrée avec succès.`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-4 sm:px-6 sm:py-6">
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
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2" aria-label="Liste des fabrications">
          {fabrications.map((fabrication) => (
            <FabricationCard
              key={fabrication.id}
              fabrication={fabrication}
              onSelect={setSelectedFabricationId}
            />
          ))}
        </ul>
      )}

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
