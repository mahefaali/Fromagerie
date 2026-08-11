import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../../../components/ui/select";
import { Modal } from "./../../../components/ui/modal";

export type FabricationDraft = {
  productType: string;
  operator: string;
  startAt: string;
  lotCode: string;
  milkQuantityL: string;
  milkTemperature: number;
  milkOrigin: "traite du matin" | "traite du soir" | "mélange";
  temperature: number;
  cookingTime: number;
  rennetType: string;
  rennetAmount: string;
  cultureType: string;
  cultureAmount: string;
  moldingType: string;
  moldingTemperature: number;
  drainageTime: number;
  coagulationTime: number;
  curdCut: string;
  flippingFrequencyDays: number; // <-- Fréquence en jours
  cheeseWeightKg: string;
  cheeseCount: number;
  observations: string;
};

type FabricationCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: FabricationDraft) => void;
};

const steps = [
  { key: "preparation", title: "Préparation", description: "Produit, opérateur et lot" },
  { key: "milk", title: "Lait", description: "Quantité, température et origine" },
  { key: "heating", title: "Chauffage", description: "Température et durée" },
  { key: "enrichissement", title: "Présure & ferments", description: "Ingrédients, moulage et cave" },
  { key: "results", title: "Résultats", description: "Poids, rendement et observations" },
] as const;

const createBlankDraft = (): FabricationDraft => ({
  productType: "Fromage des Hauts",
  operator: "Employé",
  startAt: new Date().toISOString().slice(0, 16),
  lotCode: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(new Date().getHours()).padStart(2, "0")}${String(new Date().getMinutes()).padStart(2, "0")}`,
  milkQuantityL: "1000",
  milkTemperature: 12,
  milkOrigin: "traite du matin",
  temperature: 36,
  cookingTime: 45,
  rennetType: "Présure standard",
  rennetAmount: "15 ml",
  cultureType: "Ferments lactiques",
  cultureAmount: "25 g",
  moldingType: "Moule traditionnel",
  moldingTemperature: 12,
  drainageTime: 20,
  coagulationTime: 35,
  curdCut: "Moyen",
  flippingFrequencyDays: 1, // <-- Par défaut 1 jour (quotidien)
  cheeseWeightKg: "120",
  cheeseCount: 10,
  observations: "Météo claire, hygrométrie stable",
});

function getYieldRate(draft: FabricationDraft) {
  const milkQuantity = Number(draft.milkQuantityL);
  const cheeseWeight = Number(draft.cheeseWeightKg);
  if (!milkQuantity || !cheeseWeight || milkQuantity <= 0) return null;
  return ((cheeseWeight / milkQuantity) * 100).toFixed(1);
}

export default function FabricationCreateModal({ open, onOpenChange, onCreate }: FabricationCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<FabricationDraft>(createBlankDraft);

  const yieldRate = useMemo(() => getYieldRate(draft), [draft]);

  const resetAndClose = () => {
    setCurrentStep(0);
    setDraft(createBlankDraft());
    onOpenChange(false);
  };

  const handleDraftChange = <K extends keyof FabricationDraft>(key: K, value: FabricationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    onCreate(draft);
    resetAndClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de fromage</span>
              <Select value={draft.productType} onValueChange={(value) => handleDraftChange("productType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un fromage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fromage des Hauts">Fromage des Hauts</SelectItem>
                  <SelectItem value="Brin d'Est">Brin d'Est</SelectItem>
                  <SelectItem value="Cirque">Cirque</SelectItem>
                  <SelectItem value="Salazien">Salazien</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Opérateur</span>
              <Select value={draft.operator} onValueChange={(value) => handleDraftChange("operator", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M. Payet">M. Payet</SelectItem>
                  <SelectItem value="Employé">Employé</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Début de fabrication</span>
              <Input type="datetime-local" value={draft.startAt} onChange={(e) => handleDraftChange("startAt", e.target.value)} className="w-full" />
            </Label>

            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Numéro de lot</span>
              <Input value={draft.lotCode} onChange={(e) => handleDraftChange("lotCode", e.target.value)} placeholder="LOT-YYYYMMDD-HHMM-XX" className="w-full" />
            </Label>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de lait (L)</span>
              <Input type="number" value={draft.milkQuantityL} onChange={(e) => handleDraftChange("milkQuantityL", e.target.value)} className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Température du lait (°C)</span>
              <Input type="number" min={4} max={25} value={draft.milkTemperature} onChange={(e) => handleDraftChange("milkTemperature", Number(e.target.value))} className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Origine du lait</span>
              <Select value={draft.milkOrigin} onValueChange={(value) => handleDraftChange("milkOrigin", value as FabricationDraft["milkOrigin"])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une origine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traite du matin">Traite du matin</SelectItem>
                  <SelectItem value="traite du soir">Traite du soir</SelectItem>
                  <SelectItem value="mélange">Mélange</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Température de chauffage (°C)</span>
                <span className="font-medium text-foreground">{draft.temperature} °C</span>
              </div>
              <input type="range" min={30} max={42} step={1} value={draft.temperature} onChange={(e) => handleDraftChange("temperature", Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Temps de chauffage (min)</span>
                <span className="font-medium text-foreground">{draft.cookingTime} min</span>
              </div>
              <input type="range" min={20} max={90} step={1} value={draft.cookingTime} onChange={(e) => handleDraftChange("cookingTime", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de présure</span>
              <Input value={draft.rennetType} onChange={(e) => handleDraftChange("rennetType", e.target.value)} className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de présure</span>
              <Input value={draft.rennetAmount} onChange={(e) => handleDraftChange("rennetAmount", e.target.value)} placeholder="ml" className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de ferments</span>
              <Input value={draft.cultureType} onChange={(e) => handleDraftChange("cultureType", e.target.value)} className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de ferments</span>
              <Input value={draft.cultureAmount} onChange={(e) => handleDraftChange("cultureAmount", e.target.value)} placeholder="g" className="w-full" />
            </Label>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de moulage</span>
              <Select value={draft.moldingType} onValueChange={(value) => handleDraftChange("moldingType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un moulage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moule traditionnel">Moule traditionnel</SelectItem>
                  <SelectItem value="Moule perforé">Moule perforé</SelectItem>
                  <SelectItem value="Éprouvette">Éprouvette</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Température de mise en moule (°C)</span>
              <Input type="number" min={5} max={25} value={draft.moldingTemperature} onChange={(e) => handleDraftChange("moldingTemperature", Number(e.target.value))} className="w-full" />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Durée d&apos;égouttage (min)</span>
              <Input type="number" min={5} max={120} value={draft.drainageTime} onChange={(e) => handleDraftChange("drainageTime", Number(e.target.value))} className="w-full" />
            </Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Temps de coagulation (min)</span>
                <span className="font-medium text-foreground">{draft.coagulationTime} min</span>
              </div>
              <input type="range" min={10} max={60} step={1} value={draft.coagulationTime} onChange={(e) => handleDraftChange("coagulationTime", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Coupe du caillé</span>
              <Select value={draft.curdCut} onValueChange={(value) => handleDraftChange("curdCut", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une coupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Fin">Fin</SelectItem>
                  <SelectItem value="Grossier">Grossier</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            {/* Fréquence de retournement exprimée en jours */}
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Fréquence de retournement en cave</span>
              <Select
                value={String(draft.flippingFrequencyDays)}
                onValueChange={(value) => handleDraftChange("flippingFrequencyDays", Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">2 fois par jour (toutes les 12h)</SelectItem>
                  <SelectItem value="1">1 fois par jour (tous les jours)</SelectItem>
                  <SelectItem value="2">Tous les 2 jours</SelectItem>
                  <SelectItem value="3">Tous les 3 jours</SelectItem>
                  <SelectItem value="7">Tous les 7 jours (hebdomadaire)</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/10 p-3 text-sm">
                <div className="text-muted-foreground">Rendement estimé</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{yieldRate ?? "--"}%</div>
              </div>
              <Label className="flex flex-col gap-2 text-sm">
                <span className="text-muted-foreground">Poids après moulage (kg)</span>
                <Input type="number" value={draft.cheeseWeightKg} onChange={(e) => handleDraftChange("cheeseWeightKg", e.target.value)} className="w-full" />
              </Label>
              <Label className="flex flex-col gap-2 text-sm">
                <span className="text-muted-foreground">Nombre de fromages</span>
                <Input type="number" min={1} value={draft.cheeseCount} onChange={(e) => handleDraftChange("cheeseCount", Number(e.target.value))} className="w-full" />
              </Label>
              <Label className="flex flex-col gap-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Observations</span>
                <Textarea value={draft.observations} onChange={(e) => handleDraftChange("observations", e.target.value)} className="min-h-24 w-full" />
              </Label>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold text-foreground">Résumé du lot</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Produit</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.productType}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Opérateur</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.operator}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Début</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.startAt.replace("T", " ")}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lot</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.lotCode}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Retournement cave prévu</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {draft.flippingFrequencyDays === 0.5
                      ? "2 fois par jour"
                      : draft.flippingFrequencyDays === 1
                      ? "Tous les jours"
                      : `Tous les ${draft.flippingFrequencyDays} jours`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetAndClose();
          return;
        }
        onOpenChange(true);
      }}
      title={`Étape ${currentStep + 1} / ${steps.length} — ${steps[currentStep].title}`}
      description={steps[currentStep].description}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">Préparation d’un nouveau lot</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-11 px-5" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0}>
              <ChevronLeft className="size-4" /> Précédent
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button className="h-11 px-5" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}>
                Suivant <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button className="h-11 px-5" onClick={submit}>
                Enregistrer <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className={`rounded-full px-3 py-1 text-xs font-medium ${index === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step.title}
          </div>
        ))}
      </div>

      <div className="space-y-6">{renderStep()}</div>
    </Modal>
  );
}