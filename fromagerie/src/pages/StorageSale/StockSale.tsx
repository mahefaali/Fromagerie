import React, { useState } from 'react';
import { StockHeader } from './sections/StockHeader';
import { StockAlertBanner } from './sections/StockAlertBanner';
import { StockKpiGrid } from './sections/StockKpiGrid';
import { StockFilters } from './sections/StockFilters';
import { StockList } from './sections/StockList';
import { useStock } from './useStock';
import { LOCATION_OPTIONS, GROUP_BY_OPTIONS, MOCK_EXPIRING_ITEMS } from './stock.constants';
import { OrdersView } from './sections/OrdersView';

// Type pour les onglets principaux
export type ActiveTab = 'stock' | 'orders' | 'unsold_loss';

interface TabOption {
  id: ActiveTab;
  label: string;
}

const TABS: TabOption[] = [
  { id: 'stock', label: 'Stock' },
  { id: 'orders', label: 'Commande' },
  { id: 'unsold_loss', label: 'Invendu & Perte' },
];

/**
 * Vue du stock extraite pour maintenir le composant principal clair et modulable
 */
const StockView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    groupBy,
    setGroupBy,
    groupedItems,
    hasResults,
  } = useStock();

  const kpiData = {
    totalPieces: 35,
    totalLocations: 3,
    expiringSoon: 2,
    totalValue: 412.00,
  };

  return (
    <>
      <StockHeader />
      <StockAlertBanner items={MOCK_EXPIRING_ITEMS} />
      <StockKpiGrid data={kpiData} />

      <StockFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        locationOptions={LOCATION_OPTIONS}
        groupByOptions={GROUP_BY_OPTIONS}
      />

      <StockList groupedItems={groupedItems} hasResults={hasResults} />
    </>
  );
};

export const StockSale: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stock');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 font-sans text-[#2c2825]">
      <div className="max-w-7xl mx-auto">
        {/* Navigation des 3 onglets principaux */}
        <nav className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#2d4a27] text-white shadow-sm'
                    : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Affichage conditionnel des modules */}
        {activeTab === 'stock' && <StockView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'unsold_loss' && (
          <div className="bg-white/60 border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500 font-medium">
            Module Invendu & Perte à venir
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSale;