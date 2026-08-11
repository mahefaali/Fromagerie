import React from 'react';
import { TurningsTable } from './sections/TurningsTable';
import { UpcomingReleasesTable } from './sections/UpcomingReleasesTable';
import { CellarGridOverview } from './sections/CellarGridOverview';
import { ProductionPlannerTable } from './sections/ProductionPlannerTable';
import { Badge } from "./../../components/ui/badge";
import { AlertCircle, PackageCheck } from 'lucide-react';

export const CheeseryDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#3d312a] p-4 sm:p-6 lg:p-0 font-sans ">
      <div className="max-w-7xl m-0 space-y-6">

        {/* --- BANNIÈRE D'EN-TÊTE DU TABLEAU DE BORD --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e8dfd5]">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#8c7a6b]">Mercredi 15 Janvier 2025</span>
            <Badge variant="outline" className="bg-[#fbebe6] border-[#f4c7b8] text-[#c85a32] flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> 4 retournements en attente
            </Badge>
            <Badge variant="outline" className="bg-[#edf5eb] border-[#c6e3c2] text-[#2d5a27] flex items-center gap-1 font-semibold">
              <PackageCheck className="w-3.5 h-3.5" /> 4 lots à sortir
            </Badge>
          </div>

          {/* KPI Header Stats */}
          <div className="flex items-center gap-6 text-center text-xs text-[#706053]">
            <div>
              <p className="text-lg font-black text-[#3d312a]">13</p>
              <p className="text-[10px] text-[#8c7a6b] uppercase">Lots en cave</p>
            </div>
            <div className="border-l border-[#e8dfd5] pl-6">
              <p className="text-lg font-black text-[#3d312a]">130</p>
              <p className="text-[10px] text-[#8c7a6b] uppercase">Pièces totales</p>
            </div>
            <div className="border-l border-[#e8dfd5] pl-6">
              <p className="text-lg font-black text-[#2d5a27]">4</p>
              <p className="text-[10px] text-[#8c7a6b] uppercase">Prêts</p>
            </div>
            <div className="border-l border-[#e8dfd5] pl-6">
              <p className="text-lg font-black text-[#d97706]">6</p>
              <p className="text-[10px] text-[#8c7a6b] uppercase">Sorties ≤7j</p>
            </div>
            <div className="border-l border-[#e8dfd5] pl-6">
              <p className="text-lg font-black text-[#c85a32]">4</p>
              <p className="text-[10px] text-[#8c7a6b] uppercase">Retournements</p>
            </div>
          </div>
        </header>

        {/* --- BLOC SUPÉRIEUR : TABLEAUX D'ALERTE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TurningsTable />
          <UpcomingReleasesTable />
        </div>

        {/* --- BLOC INFÉRIEUR : CAVES & PRODUCTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CellarGridOverview />
          <ProductionPlannerTable />
        </div>

      </div>
    </div>
  );
};

export default CheeseryDashboard;