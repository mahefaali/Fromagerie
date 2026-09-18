import { CalendarDays } from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import type { AnomalyParameter, FabricationAnalyticsFilters, RecetteOption } from "../../types/fabrication.types";
import type { CheeseOption } from "./monitoring.utils";

const ALL_VALUE = "all";

interface AnalyticsFiltersProps {
  recipes: RecetteOption[];
  allRecipes: RecetteOption[];
  cheeses: CheeseOption[];
  recettesError: string | null;
  filters: FabricationAnalyticsFilters;
  anomalyParameter?: AnomalyParameter;
  onCheeseChange: (value?: number) => void;
  onRecipeChange: (value?: number) => void;
  onStartDateChange: (value?: string) => void;
  onEndDateChange: (value?: string) => void;
  onAnomalyParameterChange: (value?: AnomalyParameter) => void;
}

export function AnalyticsFilters({ recipes, allRecipes, cheeses, recettesError, filters, anomalyParameter, onCheeseChange, onRecipeChange, onStartDateChange, onEndDateChange, onAnomalyParameterChange }: AnalyticsFiltersProps) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm sm:p-5" aria-label="Filtres du suivi">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Périmètre d’analyse</h3>
        <span className="text-xs text-muted-foreground">Les filtres sont appliqués par le serveur.</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FilterField label="Fromage" htmlFor="analytics-fromage">
          <Select value={filters.fromageId === undefined ? ALL_VALUE : String(filters.fromageId)} onValueChange={(value) => onCheeseChange(value === ALL_VALUE ? undefined : Number(value))}>
            <SelectTrigger id="analytics-fromage" className="min-h-11 w-full bg-background/70"><SelectValue placeholder="Tous les fromages" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les fromages</SelectItem>
              {cheeses.map((cheese) => <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Recette" htmlFor="analytics-recette">
          <Select value={filters.recetteId === undefined ? ALL_VALUE : String(filters.recetteId)} onValueChange={(value) => onRecipeChange(value === ALL_VALUE ? undefined : Number(value))} disabled={Boolean(recettesError) || allRecipes.length === 0}>
            <SelectTrigger id="analytics-recette" className="min-h-11 w-full bg-background/70"><SelectValue placeholder="Toutes les recettes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Toutes les recettes</SelectItem>
              {recipes.map((recipe) => <SelectItem key={recipe.id} value={String(recipe.id)}>{recipe.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Date de début" htmlFor="analytics-date-debut">
          <Input id="analytics-date-debut" type="date" value={filters.dateDebut ?? ""} max={filters.dateFin} onChange={(event) => onStartDateChange(event.target.value || undefined)} className="min-h-11 bg-background/70" />
        </FilterField>
        <FilterField label="Date de fin" htmlFor="analytics-date-fin">
          <Input id="analytics-date-fin" type="date" value={filters.dateFin ?? ""} min={filters.dateDebut} onChange={(event) => onEndDateChange(event.target.value || undefined)} className="min-h-11 bg-background/70" />
        </FilterField>
        <FilterField label="Anomalies" htmlFor="analytics-anomalies">
          <Select value={anomalyParameter ?? ALL_VALUE} onValueChange={(value) => onAnomalyParameterChange(value === ALL_VALUE ? undefined : value as AnomalyParameter)}>
            <SelectTrigger id="analytics-anomalies" className="min-h-11 w-full bg-background/70"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les paramètres</SelectItem>
              <SelectItem value="RENDEMENT">Rendement</SelectItem>
              <SelectItem value="TEMPERATURE_CHAUFFAGE">Température</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </div>
      {recettesError && <p role="alert" className="mt-3 text-xs text-destructive">{recettesError}</p>}
    </section>
  );
}

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</Label>{children}</div>;
}
