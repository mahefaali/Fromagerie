import { ChartNoAxesCombined, Filter, RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useOwnerPerformanceDashboard } from "../hooks/useOwnerPerformanceDashboard";
import {
  CostAndMarginChart,
  CostBreakdown,
  KpiCard,
  ProfitabilityTable,
  TopCheeses,
} from "./OwnerPerformanceSections";
import { formatMoney, formatNumber, OWNER_CARD_CLASS, toIsoDate, type Period } from "./ownerPerformance.utils";

export default function OwnerPerformanceDashboard() {
  const dashboard = useOwnerPerformanceDashboard();

  return (
    <section className="min-h-screen bg-[#fbf9f4] px-1 py-2 text-[#1d211d] sm:px-2">
      <div className="mx-auto max-w-7xl space-y-7">
        <DashboardHeader />
        <DashboardFilters dashboard={dashboard} />

        {dashboard.error && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8b9aa] bg-[#fff4ef] p-4 text-sm text-[#9d3f28]">
            <span>{dashboard.error}</span>
            <Button variant="outline" onClick={dashboard.retry}>Réessayer</Button>
          </div>
        )}

        {dashboard.loading ? (
          <Card className={OWNER_CARD_CLASS}>
            <CardContent role="status" className="flex items-center gap-3 p-8 text-[#766955]">
              <RefreshCw className="size-5 animate-spin" />Calcul de la vue d’ensemble…
            </CardContent>
          </Card>
        ) : !dashboard.error && (
          <DashboardContent dashboard={dashboard} />
        )}
      </div>
    </section>
  );
}

type DashboardState = ReturnType<typeof useOwnerPerformanceDashboard>;

function DashboardHeader() {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-[#d6cbbb] bg-[linear-gradient(120deg,#254d25_0%,#355f32_62%,#b85c36_145%)] px-6 py-7 text-[#fffaf0] shadow-[0_8px_28px_rgba(39,72,35,0.16)] sm:px-8">
      <div className="absolute -right-16 -top-24 size-64 rounded-full border border-white/10 bg-white/5" />
      <div className="absolute -bottom-24 right-20 size-48 rounded-full border border-white/10" />
      <div className="relative flex items-start gap-4">
        <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner">
          <ChartNoAxesCombined className="size-5 text-[#f1d2aa]" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e8c99f]">Pilotage propriétaire</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Vue d’ensemble</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f4eadc]/80">Suivez les coûts, le chiffre d’affaires et la rentabilité de votre fromagerie en un coup d’œil.</p>
        </div>
      </div>
    </header>
  );
}

function DashboardFilters({ dashboard }: { dashboard: DashboardState }) {
  return (
    <Card className={`${OWNER_CARD_CLASS} py-0`}>
      <CardContent className={`grid gap-4 p-5 lg:items-end ${dashboard.period === "custom" ? "lg:grid-cols-[auto_1.25fr_0.7fr_0.7fr_1.25fr]" : "lg:grid-cols-[auto_1fr_1fr]"}`}>
        <div className="flex items-center gap-2 pb-2 text-sm font-medium text-[#6f624f]"><Filter className="size-5" />Filtres</div>
        <label className="text-xs font-semibold text-[#766955]">
          Période
          <Select value={dashboard.period} onValueChange={(value) => dashboard.setPeriod(value as Period)}>
            <SelectTrigger className="mt-1.5 h-14 rounded-xl border-[#ddd4c6] bg-[#f8f3ea] text-base"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="month">Ce mois</SelectItem><SelectItem value="previous-month">Mois précédent</SelectItem><SelectItem value="three-months">3 derniers mois</SelectItem><SelectItem value="six-months">6 derniers mois</SelectItem><SelectItem value="year">Cette année</SelectItem><SelectItem value="custom">Période personnalisée</SelectItem></SelectContent>
          </Select>
        </label>
        {dashboard.period === "custom" && (
          <>
            <DateField label="Du" ariaLabel="Date de début personnalisée" value={dashboard.customStart} max={dashboard.customEnd} onChange={dashboard.setCustomStart} />
            <DateField label="Au" ariaLabel="Date de fin personnalisée" value={dashboard.customEnd} min={dashboard.customStart} max={toIsoDate(new Date())} onChange={dashboard.setCustomEnd} />
          </>
        )}
        <label className="text-xs font-semibold text-[#766955]">
          Type de fromage
          <Select value={dashboard.fromageId} onValueChange={dashboard.setFromageId}>
            <SelectTrigger className="mt-1.5 h-14 rounded-xl border-[#ddd4c6] bg-[#f8f3ea] text-base"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les fromages</SelectItem>{dashboard.fromages.map((cheese) => <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.nom}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      </CardContent>
    </Card>
  );
}

function DateField({ label, ariaLabel, value, min, max, onChange }: { label: string; ariaLabel: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold text-[#766955]">{label}<input aria-label={ariaLabel} type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="mt-1.5 block h-14 w-full rounded-xl border border-[#ddd4c6] bg-[#f8f3ea] px-3 text-base font-normal text-[#302a22] shadow-sm outline-none focus:border-[#9b8b72] focus:ring-2 focus:ring-[#9b8b72]/20" /></label>;
}

function DashboardContent({ dashboard }: { dashboard: DashboardState }) {
  const summary = dashboard.summary;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Coût de production de la période" value={formatMoney(dashboard.costs.total)} hint={dashboard.periodHint} />
        <KpiCard label="Chiffre d’affaires" value={formatMoney(summary?.chiffreAffaires ?? 0)} hint={`${summary?.quantiteLivree ?? 0} unités livrées`} evolution={dashboard.performance?.margeBrute.evolution} />
        <KpiCard label="Marge brute" value={formatMoney(summary?.margeBrute ?? 0)} hint="Chiffre d’affaires moins coûts attribués" evolution={dashboard.performance?.margeBrute.evolution} />
        <KpiCard label="Rentabilité moyenne" value={`${formatNumber(summary?.tauxRentabilite ?? 0)} %`} hint="Marge / coût attribué" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <CostAndMarginChart data={dashboard.chartData} />
        <CostBreakdown items={dashboard.costs.items} total={dashboard.costs.total} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ProfitabilityTable rows={dashboard.rows} />
        <TopCheeses rows={dashboard.top} />
      </div>
    </>
  );
}
