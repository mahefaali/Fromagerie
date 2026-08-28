import type { ReactNode } from "react";
import { Beaker, Flame, Milk, PackageCheck, Shapes } from "lucide-react";

import type { FabricationDetail } from "../types/fabrication.types";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  ORIGINE_LAIT_LABELS,
} from "../utils/fabricationFormatters";

export function FabricationDetails({ fabrication }: { fabrication: FabricationDetail }) {
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:grid-cols-2">
        <Detail label="Numéro de lot" value={fabrication.numeroLot} />
        <Detail label="Début" value={formatDateTime(fabrication.dateHeureDebut)} />
        <Detail label="Fromage" value={fabrication.fromageNom} />
        <Detail label="Recette" value={fabrication.recetteNom} />
        <Detail label="Opérateur" value={fabrication.operateurNom} />
        <Detail label="Rendement" value={`${formatNumber(fabrication.rendement)} %`} />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailSection icon={<Milk />} title="Lait">
          <Detail label="Quantité" value={`${formatNumber(fabrication.quantiteLait)} L`} />
          <Detail label="Température" value={`${formatNumber(fabrication.temperatureLait)} °C`} />
          <Detail label="Origine" value={ORIGINE_LAIT_LABELS[fabrication.origineLait]} />
        </DetailSection>

        <DetailSection icon={<Flame />} title="Chauffage">
          <Detail
            label="Température"
            value={`${formatNumber(fabrication.temperatureChauffage)} °C`}
          />
          <Detail label="Durée" value={formatDuration(fabrication.dureeChauffageMinutes)} />
        </DetailSection>

        <DetailSection icon={<Beaker />} title="Présure et ferments">
          <Detail label="Présure" value={fabrication.typePresure} />
          <Detail label="Quantité de présure" value={formatNumber(fabrication.quantitePresure)} />
          <Detail label="Ferments" value={fabrication.typeFerments} />
          <Detail label="Quantité de ferments" value={formatNumber(fabrication.quantiteFerments)} />
        </DetailSection>

        <DetailSection icon={<Shapes />} title="Moulage et égouttage">
          <Detail
            label="Température de mise en moule"
            value={`${formatNumber(fabrication.temperatureMiseEnMoule)} °C`}
          />
          <Detail label="Durée d'égouttage" value={formatDuration(fabrication.dureeEgouttageMinutes)} />
        </DetailSection>
      </div>

      <DetailSection icon={<PackageCheck />} title="Résultat">
        <div className="grid gap-3 sm:grid-cols-3">
          <Detail
            label="Poids obtenu"
            value={`${formatNumber(fabrication.poidsTotalFromages)} kg`}
          />
          <Detail label="Nombre de fromages" value={formatNumber(fabrication.nombreFromages)} />
          <Detail label="Rendement" value={`${formatNumber(fabrication.rendement)} %`} />
        </div>
      </DetailSection>

      <section className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <h3 className="text-sm font-semibold text-foreground">Observations</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {fabrication.observations || "Aucune observation."}
        </p>
      </section>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/60 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground [&_svg]:size-4 [&_svg]:text-primary">
        {icon} {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
