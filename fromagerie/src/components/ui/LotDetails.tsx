"use client";

type FabricationLot = {
  id: string;
  name: string;
  description: string;
  provenance: string;
  price: string;
  productType: string;
  operator: string;
  lotCode: string;
  startAt: string;
  createdAt: string;
  status: "brouillon" | "validé";
  stage: "Planifiée" | "En caillage" | "Affinage" | "Terminée";
  milkType: string;
  milkQuantityL: string;
  cheeseCount: number;
  milkTemperature: number;
  milkOrigin: string;
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
  useStarter: boolean;
};

type LotDetailsProps = {
  lot: FabricationLot;
};

export function LotDetails({ lot }: LotDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-card/50 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lot</p>
        <h3 className="mt-2 text-2xl font-semibold text-foreground">{lot.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{lot.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Lot code</p>
            <p className="mt-2 text-sm text-foreground font-semibold">{lot.lotCode}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Statut</p>
            <p className="mt-2 text-sm text-foreground font-semibold">{lot.status}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Créé le</p>
            <p className="mt-2 text-sm text-foreground font-semibold">{lot.createdAt}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Début de fabrication</p>
            <p className="mt-2 text-sm text-foreground font-semibold">{lot.startAt.replace("T", " ")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Produit</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.productType}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Opérateur</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.operator}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lait</p>
          <p className="mt-2 text-sm text-foreground font-semibold">{lot.milkQuantityL} L · {lot.milkType}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Origine du lait</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.milkOrigin}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chauffage</p>
          <p className="mt-2 text-sm text-foreground font-semibold">{lot.temperature}°C</p>
          <p className="mt-1 text-sm text-muted-foreground">{lot.cookingTime} min</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Coagulation</p>
          <p className="mt-2 text-sm text-foreground font-semibold">{lot.coagulationTime} min</p>
          <p className="mt-1 text-sm text-muted-foreground">Coupe: {lot.curdCut}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Présure</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.rennetType}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lot.rennetAmount}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ferments</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.cultureType}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lot.cultureAmount}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Moulage</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.moldingType}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lot.moldingTemperature}°C · {lot.drainageTime} min</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sel & Humidité</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.saltUsed ? "Oui" : "Non"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Humidité {lot.humidity}%</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-background/90 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Observations</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{lot.observations}</p>
      </div>
    </div>
  );
}

export type { FabricationLot };
