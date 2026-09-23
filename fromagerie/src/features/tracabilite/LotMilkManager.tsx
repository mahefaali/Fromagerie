import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleOff, Droplets, Gauge, Milk, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { CompactFilterCard } from "../../components/ui/compact-filter-card";
import { PaginationControls } from "../../components/ui/pagination-controls";
import { useAuth } from "../authentication/hooks/useAuth";
import { tracabiliteApi } from "./api";
import { MilkAnalysisDialog } from "./components/MilkAnalysisDialog";
import { MilkLotCard } from "./components/MilkLotCard";
import { MilkLotCreateDialog } from "./components/MilkLotCreateDialog";
import type { AnalyseLaitRequest, LotLait, LotLaitRequest } from "./types";

const PAGE_SIZE = 8;
type MilkLotFilter = "all" | "unused" | "partial" | "exhausted";

function milkLotStatus(lot: LotLait): Exclude<MilkLotFilter, "all"> {
  if (lot.quantiteDisponible <= 0) return "exhausted";
  if (lot.quantiteDisponible >= lot.quantite) return "unused";
  return "partial";
}

export default function LotMilkManager() {
  const { user } = useAuth();
  const canWrite = user?.role === "PROPRIETAIRE";
  const [lots, setLots] = useState<LotLait[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [analysisLotId, setAnalysisLotId] = useState<number | null>(null);
  const [filter, setFilter] = useState<MilkLotFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadLots = useCallback(async () => {
    setLoading(true);
    try {
      setLots(await tracabiliteApi.lots());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLots(); }, [loadLots]);

  const counts = useMemo(() => lots.reduce((result, lot) => {
    result[milkLotStatus(lot)] += 1;
    return result;
  }, { unused: 0, partial: 0, exhausted: 0 }), [lots]);

  const filteredLots = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return lots.filter((lot) => {
      const matchesFilter = filter === "all" || milkLotStatus(lot) === filter;
      const searchable = `${lot.numeroLot} ${lot.typeTraite} ${new Date(lot.dateTraite).toLocaleDateString("fr-FR")}`.toLocaleLowerCase("fr");
      return matchesFilter && (!query || searchable.includes(query));
    });
  }, [filter, lots, search]);

  const pageCount = Math.max(1, Math.ceil(filteredLots.length / PAGE_SIZE));
  const visibleLots = filteredLots.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter, search]);
  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);

  async function createLot(request: LotLaitRequest) {
    try {
      await tracabiliteApi.creerLot(request);
      toast.success("Lot de lait enregistré");
      await loadLots();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
      throw error;
    }
  }

  async function createAnalysis(lotId: number, request: AnalyseLaitRequest) {
    try {
      await tracabiliteApi.ajouterAnalyse(lotId, request);
      toast.success("Analyse enregistrée");
      await loadLots();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
      throw error;
    }
  }

  return (
    <section className="mx-auto min-w-0 max-w-[1440px] py-3 sm:py-5">
      <header className="mb-4 flex flex-col items-start gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">Lots de lait</h1>
          <p className="text-sm text-[#756a57]">Traites disponibles et contrôles qualité</p>
        </div>
        {canWrite && <Button onClick={() => setCreateDialogOpen(true)} className="min-h-11 w-full rounded-full bg-[#28551c] sm:w-auto"><Plus />Nouveau lot</Button>}
      </header>

      <div className="space-y-5 pl-2 sm:pl-3 lg:pl-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Filtrer les lots de lait par utilisation">
            <CompactFilterCard icon={<Droplets />} label="Non utilisés" tone="green" value={counts.unused} active={filter === "unused"} onClick={() => setFilter((current) => current === "unused" ? "all" : "unused")} />
            <CompactFilterCard icon={<Gauge />} label="Partiellement utilisés" tone="amber" value={counts.partial} active={filter === "partial"} onClick={() => setFilter((current) => current === "partial" ? "all" : "partial")} />
            <CompactFilterCard icon={<CircleOff />} label="Épuisés" tone="red" value={counts.exhausted} active={filter === "exhausted"} onClick={() => setFilter((current) => current === "exhausted" ? "all" : "exhausted")} />
          </section>
          <div className="relative w-full lg:ml-auto lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un lot ou une traite..." aria-label="Rechercher un lot de lait" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {loading ? (
          <p role="status" className="py-8 text-center text-[#756a57]">Chargement…</p>
        ) : lots.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-[#756a57] sm:p-8"><Milk className="mx-auto mb-3 size-10" />Aucun lot de lait enregistré.</div>
        ) : filteredLots.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-[#756a57] sm:p-8">Aucun lot ne correspond aux filtres sélectionnés{search ? ` pour « ${search} »` : ""}.</div>
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleLots.map((lot) => <MilkLotCard key={lot.id} lot={lot} canAddAnalysis={canWrite} onAddAnalysis={setAnalysisLotId} />)}
            </div>
            <div className="flex justify-end pb-16 lg:pb-12">
              <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} label="Pagination des lots de lait" />
            </div>
          </>
        )}
      </div>

      {canWrite && <MilkLotCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreate={createLot} />}
      {canWrite && <MilkAnalysisDialog lotId={analysisLotId} onClose={() => setAnalysisLotId(null)} onCreate={createAnalysis} />}
    </section>
  );
}
