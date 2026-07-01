"use client";

type FabricationLot = {
  name: string;
  description: string;
  provenance: string;
  price: string;
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Origine / Affinage</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.provenance}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prix</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{lot.price} €</p>
        </div>
      </div>
    </div>
  );
}

export type { FabricationLot };
