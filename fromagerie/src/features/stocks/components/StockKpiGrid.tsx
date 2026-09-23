import React from 'react';
import { Card } from '../../../components/ui/card';
import { Package, Warehouse, CalendarClock } from 'lucide-react';

interface KpiData {
  totalPieces: number;
  totalLocations: number;
  expiringSoon: number;
}

export const StockKpiGrid: React.FC<{ data: KpiData }> = ({ data }) => {
  const kpis = [
    {
      label: 'Pièces en stock',
      value: data.totalPieces,
      icon: Package,
    },
    {
      label: 'Lieux de stockage',
      value: data.totalLocations,
      icon: Warehouse,
    },
    {
      label: 'Bientôt périmés',
      value: data.expiringSoon,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 items-stretch gap-2 sm:grid-cols-3 sm:gap-2.5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="flex h-full min-w-0 flex-col justify-center gap-1 px-2.5 py-2.5 sm:px-3">
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground sm:gap-2 sm:text-sm">
              <Icon className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
              <span className="min-w-0 leading-tight">{kpi.label}</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground sm:text-xl">{kpi.value}</div>
          </Card>
        );
      })}
    </div>
  );
};
