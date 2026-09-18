import { useEffect, useState } from "react";

import { affinageApi } from "../../features/affinage/api/affinageApi";
import type { AffinageCapacityPlanning, AffinageDashboard } from "../../features/affinage/types/affinage.types";
import { useAuth } from "../../features/authentication/hooks/useAuth";
import { stockApi, type StockFromageFini } from "../../features/stocks/api/stockApi";

export function useHomeDashboard() {
  const { user } = useAuth();
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
    if (user?.role !== "FABRICATION") {
      setLoading(false);
      setPlanningLoading(false);
      return;
    }
    let active = true;
    affinageApi.dashboard()
      .then((data) => active && setDashboard(data))
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Chargement impossible."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "FABRICATION") return;
    let active = true;
    affinageApi.planification()
      .then((data) => active && setPlanning(data))
      .catch((requestError) => active && setPlanningError(requestError instanceof Error ? requestError.message : "Planification impossible."))
      .finally(() => active && setPlanningLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "VENTE") return;
    let active = true;
    setSalesLoading(true);
    stockApi.findStocks()
      .then((data) => active && setSalesStocks(data))
      .catch((requestError) => active && setSalesError(requestError instanceof Error ? requestError.message : "Chargement du stock impossible."))
      .finally(() => active && setSalesLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  const actionCount = (dashboard?.retounementsAEffectuer.length ?? 0)
    + (dashboard?.retounementsEnRetard.length ?? 0)
    + (dashboard?.sortiesProches.length ?? 0)
    + (dashboard?.lotsPretsASortir.length ?? 0)
    + (dashboard?.changementsCaveRecommandes.length ?? 0);

  return { user, dashboard, loading, error, planning, planningLoading, planningError, salesStocks, salesLoading, salesError, actionCount };
}
