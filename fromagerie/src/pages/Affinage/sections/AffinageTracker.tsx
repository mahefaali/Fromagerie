import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AffinageLotList, type AffinageLotItem } from "./AffinageLotList";
import { AffinageLotHeader, type LotAffinageDetail } from "./AffinageLotHeader";
import {
  AffinageCareJournal,
  type CareSummary,
  type CareLogEntry,
} from "./AffinageCareJournal";
import { AddCareDialog, type CareData } from "./AddCareDialog";

const INITIAL_LOTS: LotAffinageDetail[] = [
  {
    id: "lot-1",
    batchCode: "CAM-2026-118",
    recipeName: "Camembert fermier",
    pieceCount: 48,
    operator: "Marie L.",
    location: "Cave Principale · A-1-1",
    entryDate: "20 juil. 2026",
    expectedExitDate: "10 août 2026",
    daysRemaining: 14,
    daysElapsed: 7,
    totalDays: 21,
    caveTargetInfo: "Cave · cible 12°C, humidité 90%",
    flipFrequencyDays: 2,
  },
  {
    id: "lot-2",
    batchCode: "CAM-H-2026-119",
    recipeName: "Camembert fermier",
    variant: "Aux herbes de Provence",
    pieceCount: 40,
    operator: "Marie L.",
    location: "Test · A-1-1",
    entryDate: "27 juil. 2026",
    expectedExitDate: "17 août 2026",
    daysRemaining: 21,
    daysElapsed: 0,
    totalDays: 21,
    caveTargetInfo: "Cave · cible 12°C, humidité 90%",
    flipFrequencyDays: 1,
  },
];

export default function AffinageTracker() {
  const [lots, setLots] = useState<LotAffinageDetail[]>(INITIAL_LOTS);
  const [selectedLotId, setSelectedLotId] = useState<string>("lot-2");
  const [addCareOpen, setAddCareOpen] = useState<boolean>(false);

  const [careSummaries, setCareSummaries] = useState<Record<string, CareSummary>>({
    "lot-2": {
      lastFlip: "Jamais",
      lastWashing: "Jamais",
      rindState: "—",
    },
    "lot-1": {
      lastFlip: "20 juil. 2026",
      lastWashing: "Jamais",
      rindState: "Légère pousse blanche",
    },
  });

  const [careLogs, setCareLogs] = useState<Record<string, CareLogEntry[]>>({
    "lot-2": [],
    "lot-1": [],
  });

  const sidebarLots: AffinageLotItem[] = useMemo(() => {
    return lots.map((lot) => ({
      id: lot.id,
      batchCode: lot.batchCode,
      recipeName: lot.recipeName,
      variant: lot.variant,
      daysRemaining: lot.daysRemaining,
      totalDays: lot.totalDays,
    }));
  }, [lots]);

  const selectedLot = useMemo(() => {
    return lots.find((l) => l.id === selectedLotId) ?? lots[0];
  }, [lots, selectedLotId]);

  const currentSummary = careSummaries[selectedLot.id] ?? {
    lastFlip: "Jamais",
    lastWashing: "Jamais",
    rindState: "—",
  };

  const currentLogs = careLogs[selectedLot.id] ?? [];

  const handleUpdateFlipFrequency = (newFrequencyDays: number) => {
    setLots((prevLots) =>
      prevLots.map((lot) =>
        lot.id === selectedLotId
          ? { ...lot, flipFrequencyDays: newFrequencyDays }
          : lot
      )
    );

    const frequencyLabel =
      newFrequencyDays === 1
        ? "Tous les jours"
        : `Tous les ${newFrequencyDays} jours`;

    toast.success(`Fréquence de retournement modifiée : ${frequencyLabel}`);
  };

  const handleAddCare = (careData: CareData) => {
    let todayFormatted = "Aujourd'hui";

    if (careData.date) {
      const [year, month, day] = careData.date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      todayFormatted = dateObj.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    setCareSummaries((prev) => ({
      ...prev,
      [selectedLot.id]: {
        ...currentSummary,
        ...(careData.type === "Retournement" ? { lastFlip: todayFormatted } : {}),
        ...(careData.type.includes("Lavage") || careData.type === "Lavage"
          ? { lastWashing: todayFormatted }
          : {}),
        ...(careData.rindState ? { rindState: careData.rindState } : {}),
      },
    }));

    const newEntry: CareLogEntry = {
      id: `care-${Date.now()}`,
      type: careData.type,
      date: todayFormatted,
      operator: careData.operator || selectedLot.operator,
      rindState: careData.rindState,
      notes: careData.notes,
      images: careData.images,
    };

    setCareLogs((prev) => ({
      ...prev,
      [selectedLot.id]: [newEntry, ...(prev[selectedLot.id] || [])],
    }));

    toast("Soin ajouté au journal.", {
      icon: (
        <div className="flex items-center justify-center size-5 rounded-full bg-black text-white shrink-0">
          <CheckCircle2 className="size-3.5" />
        </div>
      ),
      className:
        "rounded-2xl bg-white text-foreground border border-black/10 shadow-lg font-medium p-4 flex items-center gap-3",
    });
  };

  const handleDeleteLog = (logId: string) => {
    setCareLogs((prev) => ({
      ...prev,
      [selectedLot.id]: (prev[selectedLot.id] || []).filter(
        (log) => log.id !== logId
      ),
    }));
    toast.success("Soin supprimé du journal.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-3 sm:p-6 relative min-w-0">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* 
        Passage en 2 colonnes à partir du breakpoint `xl` (1280px) 
        Sur tablette portrait ET paysage (< 1280px), la liste s'affiche en grille horizontale au-dessus.
      */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start min-w-0">
        <div className="w-full xl:w-72 shrink-0">
          <AffinageLotList
            lots={sidebarLots}
            selectedId={selectedLot.id}
            onSelectLot={setSelectedLotId}
          />
        </div>

        <div className="flex-1 w-full space-y-6 min-w-0">
          <AffinageLotHeader
            lot={selectedLot}
            onAddCare={() => setAddCareOpen(true)}
            onUpdateFlipFrequency={handleUpdateFlipFrequency}
          />

          <AffinageCareJournal
            summary={currentSummary}
            logs={currentLogs}
            onDeleteLog={handleDeleteLog}
          />
        </div>
      </div>

      <AddCareDialog
        open={addCareOpen}
        onOpenChange={setAddCareOpen}
        onSubmitCare={handleAddCare}
      />
    </div>
  );
}