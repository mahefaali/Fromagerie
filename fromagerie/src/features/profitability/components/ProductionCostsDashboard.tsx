import { useMemo, useState } from "react";

import type { LotProductionCost } from "../api/profitabilityApi";
import {
  // CategoryDetails,
  CostBreakdown,
  LotCostCards,
  LotCostDialog,
  MonthlyCostChart,
  ProductionCostMetrics,
} from "./ProductionCostSections";
import {
  aggregateCostCategories,
  aggregateMonthlyCosts,
  filterProductionCostLots,
} from "./productionCosts.utils";

type Props = {
  lots: LotProductionCost[];
  dateDebut: string;
  dateFin: string;
  fromageId?: number;
};

export function ProductionCostsDashboard({ lots, dateDebut, dateFin, fromageId }: Props) {
  const [selectedLot, setSelectedLot] = useState<LotProductionCost | null>(null);
  const filteredLots = useMemo(
    () => filterProductionCostLots(lots, dateDebut, dateFin, fromageId),
    [lots, dateDebut, dateFin, fromageId],
  );
  const categories = useMemo(() => aggregateCostCategories(filteredLots), [filteredLots]);
  const monthlyCosts = useMemo(() => aggregateMonthlyCosts(filteredLots), [filteredLots]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProductionCostMetrics categories={categories} lotCount={filteredLots.length} />
      <CostBreakdown categories={categories} hasOtherPeriods={lots.length > 0} />
      <MonthlyCostChart data={monthlyCosts} />
      {/* <CategoryDetails categories={categories} lots={filteredLots} /> */}
      <LotCostCards lots={filteredLots} onSelect={setSelectedLot} />
      <LotCostDialog lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </div>
  );
}
