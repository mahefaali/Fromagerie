import { useCallback, useEffect, useState } from "react";
import { Milk, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { useAuth } from "../authentication/hooks/useAuth";
import { tracabiliteApi } from "./api";
import { MilkAnalysisDialog } from "./components/MilkAnalysisDialog";
import { MilkLotCard } from "./components/MilkLotCard";
import { MilkLotCreateDialog } from "./components/MilkLotCreateDialog";
import type { AnalyseLaitRequest, LotLait, LotLaitRequest } from "./types";

export default function LotMilkManager() {
  const { user } = useAuth();
  const canWrite = user?.role === "PROPRIETAIRE";
  const [lots, setLots] = useState<LotLait[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [analysisLotId, setAnalysisLotId] = useState<number | null>(null);

  const loadLots = useCallback(async () => {
    setLoading(true);
    try {
      setLots(await tracabiliteApi.lots());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Chargement impossible",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLots();
  }, [loadLots]);

  async function createLot(request: LotLaitRequest) {
    try {
      await tracabiliteApi.creerLot(request);
      toast.success("Lot de lait enregistré");
      await loadLots();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible",
      );
      throw error;
    }
  }

  async function createAnalysis(lotId: number, request: AnalyseLaitRequest) {
    try {
      await tracabiliteApi.ajouterAnalyse(lotId, request);
      toast.success("Analyse enregistrée");
      await loadLots();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible",
      );
      throw error;
    }
  }

  return (
    <section className="mx-auto min-w-0 max-w-6xl py-3 sm:py-6">
      <header className="mb-5 flex flex-col items-start gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold sm:text-3xl">Lots de lait</h1>
          <p className="text-sm text-[#756a57] sm:text-base">
            Traites disponibles et contrôles qualité
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="min-h-11 w-full rounded-full bg-[#28551c] sm:w-auto"
          >
            <Plus />
            Nouveau lot
          </Button>
        )}
      </header>

      {loading ? (
        <p role="status" className="py-8 text-center text-[#756a57]">
          Chargement…
        </p>
      ) : lots.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-[#756a57] sm:rounded-[20px] sm:p-12">
          <Milk className="mx-auto mb-3 size-10" />
          Aucun lot de lait enregistré.
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {lots.map((lot) => (
            <MilkLotCard
              key={lot.id}
              lot={lot}
              canAddAnalysis={canWrite}
              onAddAnalysis={setAnalysisLotId}
            />
          ))}
        </div>
      )}

      {canWrite && (
        <MilkLotCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={createLot}
        />
      )}
      {canWrite && (
        <MilkAnalysisDialog
          lotId={analysisLotId}
          onClose={() => setAnalysisLotId(null)}
          onCreate={createAnalysis}
        />
      )}
    </section>
  );
}
