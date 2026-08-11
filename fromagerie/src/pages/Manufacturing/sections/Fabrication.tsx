"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../../../components/ui/select";
import { Modal } from "./../../../components/ui/modal";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

type DraftFabrication = {
  id: string;
  startAt: string;
  productType: string;
  milkType: string;
  lotCode: string;
  milkQuantityL: string;
  milkTemperature: number;
  milkOrigin: "traite du matin" | "traite du soir" | "mélange";
  cheeseWeightKg: string;
  cheeseCount: number;
  temperature: number;
  cookingTime: number;
  coagulationTime: number;
  curdCut: string;
  rennetType: string;
  rennetAmount: string;
  cultureType: string;
  cultureAmount: string;
  moldingType: string;
  moldingTemperature: number;
  drainageTime: number;
  saltUsed: boolean;
  humidity: number;
  observations: string;
  operator: "M. Payet" | "Employé";
  useStarter: boolean;
  status: "brouillon" | "validé";
  createdAt: string;
};

const generateLotCode = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const sequence = Math.floor(Math.random() * 90 + 10);
  return `LOT-${date}-${time}-${sequence}`;
};

const createBlankDraft = (): DraftFabrication => ({
  id: `${Date.now()}`,
  startAt: new Date().toISOString().slice(0, 16),
  productType: "Fromage des Hauts",
  milkType: "Vache",
  lotCode: generateLotCode(),
  milkQuantityL: "1000",
  milkTemperature: 12,
  milkOrigin: "traite du matin",
  cheeseWeightKg: "120",
  cheeseCount: 10,
  temperature: 36,
  cookingTime: 45,
  coagulationTime: 35,
  curdCut: "Moyen",
  rennetType: "Présure standard",
  rennetAmount: "15 ml",
  cultureType: "Ferments lactiques",
  cultureAmount: "25 g",
  moldingType: "Moule traditionnel",
  moldingTemperature: 12,
  drainageTime: 20,
  saltUsed: true,
  humidity: 82,
  observations: "Météo claire, hygrométrie stable",
  operator: "Employé",
  useStarter: true,
  status: "brouillon",
  createdAt: new Date().toLocaleString("fr-FR"),
});

const steps = [
  { key: "preparation", title: "Préparation", description: "Produit, opérateur et lot" },
  { key: "milk", title: "Lait", description: "Quantité, température et origine" },
  { key: "heating", title: "Chauffage", description: "Température et durée" },
  { key: "enrichissement", title: "Présure & ferments", description: "Ingrédients et moulage" },
  { key: "results", title: "Résultats", description: "Poids, rendement et observations" },
] as const;

export default function Fabrication() {
  const { ref: leftRef, isVisible: leftVisible } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.15,
  });
  const { ref: rightRef, isVisible: rightVisible } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<DraftFabrication>(createBlankDraft);
  const [drafts, setDrafts] = useState<DraftFabrication[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState("Brouillon non enregistré");

  useEffect(() => {
    const storedDraft = window.localStorage.getItem("fabrication-draft");
    const storedDrafts = window.localStorage.getItem("fabrications-drafts");

    if (storedDraft) {
      try {
        setDraft(JSON.parse(storedDraft));
      } catch {
        window.localStorage.removeItem("fabrication-draft");
      }
    }

    if (storedDrafts) {
      try {
        setDrafts(JSON.parse(storedDrafts));
      } catch {
        window.localStorage.removeItem("fabrications-drafts");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fabrication-draft", JSON.stringify(draft));
    setLastSavedAt(`Brouillon enregistré à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`);
  }, [draft]);

  const yieldRate = useMemo(() => {
    const milkQuantity = Number(draft.milkQuantityL);
    const cheeseWeight = Number(draft.cheeseWeightKg);
    if (!milkQuantity || !cheeseWeight || milkQuantity <= 0) return null;
    return ((cheeseWeight / milkQuantity) * 100).toFixed(1);
  }, [draft.milkQuantityL, draft.cheeseWeightKg]);

  const handleDraftChange = <K extends keyof DraftFabrication>(key: K, value: DraftFabrication[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveDraft = () => {
    const savedDraft = { ...draft, status: "brouillon" as const, createdAt: new Date().toLocaleString("fr-FR") };
    const nextDrafts = [savedDraft, ...drafts.filter((item) => item.id !== savedDraft.id)].slice(0, 5);
    setDrafts(nextDrafts);
    window.localStorage.setItem("fabrications-drafts", JSON.stringify(nextDrafts));
    setLastSavedAt(`Brouillon sauvegardé à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`);
  };

  const openNewFabrication = () => {
    setDraft(createBlankDraft());
    setCurrentStep(0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentStep(0);
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
              <span className="text-muted-foreground">Opérateur (utilisateur connecté)</span>
              <Select value={draft.operator} onValueChange={(value) => handleDraftChange("operator", value as DraftFabrication["operator"])}>
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
              <Input
                type="datetime-local"
                value={draft.startAt}
                onChange={(e) => handleDraftChange("startAt", e.target.value)}
                className="w-full"
              />
            </Label>

            <Label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span className="text-muted-foreground">Numéro de lot</span>
              <Input
                value={draft.lotCode}
                onChange={(e) => handleDraftChange("lotCode", e.target.value)}
                placeholder="LOT-YYYYMMDD-HHMM-XX"
                className="w-full"
              />
            </Label>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de lait (L)</span>
              <Input
                type="number"
                value={draft.milkQuantityL}
                onChange={(e) => handleDraftChange("milkQuantityL", e.target.value)}
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Température du lait (°C)</span>
              <Input
                type="number"
                min={4}
                max={25}
                value={draft.milkTemperature}
                onChange={(e) => handleDraftChange("milkTemperature", Number(e.target.value))}
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Origine du lait</span>
              <Select value={draft.milkOrigin} onValueChange={(value) => handleDraftChange("milkOrigin", value as DraftFabrication["milkOrigin"])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une origine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traite du matin">traite du matin</SelectItem>
                  <SelectItem value="traite du soir">traite du soir</SelectItem>
                  <SelectItem value="mélange">mélange</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Température de chauffage (°C)</span>
                <span className="text-foreground font-medium">{draft.temperature} °C</span>
              </div>
              <input
                type="range"
                min={30}
                max={42}
                step={1}
                value={draft.temperature}
                onChange={(e) => handleDraftChange("temperature", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Temps de chauffage (min)</span>
                <span className="text-foreground font-medium">{draft.cookingTime} min</span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={1}
                value={draft.cookingTime}
                onChange={(e) => handleDraftChange("cookingTime", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de présure</span>
              <Input
                value={draft.rennetType}
                onChange={(e) => handleDraftChange("rennetType", e.target.value)}
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de présure</span>
              <Input
                value={draft.rennetAmount}
                onChange={(e) => handleDraftChange("rennetAmount", e.target.value)}
                placeholder="ml"
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Type de ferments</span>
              <Input
                value={draft.cultureType}
                onChange={(e) => handleDraftChange("cultureType", e.target.value)}
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Quantité de ferments</span>
              <Input
                value={draft.cultureAmount}
                onChange={(e) => handleDraftChange("cultureAmount", e.target.value)}
                placeholder="g"
                className="w-full"
              />
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
              <Input
                type="number"
                min={5}
                max={25}
                value={draft.moldingTemperature}
                onChange={(e) => handleDraftChange("moldingTemperature", Number(e.target.value))}
                className="w-full"
              />
            </Label>
            <Label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Durée d'égouttage (min)</span>
              <Input
                type="number"
                min={5}
                max={120}
                value={draft.drainageTime}
                onChange={(e) => handleDraftChange("drainageTime", Number(e.target.value))}
                className="w-full"
              />
            </Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Temps de coagulation (min)</span>
                <span className="text-foreground font-medium">{draft.coagulationTime} min</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={draft.coagulationTime}
                onChange={(e) => handleDraftChange("coagulationTime", Number(e.target.value))}
                className="w-full accent-primary"
              />
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
          </div>
        );
      default:
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/10 p-3 text-sm">
                <div className="text-muted-foreground">Rendement estimé</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{yieldRate ?? "--"}%</div>
              </div>
              <Label className="flex flex-col gap-2 text-sm">
                <span className="text-muted-foreground">Sel utilisé</span>
                <Button
                  type="button"
                  variant={draft.saltUsed ? "default" : "outline"}
                  className="h-11 w-full justify-start rounded-xl px-3 text-left"
                  onClick={() => handleDraftChange("saltUsed", !draft.saltUsed)}
                >
                  {draft.saltUsed ? "Oui" : "Non"}
                </Button>
              </Label>
              <Label className="flex flex-col gap-2 text-sm">
                <span className="text-muted-foreground">Poids après moulage (kg)</span>
                <Input
                  type="number"
                  value={draft.cheeseWeightKg}
                  onChange={(e) => handleDraftChange("cheeseWeightKg", e.target.value)}
                  className="w-full"
                />
              </Label>
              <Label className="flex flex-col gap-2 text-sm">
                <span className="text-muted-foreground">Nombre de fromages</span>
                <Input
                  type="number"
                  min={1}
                  value={draft.cheeseCount}
                  onChange={(e) => handleDraftChange("cheeseCount", Number(e.target.value))}
                  className="w-full"
                />
              </Label>
              <Label className="flex flex-col gap-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Observations</span>
                <Textarea
                  value={draft.observations}
                  onChange={(e) => handleDraftChange("observations", e.target.value)}
                  className="min-h-24 w-full"
                />
              </Label>
            </div>

            <div className="mt-6 rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Vérification finale</p>
                  <p className="text-sm text-muted-foreground">Passez en revue tous les détails avant de terminer la création du lot.</p>
                </div>
              </div>
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
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Origine du lait</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.milkOrigin}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Présure</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.rennetType} · {draft.rennetAmount}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ferments</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.cultureType} · {draft.cultureAmount}</div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <section data-section-id="3115"
      id="nouvelle-fabrication"
      className="bg-background text-foreground relative overflow-hidden py-24 md:py-36 lg:py-44 px-6 md:px-12 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at top left, hsla(15, 54%, 53%, 0.08), transparent 50%), radial-gradient(ellipse at bottom right, hsla(35, 38%, 75%, 0.06), transparent 50%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-14 md:gap-16 lg:gap-20">
        <div
          ref={leftRef}
          className={`md:col-span-5 lg:col-span-5 md:pt-8 lg:pt-8 transition-all duration-1000 ease-out ${
            leftVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-10 font-bold">
            Module I &mdash; Production
          </p>

          <h2 className="font-serif text-5xl md:text-6xl lg:text-[64px] leading-[1.05] text-foreground tracking-tight">
            Nouvelle
            <span className="text-muted-foreground/60 font-light"> /</span>
            <br />
            <span className="block italic font-light pl-8 md:pl-10 mt-1">
              fabrication.
            </span>
          </h2>

          <p className="font-serif text-lg leading-relaxed text-muted-foreground mt-10 max-w-[320px]">
            Enregistrez vos lots avec précision pour garantir une traçabilité totale de la traite à l'affinage.
          </p>

          <ul className="mt-12 space-y-4 max-w-[340px]">
            {[
              "Suivi des paramètres de caillage",
              "Gestion des coûts par lot",
              "Indicateurs de rendement",
            ].map((item, i) => (
              <li
                data-index={i}
                key={item}
                className="flex items-baseline gap-3 text-xs uppercase tracking-[0.18em] text-foreground/80"
              >
                <span className="text-primary">&mdash;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-16 pt-10 border-t border-foreground/10 max-w-[340px]">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Atelier
            </p>
            <p className="font-serif text-base text-foreground/90 leading-relaxed">
              Fromagerie Artisanale
              <br />
              Gestion de production
            </p>
          </div>
        </div>

        <div
          ref={rightRef}
          className={`md:col-span-7 lg:col-span-7 transition-all duration-1000 ease-out delay-150 ${
            rightVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-card/70 backdrop-blur-sm border border-foreground/10 p-8 md:p-14 shadow-lg rounded-lg">
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Nouvelle fabrication</div>
                <div className="text-sm text-muted-foreground">Étapes guidées : préparation, chauffage, coagulation, moulage et résultats.</div>
              </div>
              <Button className="h-11 px-5" onClick={openNewFabrication}>Nouveau lot</Button>
            </div>

            <div className="mb-6 rounded-2xl border border-border/70 bg-card/50 p-4">
              <div className="text-sm font-semibold text-foreground">Brouillons récents</div>
              <div className="mt-3 space-y-2">
                {drafts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun brouillon pour le moment.</div>
                ) : (
                  drafts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDraft(item);
                        setCurrentStep(0);
                        setModalOpen(true);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-left text-sm"
                    >
                      <span>{item.productType} · {item.lotCode}</span>
                      <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-border/70 bg-card/50 p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">Résumé du lot</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Produit</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.productType}</div>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lot</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.lotCode}</div>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lait</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{draft.milkQuantityL} L · {draft.milkType}</div>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rendement</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{yieldRate ?? "--"}%</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>{lastSavedAt}</div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-11 px-5" onClick={saveDraft}>Sauvegarder brouillon</Button>
                <Button className="h-11 px-5" onClick={openNewFabrication}>Ouvrir le formulaire</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Étape ${currentStep + 1} / ${steps.length} — ${steps[currentStep].title}`}
        description={steps[currentStep].description}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">{lastSavedAt}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-11 px-5" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0}>
                <ChevronLeft className="size-4" /> Précédent
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button className="h-11 px-5" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}>
                  Suivant <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button className="h-11 px-5" onClick={() => {
                  saveDraft();
                  closeModal();
                }}>
                  Terminer <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`rounded-full px-3 py-1 text-xs font-medium ${index === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step.title}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {renderStep()}
        </div>
      </Modal>
    </section>
  );
}