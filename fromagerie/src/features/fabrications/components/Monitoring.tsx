import { ChartNoAxesCombined, RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { useFabricationAnalytics } from "../hooks/useFabricationAnalytics";
import { AnalyticsFilters } from "./monitoring/AnalyticsFilters";
import {
  AnomalyPanel,
  LoadingState,
  SeasonPanel,
  TemperaturePanel,
  YieldPanel,
  YieldStatistics,
} from "./monitoring/AnalyticsPanels";
import { filterRecipesByCheese, uniqueCheeses } from "./monitoring/monitoring.utils";

export default function Monitoring() {
  const analytics = useFabricationAnalytics();
  const cheeses = uniqueCheeses(analytics.recettes);
  const availableRecipes = filterRecipesByCheese(analytics.recettes, analytics.filters.fromageId);

  const updateCheese = (fromageId?: number): void => {
    const selectedRecipe = analytics.recettes.find(
      (recipe) => recipe.id === analytics.filters.recetteId,
    );
    analytics.setFilters((current) => ({
      ...current,
      fromageId,
      recetteId: selectedRecipe && selectedRecipe.fromageId === fromageId
        ? selectedRecipe.id
        : undefined,
    }));
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-7.5rem)] w-full max-w-[1440px] space-y-5 py-3 sm:py-5">
      <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/75 p-4 shadow-sm sm:p-5">
        <div className="absolute -right-14 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Analyse des fabrications réelles</p>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight sm:text-2xl">
              <ChartNoAxesCombined className="size-6 text-primary" /> Suivi des paramètres
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Températures, rendements et signaux inhabituels calculés par le serveur à partir du registre de fabrication.
            </p>
          </div>
          <Button type="button" variant="outline" className="min-h-11 w-full rounded-full bg-background/70 lg:w-auto" onClick={analytics.retry} disabled={analytics.isLoading}>
            <RefreshCw className={analytics.isLoading ? "animate-spin" : ""} /> Actualiser
          </Button>
        </div>
      </header>

      <div className="space-y-5 pl-2 sm:pl-3 lg:pl-4">
      <AnalyticsFilters
        recipes={availableRecipes}
        allRecipes={analytics.recettes}
        cheeses={cheeses}
        recettesError={analytics.recettesError}
        filters={analytics.filters}
        anomalyParameter={analytics.anomalyParameter}
        onCheeseChange={updateCheese}
        onRecipeChange={(recetteId) => analytics.setFilters((current) => ({ ...current, recetteId }))}
        onStartDateChange={(dateDebut) => analytics.setFilters((current) => ({ ...current, dateDebut }))}
        onEndDateChange={(dateFin) => analytics.setFilters((current) => ({ ...current, dateFin }))}
        onAnomalyParameterChange={analytics.setAnomalyParameter}
      />

      {analytics.isLoading ? <LoadingState /> : (
        <>
          <YieldStatistics data={analytics.rendements} error={analytics.errors.rendements} />
          <div className="grid gap-4 xl:grid-cols-2">
            <TemperaturePanel data={analytics.temperatures} error={analytics.errors.temperatures} onRetry={analytics.retry} />
            <YieldPanel data={analytics.rendements} error={analytics.errors.rendements} onRetry={analytics.retry} />
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SeasonPanel data={analytics.saisons} fromageSelected={analytics.filters.fromageId !== undefined} error={analytics.errors.saisons} onRetry={analytics.retry} />
            <AnomalyPanel data={analytics.anomalies} error={analytics.errors.anomalies} isLoading={analytics.isLoadingAnomalies} onRetry={analytics.retry} />
          </div>
        </>
      )}
      </div>
    </div>
  );
}
