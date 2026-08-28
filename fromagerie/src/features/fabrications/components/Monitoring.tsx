import {
  AlertTriangle,
  CalendarDays,
  ChartNoAxesCombined,
  CloudRain,
  RefreshCw,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useFabricationAnalytics } from "../hooks/useFabricationAnalytics";
import type {
  AnomalyDirection,
  AnomalyParameter,
  FabricationAnomaly,
  RecetteOption,
  SeasonYieldStatistics,
  TemperatureHistoryPoint,
  YieldAnalytics,
} from "../types/fabrication.types";
import { formatDateTime, formatNumber } from "../utils/fabricationFormatters";

const ALL_VALUE = "all";

export default function Monitoring() {
  const analytics = useFabricationAnalytics();
  const cheeses = uniqueCheeses(analytics.recettes);
  const availableRecipes = analytics.filters.fromageId === undefined
    ? analytics.recettes
    : analytics.recettes.filter((recipe) => recipe.fromageId === analytics.filters.fromageId);

  const updateCheese = (value: string): void => {
    const fromageId = value === ALL_VALUE ? undefined : Number(value);
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
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-4 sm:px-6 sm:py-6">
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/75 p-5 shadow-sm sm:p-7">
        <div className="absolute -right-14 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Analyse des fabrications réelles
            </p>
            <h2 className="flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              <ChartNoAxesCombined className="size-8 text-primary" />
              Suivi des paramètres
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Températures, rendements et signaux inhabituels calculés par le serveur à partir du
              registre de fabrication.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full bg-background/70 lg:w-auto"
            onClick={analytics.retry}
            disabled={analytics.isLoading}
          >
            <RefreshCw className={analytics.isLoading ? "animate-spin" : ""} />
            Actualiser
          </Button>
        </div>
      </header>

      <AnalyticsFilters
        recipes={availableRecipes}
        allRecipes={analytics.recettes}
        cheeses={cheeses}
        recettesError={analytics.recettesError}
        fromageId={analytics.filters.fromageId}
        recetteId={analytics.filters.recetteId}
        dateDebut={analytics.filters.dateDebut}
        dateFin={analytics.filters.dateFin}
        anomalyParameter={analytics.anomalyParameter}
        onCheeseChange={updateCheese}
        onRecipeChange={(value) => analytics.setFilters((current) => ({
          ...current,
          recetteId: value === ALL_VALUE ? undefined : Number(value),
        }))}
        onStartDateChange={(value) => analytics.setFilters((current) => ({
          ...current,
          dateDebut: value || undefined,
        }))}
        onEndDateChange={(value) => analytics.setFilters((current) => ({
          ...current,
          dateFin: value || undefined,
        }))}
        onAnomalyParameterChange={analytics.setAnomalyParameter}
      />

      {analytics.isLoading ? (
        <LoadingState />
      ) : (
        <>
          <YieldStatistics data={analytics.rendements} error={analytics.errors.rendements} />

          <div className="grid gap-5 xl:grid-cols-2">
            <TemperaturePanel
              data={analytics.temperatures}
              error={analytics.errors.temperatures}
              onRetry={analytics.retry}
            />
            <YieldPanel
              data={analytics.rendements}
              error={analytics.errors.rendements}
              onRetry={analytics.retry}
            />
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <SeasonPanel
              data={analytics.saisons}
              fromageSelected={analytics.filters.fromageId !== undefined}
              error={analytics.errors.saisons}
              onRetry={analytics.retry}
            />
            <AnomalyPanel
              data={analytics.anomalies}
              error={analytics.errors.anomalies}
              isLoading={analytics.isLoadingAnomalies}
              onRetry={analytics.retry}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface CheeseOption {
  id: number;
  name: string;
}

function uniqueCheeses(recipes: RecetteOption[]): CheeseOption[] {
  const cheeses = new Map<number, CheeseOption>();
  recipes.forEach((recipe) => {
    cheeses.set(recipe.fromageId, { id: recipe.fromageId, name: recipe.fromageNom });
  });
  return [...cheeses.values()].sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

function AnalyticsFilters({
  recipes,
  allRecipes,
  cheeses,
  recettesError,
  fromageId,
  recetteId,
  dateDebut,
  dateFin,
  anomalyParameter,
  onCheeseChange,
  onRecipeChange,
  onStartDateChange,
  onEndDateChange,
  onAnomalyParameterChange,
}: {
  recipes: RecetteOption[];
  allRecipes: RecetteOption[];
  cheeses: CheeseOption[];
  recettesError: string | null;
  fromageId?: number;
  recetteId?: number;
  dateDebut?: string;
  dateFin?: string;
  anomalyParameter?: AnomalyParameter;
  onCheeseChange: (value: string) => void;
  onRecipeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onAnomalyParameterChange: (value?: AnomalyParameter) => void;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm sm:p-5" aria-label="Filtres du suivi">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Périmètre d’analyse</h3>
        <span className="text-xs text-muted-foreground">Les filtres sont appliqués par le serveur.</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FilterField label="Fromage" htmlFor="analytics-fromage">
          <Select value={fromageId === undefined ? ALL_VALUE : String(fromageId)} onValueChange={onCheeseChange}>
            <SelectTrigger id="analytics-fromage" className="min-h-11 w-full bg-background/70">
              <SelectValue placeholder="Tous les fromages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les fromages</SelectItem>
              {cheeses.map((cheese) => (
                <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Recette" htmlFor="analytics-recette">
          <Select
            value={recetteId === undefined ? ALL_VALUE : String(recetteId)}
            onValueChange={onRecipeChange}
            disabled={Boolean(recettesError) || allRecipes.length === 0}
          >
            <SelectTrigger id="analytics-recette" className="min-h-11 w-full bg-background/70">
              <SelectValue placeholder="Toutes les recettes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Toutes les recettes</SelectItem>
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={String(recipe.id)}>{recipe.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Date de début" htmlFor="analytics-date-debut">
          <Input
            id="analytics-date-debut"
            type="date"
            value={dateDebut ?? ""}
            max={dateFin}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="min-h-11 bg-background/70"
          />
        </FilterField>

        <FilterField label="Date de fin" htmlFor="analytics-date-fin">
          <Input
            id="analytics-date-fin"
            type="date"
            value={dateFin ?? ""}
            min={dateDebut}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="min-h-11 bg-background/70"
          />
        </FilterField>

        <FilterField label="Anomalies" htmlFor="analytics-anomalies">
          <Select
            value={anomalyParameter ?? ALL_VALUE}
            onValueChange={(value) => onAnomalyParameterChange(
              value === ALL_VALUE ? undefined : value as AnomalyParameter,
            )}
          >
            <SelectTrigger id="analytics-anomalies" className="min-h-11 w-full bg-background/70">
              <SelectValue />
            </SelectTrigger>
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

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function YieldStatistics({ data, error }: { data: YieldAnalytics | null; error: string | null }) {
  const stats = [
    { label: "Rendement moyen", value: data?.moyenne, icon: ChartNoAxesCombined, tone: "text-primary" },
    { label: "Rendement minimum", value: data?.minimum, icon: TrendingDown, tone: "text-amber-700" },
    { label: "Rendement maximum", value: data?.maximum, icon: TrendingUp, tone: "text-teal-700" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Statistiques de rendement">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="flex min-h-28 items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-background/80 ${tone}`}>
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {error || value == null ? "—" : `${formatNumber(value)} %`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {error ? "Indisponible" : `${data?.nombreFabrications ?? 0} fabrication(s)`}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

interface ChartPoint {
  label: string;
  date: string;
  lot: string;
  fromage: string;
  value: number;
}

function TemperaturePanel({ data, error, onRetry }: {
  data: TemperatureHistoryPoint[];
  error: string | null;
  onRetry: () => void;
}) {
  const points: ChartPoint[] = data.map((item) => ({
    label: shortDate(item.dateHeureDebut),
    date: formatDateTime(item.dateHeureDebut),
    lot: item.numeroLot,
    fromage: item.fromageNom,
    value: item.temperatureChauffage,
  }));

  return (
    <AnalyticsCard
      title="Températures de chauffage"
      description="Mesures enregistrées pour chaque lot, exprimées en °C."
      icon={<Thermometer className="size-5" />}
    >
      {error ? <ErrorState message={error} onRetry={onRetry} /> : points.length === 0 ? (
        <EmptyState message="Aucun historique de température disponible pour cette période." />
      ) : (
        <>
          <TimeSeriesChart points={points} unit="°C" color="var(--chart-1)" />
          <RecentMeasurements
            rows={data.slice(-4).reverse().map((item) => ({
              id: item.fabricationId,
              lot: item.numeroLot,
              date: formatDateTime(item.dateHeureDebut),
              fromage: item.fromageNom,
              value: `${formatNumber(item.temperatureChauffage)} °C`,
            }))}
          />
        </>
      )}
    </AnalyticsCard>
  );
}

function YieldPanel({ data, error, onRetry }: {
  data: YieldAnalytics | null;
  error: string | null;
  onRetry: () => void;
}) {
  const history = data?.historique ?? [];
  const points: ChartPoint[] = history.map((item) => ({
    label: shortDate(item.dateHeureDebut),
    date: formatDateTime(item.dateHeureDebut),
    lot: item.numeroLot,
    fromage: item.fromageNom,
    value: item.rendement,
  }));

  return (
    <AnalyticsCard
      title="Évolution du rendement"
      description="Rendement calculé par le backend et déjà exprimé en pourcentage."
      icon={<TrendingUp className="size-5" />}
    >
      {error ? <ErrorState message={error} onRetry={onRetry} /> : points.length === 0 ? (
        <EmptyState message="Aucun rendement disponible pour cette période." />
      ) : (
        <>
          <TimeSeriesChart points={points} unit="%" color="var(--chart-2)" />
          <RecentMeasurements
            rows={history.slice(-4).reverse().map((item) => ({
              id: item.fabricationId,
              lot: item.numeroLot,
              date: formatDateTime(item.dateHeureDebut),
              fromage: item.fromageNom,
              value: `${formatNumber(item.rendement)} %`,
            }))}
          />
        </>
      )}
    </AnalyticsCard>
  );
}

function TimeSeriesChart({ points, unit, color }: { points: ChartPoint[]; unit: string; color: string }) {
  return (
    <div className="h-72 w-full min-w-[520px]" aria-label={`Graphique temporel en ${unit}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 12, right: 18, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} minTickGap={28} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={54}
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => `${formatNumber(value)}${unit}`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 14,
              borderColor: "var(--border)",
              background: "var(--popover)",
              fontSize: 12,
            }}
            labelFormatter={(_label, payload) => {
              const point = payload[0]?.payload as ChartPoint | undefined;
              return point ? `${point.lot} · ${point.date}` : "";
            }}
            formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, "Valeur"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentMeasurements({ rows }: { rows: Array<{ id: number; lot: string; date: string; fromage: string; value: string }> }) {
  return (
    <div className="mt-4 border-t border-border/60 pt-3">
      <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Dernières mesures</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-background/55 px-3 py-2 text-xs sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <p className="font-mono font-medium text-foreground">{row.lot}</p>
              <p className="text-muted-foreground sm:hidden">{row.fromage}</p>
            </div>
            <p className="hidden self-center text-muted-foreground sm:block">{row.fromage} · {row.date}</p>
            <p className="self-center font-mono font-semibold text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonPanel({ data, fromageSelected, error, onRetry }: {
  data: ReturnType<typeof useFabricationAnalytics>["saisons"];
  fromageSelected: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <AnalyticsCard
      title="Comparaison saisonnière"
      description="Périodes sèche et humide déterminées par la configuration du serveur."
      icon={<Sun className="size-5" />}
    >
      {error ? <ErrorState message={error} onRetry={onRetry} /> : !fromageSelected ? (
        <EmptyState message="Sélectionnez un fromage pour comparer ses rendements saisonniers." />
      ) : !data ? (
        <EmptyState message="Données insuffisantes pour la comparaison." />
      ) : (
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit">{data.fromageNom}</Badge>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <SeasonCard
              label="Saison sèche"
              icon={<Sun className="size-5 text-amber-700" />}
              statistics={data.saisonSeche}
            />
            <SeasonCard
              label="Saison humide"
              icon={<CloudRain className="size-5 text-teal-700" />}
              statistics={data.saisonHumide}
            />
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
}

function SeasonCard({ label, icon, statistics }: {
  label: string;
  icon: React.ReactNode;
  statistics: SeasonYieldStatistics;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold">{label}</h4>
      </div>
      {!statistics.donneesDisponibles ? (
        <p className="mt-4 text-sm text-muted-foreground">Aucune donnée pour cette saison.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-3 gap-2">
          <SeasonValue label="Moyenne" value={statistics.moyenne} />
          <SeasonValue label="Minimum" value={statistics.minimum} />
          <SeasonValue label="Maximum" value={statistics.maximum} />
        </dl>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {statistics.nombreFabrications} fabrication(s)
      </p>
    </div>
  );
}

function SeasonValue({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold">{value == null ? "—" : `${formatNumber(value)} %`}</dd>
    </div>
  );
}

function AnomalyPanel({ data, error, isLoading, onRetry }: {
  data: ReturnType<typeof useFabricationAnalytics>["anomalies"];
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}) {
  return (
    <AnalyticsCard
      title="Anomalies détectées"
      description="Signaux IQR calculés par rapport aux fabrications historiques comparables."
      icon={<AlertTriangle className="size-5" />}
    >
      {isLoading ? <PanelLoadingState /> : error ? <ErrorState message={error} onRetry={onRetry} /> : !data ? (
        <EmptyState message="Aucune donnée d’analyse disponible." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={data.anomalies.length > 0 ? "destructive" : "outline"}>
              {data.anomalies.length} lot(s) signalé(s)
            </Badge>
            <span className="text-muted-foreground">
              Baseline minimale : {data.minimumEchantillons} échantillons
            </span>
          </div>

          {data.donneesInsuffisantes.length > 0 && (
            <div className="rounded-2xl border border-amber-600/25 bg-amber-500/[0.06] p-3 text-sm">
              <p className="font-medium">Pas encore assez de données pour détecter des anomalies fiables.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.donneesInsuffisantes.length} fabrication(s) n’ont pas une baseline historique suffisante.
              </p>
            </div>
          )}

          {data.anomalies.length === 0 ? (
            <EmptyState message={data.donneesInsuffisantes.length > 0
              ? "Aucune conclusion supplémentaire ne peut être tirée pour ce périmètre."
              : "Aucune anomalie détectée pour ce périmètre."}
            />
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {data.anomalies.map((anomaly) => (
                <AnomalyCard key={anomaly.fabricationId} anomaly={anomaly} />
              ))}
            </div>
          )}
        </div>
      )}
    </AnalyticsCard>
  );
}

function AnomalyCard({ anomaly }: { anomaly: FabricationAnomaly }) {
  return (
    <article className="rounded-2xl border border-destructive/20 bg-destructive/[0.035] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold">Lot {anomaly.numeroLot}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {anomaly.fromageNom} · {formatDateTime(anomaly.dateHeureDebut)}
          </p>
        </div>
        <Badge variant="outline" className="border-destructive/30 text-destructive">
          {baselineLabel(anomaly.baselineUtilisee)}
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        {anomaly.anomalies.map((detail) => (
          <div key={detail.parametre} className="rounded-xl bg-background/65 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={detail.direction === "BASSE" ? "secondary" : "destructive"}>
                {parameterLabel(detail.parametre)} {directionLabel(detail.direction)}
              </Badge>
              <span className="font-mono text-sm font-semibold">
                {formatNumber(detail.valeur)} {detail.parametre === "RENDEMENT" ? "%" : "°C"}
              </span>
            </div>
            <p className="mt-2 text-sm">{detail.message}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Intervalle attendu : {formatNumber(detail.borneBasse)} à {formatNumber(detail.borneHaute)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function AnalyticsCard({ title, description, icon, children }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden rounded-3xl border-border/70 bg-card/70 shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
          <div>
            <CardTitle className="font-serif text-xl">{title}</CardTitle>
            <CardDescription className="mt-1 leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-auto">{children}</CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Chargement du suivi des paramètres...</span>
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {[1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
}

function PanelLoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Chargement des anomalies...</span>
      {[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
      <p className="font-medium">Impossible de charger cette analyse.</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        <RefreshCw /> Réessayer
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-border bg-background/35 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));
}

function parameterLabel(parameter: AnomalyParameter): string {
  return parameter === "RENDEMENT" ? "Rendement" : "Température";
}

function directionLabel(direction: AnomalyDirection): string {
  return direction === "BASSE" ? "basse" : "haute";
}

function baselineLabel(value: string): string {
  const labels: Record<string, string> = {
    MEME_RECETTE_ET_SAISON: "Même recette et saison",
    MEME_RECETTE: "Même recette",
    MEME_FROMAGE_ET_SAISON: "Même fromage et saison",
    MEME_FROMAGE: "Même fromage",
  };
  return labels[value] ?? value;
}
