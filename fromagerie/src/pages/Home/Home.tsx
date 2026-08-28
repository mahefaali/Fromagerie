import { useEffect, useState } from "react";
import { ArrowRight, AlertTriangle, CalendarClock, MoveRight, PackageCheck, RefreshCw, Warehouse } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "./../../components/ui/badge";
import { Button } from "./../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../components/ui/card";
import { useAuth } from "../../features/authentication/hooks/useAuth";
import { affinageApi } from "../../features/affinage/api/affinageApi";
import { stockApi, type StockFromageFini } from "../../features/stocks/api/stockApi";
import type {
  AffinageAlertItem,
  AffinageCapacityPlanning,
  AffinageDashboard,
  CaveCapacityPlanning,
} from "../../features/affinage/types/affinage.types";

function AlertList({ title, icon: Icon, items, emptyLabel }: {
  title: string;
  icon: typeof AlertTriangle;
  items: AffinageAlertItem[];
  emptyLabel: string;
}) {
  return (
    <Card className="border-[#e8dfd5] bg-[#fcfaf7] shadow-sm">
      <CardHeader className="border-b border-[#eee7de] pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#5c4a3e] tracking-wide">
          <Icon className="w-4 h-4 text-[#c85a32]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-[#8c7a6b]">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 4).map((item) => (
              <Link
                key={`${item.lotId}-${title}`}
                to={item.route}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#eee7de] bg-white p-3 transition-colors hover:bg-[#f7f2ec]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#3d312a]">{item.numeroLot}</span>
                    <Badge variant="outline" className="border-[#e8dfd5] bg-[#f5eee6] text-[#5c4a3e] text-[10px]">
                      {item.joursRestants <= 0 ? "Sortie" : `${item.joursRestants} j`}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#3d312a]">
                    {item.fromageNom} · {item.recetteNom}
                  </p>
                  <p className="mt-1 text-xs text-[#8c7a6b]">{item.message}</p>
                  <p className="mt-1 text-xs text-[#8c7a6b]">{item.caveNom}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-[#c85a32]" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CapacityPlanning({ planning, loading, error }: {
  planning: AffinageCapacityPlanning | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <Card className="border-[#e8dfd5] bg-[#fcfaf7] shadow-sm">
      <CardHeader className="flex flex-col gap-2 border-b border-[#eee7de] sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base font-bold text-[#5c4a3e]">Capacité des caves</CardTitle>
          <p className="mt-1 text-sm text-[#8c7a6b]">Prévision des places disponibles selon les sorties prévues.</p>
        </div>
        <Link to="/affinage" className="text-sm font-semibold text-[#c85a32] hover:underline">
          Voir les caves
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <p role="status" className="text-sm text-[#8c7a6b]">Chargement de la capacité...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-[#a63d2f]">{error}</p>
        ) : !planning || planning.caves.length === 0 ? (
          <p className="text-sm text-[#8c7a6b]">Aucune cave disponible.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-[#eee7de] text-left text-xs uppercase tracking-wide text-[#8c7a6b]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Cave</th>
                    <th className="px-3 py-3 text-right font-semibold">Maintenant</th>
                    <th className="px-3 py-3 text-right font-semibold">Dans 7 jours</th>
                    <th className="px-3 py-3 text-right font-semibold">Dans 30 jours</th>
                  </tr>
                </thead>
                <tbody>
                  {planning.caves.map((cave) => <CapacityRow key={cave.caveId} cave={cave} />)}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 sm:hidden">
              {planning.caves.map((cave) => <CapacityCard key={cave.caveId} cave={cave} />)}
            </div>
            <p className="mt-4 text-xs text-[#8c7a6b]">
              « Maintenant » est la disponibilité réelle. « Dans 7 jours » et « Dans 30 jours » sont des prévisions basées sur les sorties prévues.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CapacityRow({ cave }: { cave: CaveCapacityPlanning }) {
  return (
    <tr className="border-b border-[#f1ebe4] last:border-0">
      <td className="px-3 py-3 font-semibold text-[#3d312a]">{cave.caveNom}</td>
      <td className="px-3 py-3 text-right font-bold text-[#3d312a]">{cave.placesLibresMaintenant}</td>
      <td className="px-3 py-3 text-right text-[#706053]">{cave.placesLibresJ7}</td>
      <td className="px-3 py-3 text-right text-[#706053]">{cave.placesLibresJ30}</td>
    </tr>
  );
}

function CapacityCard({ cave }: { cave: CaveCapacityPlanning }) {
  return (
    <div className="rounded-xl border border-[#eee7de] bg-white p-3">
      <p className="font-semibold text-[#3d312a]">{cave.caveNom}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <CapacityValue label="Maintenant" value={cave.placesLibresMaintenant} actual />
        <CapacityValue label="Dans 7 jours" value={cave.placesLibresJ7} />
        <CapacityValue label="Dans 30 jours" value={cave.placesLibresJ30} />
      </div>
    </div>
  );
}

function CapacityValue({ label, value, actual = false }: { label: string; value: number; actual?: boolean }) {
  return (
    <div className={actual ? "rounded-lg bg-[#f5eee6] p-2" : "rounded-lg bg-[#faf8f5] p-2"}>
      <p className="text-[10px] uppercase tracking-wide text-[#8c7a6b]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#3d312a]">{value}</p>
    </div>
  );
}

function stockQuantity(stock: StockFromageFini) {
  const sorties = stock.mouvements
    .filter((movement) => movement.type === "SORTIE")
    .reduce((total, movement) => total + movement.quantite, 0);
  const ajustements = stock.mouvements
    .filter((movement) => movement.type === "AJUSTEMENT")
    .reduce((total, movement) => total + movement.quantite, 0);
  return Math.max(0, stock.quantiteInitiale - sorties + ajustements);
}

function StockAttentionCard({ title, icon: Icon, stocks, emptyLabel, today, expired = false }: {
  title: string;
  icon: typeof AlertTriangle;
  stocks: StockFromageFini[];
  emptyLabel: string;
  today: Date;
  expired?: boolean;
}) {
  return (
    <Card className="border-[#e8dfd5] bg-[#fcfaf7] shadow-sm">
      <CardHeader className="border-b border-[#eee7de] pb-3"><CardTitle className="flex items-center gap-2 text-sm font-bold text-[#5c4a3e]"><Icon className="size-4 text-[#c85a32]" />{title}</CardTitle></CardHeader>
      <CardContent className="p-4">
        {stocks.length === 0 ? <p className="text-sm text-[#8c7a6b]">{emptyLabel}</p> : (
          <div className="space-y-2">
            {stocks.slice(0, 4).map((stock) => {
              const days = Math.ceil((new Date(stock.dateDurabilite).getTime() - today.getTime()) / 86_400_000);
              return <Link key={stock.id} to="/stock" className="flex items-center justify-between rounded-xl border border-[#eee7de] bg-white p-3 hover:bg-[#f7f2ec]">
                <span><span className="block text-sm font-semibold text-[#3d312a]">{stock.fromageNom}</span><span className="block text-xs text-[#8c7a6b]">{stock.numeroLotFabrication} · {stock.emplacementStockNom}</span></span>
                <span className={`text-xs font-semibold ${expired ? "text-[#a63d2f]" : "text-[#c85a32]"}`}>{expired ? `${Math.abs(days)} j dépassé` : `${days} j`}</span>
              </Link>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SalesHome({ stocks, loading, error }: { stocks: StockFromageFini[]; loading: boolean; error: string | null }) {
  const today = new Date();
  const availableStocks = stocks.filter((stock) => stock.statut === "DISPONIBLE");
  const totalAvailable = availableStocks.reduce((total, stock) => total + stockQuantity(stock), 0);
  const expiringStocks = availableStocks
    .filter((stock) => {
      const days = Math.ceil((new Date(stock.dateDurabilite).getTime() - today.getTime()) / 86_400_000);
      return days >= 0 && days <= 7;
    })
    .sort((left, right) => left.dateDurabilite.localeCompare(right.dateDurabilite));
  const expiredStocks = availableStocks
    .filter((stock) => new Date(stock.dateDurabilite) < today)
    .sort((left, right) => left.dateDurabilite.localeCompare(right.dateDurabilite));

  return (
    <>
      {error && <Card className="border-[#f4c7b8] bg-[#fff7f4]"><CardContent className="p-4 text-sm text-[#a63d2f]">{error}</CardContent></Card>}
      {loading ? (
        <Card className="border-[#e8dfd5] bg-[#fcfaf7]"><CardContent className="p-6 text-sm text-[#8c7a6b]">Chargement du stock disponible...</CardContent></Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Pièces disponibles" value={totalAvailable} hint="Stock prêt à vendre" />
            <StatCard label="DLC / DDM proches" value={expiringStocks.length} hint="Dans les 7 prochains jours" />
            <StatCard label="Lots dépassés" value={expiredStocks.length} hint="À contrôler" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <StockAttentionCard title="DLC / DDM proches" icon={CalendarClock} stocks={expiringStocks} emptyLabel="Aucun lot proche de sa date limite." today={today} />
            <StockAttentionCard title="Lots dépassés" icon={AlertTriangle} stocks={expiredStocks} emptyLabel="Aucun lot dépassé." today={today} expired />
          </div>
        </>
      )}
    </>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AffinageDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planning, setPlanning] = useState<AffinageCapacityPlanning | null>(null);
  const [planningLoading, setPlanningLoading] = useState(true);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [salesStocks, setSalesStocks] = useState<StockFromageFini[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "VENTE") {
      setLoading(false);
      setPlanningLoading(false);
      return;
    }
    let active = true;
    affinageApi.dashboard()
      .then((data) => active && setDashboard(data))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Chargement impossible."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "VENTE") return;
    let active = true;
    affinageApi.planification()
      .then((data) => active && setPlanning(data))
      .catch((err) => active && setPlanningError(err instanceof Error ? err.message : "Planification impossible."))
      .finally(() => active && setPlanningLoading(false));
    return () => {
      active = false;
    };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "VENTE") return;
    let active = true;
    setSalesLoading(true);
    stockApi.findStocks()
      .then((data) => active && setSalesStocks(data))
      .catch((err) => active && setSalesError(err instanceof Error ? err.message : "Chargement du stock impossible."))
      .finally(() => active && setSalesLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  const actionCount =
    (dashboard?.retounementsAEffectuer.length ?? 0) +
    (dashboard?.retounementsEnRetard.length ?? 0) +
    (dashboard?.sortiesProches.length ?? 0) +
    (dashboard?.lotsPretsASortir.length ?? 0) +
    (dashboard?.changementsCaveRecommandes.length ?? 0);

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-[#3d312a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-[#e8dfd5] bg-[#fcfaf7] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8c7a6b]">{user?.role === "VENTE" ? "Accueil vente" : "Accueil fabrication"}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#3d312a]">
                Qu’est-ce que je dois faire aujourd’hui ?
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#706053]">
                {user?.role === "VENTE"
                  ? "Les informations prioritaires sur le stock disponible et les dates limites sont regroupées ici."
                  : "Les alertes prioritaires sont regroupées ici pour guider les actions du jour: retournements, sorties proches, lots prêts et recommandations de cave."}
              </p>
            </div>
            {user?.role !== "VENTE" && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-[#f4c7b8] bg-[#fbebe6] text-[#c85a32]">
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> {dashboard?.retounementsAEffectuer.length ?? 0} retournements
                </Badge>
                <Badge variant="outline" className="border-[#c6e3c2] bg-[#edf5eb] text-[#2d5a27]">
                  <PackageCheck className="mr-1 h-3.5 w-3.5" /> {dashboard?.lotsPretsASortir.length ?? 0} prêts à sortir
                </Badge>
                <Badge variant="outline" className="border-[#d6d3ff] bg-[#f1efff] text-[#4f46e5]">
                  <Warehouse className="mr-1 h-3.5 w-3.5" /> {dashboard?.placesLibres ?? 0} places libres
                </Badge>
              </div>
            )}
          </div>

          {user?.role !== "VENTE" && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Lots suivis" value={dashboard?.lotsEnAffinage ?? 0} hint="En affinage actif" />
              <StatCard label="Actions du jour" value={actionCount} hint="Alertes priorisées" />
              <StatCard label="Lots prêts" value={dashboard?.lotsPrets ?? 0} hint="Sortie ou traitement" />
              <StatCard label="Places libres" value={dashboard?.placesLibres ?? 0} hint="Capacité disponible" />
            </div>
          )}
        </section>

      {user?.role === "VENTE" ? (
        <SalesHome stocks={salesStocks} loading={salesLoading} error={salesError} />
      ) : user?.role === "FABRICATION" || user?.role === "PROPRIETAIRE" ? (
          <>
            {error ? (
              <Card className="border-[#f4c7b8] bg-[#fff7f4]">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <p className="text-sm text-[#a63d2f]">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
                </CardContent>
              </Card>
            ) : null}

            {loading ? (
              <Card className="border-[#e8dfd5] bg-[#fcfaf7]">
                <CardContent className="p-6 text-sm text-[#8c7a6b]">Chargement des alertes d’affinage...</CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <AlertList title="Retournements à effectuer" icon={RefreshCw} items={dashboard?.retounementsAEffectuer ?? []} emptyLabel="Aucun retournement prioritaire." />
                  <AlertList title="Sorties d’affinage proches" icon={CalendarClock} items={dashboard?.sortiesProches ?? []} emptyLabel="Aucune sortie dans les 7 prochains jours." />
                  <AlertList title="Lots prêts à sortir" icon={PackageCheck} items={dashboard?.lotsPretsASortir ?? []} emptyLabel="Aucun lot prêt à sortir." />
                  <AlertList title="Déplacements conseillés" icon={MoveRight} items={dashboard?.changementsCaveRecommandes ?? []} emptyLabel="Aucun changement de cave recommandé." />
                </div>
                <div className="mt-6">
                  <CapacityPlanning planning={planning} loading={planningLoading} error={planningError} />
                </div>
              </>
            )}
          </>
        ) : (
          <Card className="border-[#e8dfd5] bg-[#fcfaf7]">
            <CardContent className="p-6">
              <p className="text-sm text-[#706053]">
                Votre rôle n’affiche pas le tableau d’actions d’affinage.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => navigate("/affinage")} className="bg-[#c85a32] text-white hover:bg-[#b24f2c]">
            Ouvrir le suivi d’affinage
          </Button>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#eee7de] bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8c7a6b]">{label}</p>
      <div className="mt-2 text-3xl font-bold text-[#3d312a]">{value}</div>
      <p className="mt-1 text-xs text-[#8c7a6b]">{hint}</p>
    </div>
  );
}
