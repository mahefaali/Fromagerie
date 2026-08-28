import React from 'react';
import { Card } from '../../../components/ui/card';
import { Package, Warehouse, CalendarClock, Snowflake } from 'lucide-react';

interface KpiData {
  totalPieces: number;
  totalLocations: number;
  expiringSoon: number;
  totalValue: number;
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
    {
      label: 'Valeur du stock',
      value: `${data.totalValue.toFixed(2)} €`,
      icon: Snowflake,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="flex flex-col justify-center h-full py-4 px-4 gap-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span>{kpi.label}</span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-foreground">{kpi.value}</div>
          </Card>
        );
      })}
    </div>
  );
};