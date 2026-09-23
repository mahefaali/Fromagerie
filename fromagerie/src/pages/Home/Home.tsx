import { lazy, Suspense } from "react";
import { CalendarClock, MoveRight, PackageCheck, RefreshCw, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { LazyContentFallback } from "../../components/common/LazyContentFallback";
import {
  AlertList,
  CapacityPlanning,
  SalesHome,
  StatCard,
} from "./HomeDashboardSections";
import { useHomeDashboard } from "./useHomeDashboard";

const OwnerPerformanceDashboard = lazy(() =>
  import("../../features/performance/components/OwnerPerformanceDashboard"),
);

export default function HomePage() {
  const navigate = useNavigate();
  const {
    user, dashboard, loading, error, planning, planningLoading, planningError,
    salesStocks, salesLoading, salesError, actionCount,
  } = useHomeDashboard();

  if (user?.role === "PROPRIETAIRE") {
    return (
      <Suspense fallback={<LazyContentFallback />}>
        <OwnerPerformanceDashboard />
      </Suspense>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] py-2 text-[#3d312a] sm:px-1 sm:py-3">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <section className="rounded-2xl border border-[#e8dfd5] bg-[#fcfaf7] p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8c7a6b]">{user?.role === "VENTE" ? "Accueil vente" : "Accueil fabrication"}</p>
              <h1 className="mt-1.5 text-xl font-bold tracking-tight text-[#3d312a] sm:text-2xl">
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
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Lots suivis" value={dashboard?.lotsEnAffinage ?? 0} hint="En affinage actif" />
              <StatCard label="Actions du jour" value={actionCount} hint="Alertes priorisées" />
              <StatCard label="Lots prêts" value={dashboard?.lotsPrets ?? 0} hint="Sortie ou traitement" />
              <StatCard label="Places libres" value={dashboard?.placesLibres ?? 0} hint="Capacité disponible" />
            </div>
          )}
        </section>

      <div className="space-y-5 pl-2 sm:pl-3 lg:pl-4">
      {user?.role === "VENTE" ? (
        <SalesHome stocks={salesStocks} loading={salesLoading} error={salesError} />
      ) : user?.role === "FABRICATION" ? (
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
                <div className="grid gap-4 lg:grid-cols-2">
                  <AlertList title="Retournements à effectuer" icon={RefreshCw} items={dashboard?.retounementsAEffectuer ?? []} emptyLabel="Aucun retournement prioritaire." />
                  <AlertList title="Sorties d’affinage proches" icon={CalendarClock} items={dashboard?.sortiesProches ?? []} emptyLabel="Aucune sortie dans les 7 prochains jours." />
                  <AlertList title="Lots prêts à sortir" icon={PackageCheck} items={dashboard?.lotsPretsASortir ?? []} emptyLabel="Aucun lot prêt à sortir." />
                  <AlertList title="Déplacements conseillés" icon={MoveRight} items={dashboard?.changementsCaveRecommandes ?? []} emptyLabel="Aucun changement de cave recommandé." />
                </div>
                <div className="mt-4">
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
          <Button
            onClick={() => navigate(user?.role === "VENTE" ? "/stock" : "/affinage")}
            className="bg-[#c85a32] text-white hover:bg-[#b24f2c]"
          >
            {user?.role === "VENTE" ? "Ouvrir le stock et les ventes" : "Ouvrir le suivi d’affinage"}
          </Button>
        </div>
      </div>
      </div>
    </main>
  );
}
