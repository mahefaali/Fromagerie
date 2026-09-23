import React, { lazy, Suspense } from 'react';
import { Archive, ClipboardList, TriangleAlert } from 'lucide-react';
import { StockHeader } from '../../features/stocks/components/StockHeader';
import { StockAlertBanner } from '../../features/stocks/components/StockAlertBanner';
import { StockKpiGrid } from '../../features/stocks/components/StockKpiGrid';
import { StockFilters } from '../../features/stocks/components/StockFilters';
import { StockList } from '../../features/stocks/components/StockList';
import { useStock } from '../../features/stocks/useStock';
import { GROUP_BY_OPTIONS } from '../../features/stocks/stock.constants';
import { Tabs, TabsContent } from '../../components/ui/tabs';
import { LazyContentFallback } from '../../components/common/LazyContentFallback';
import { PageTabsPortal } from '../../layouts/components/PageTabsPortal';
import { usePersistentTab } from '../../hooks/usePersistentTab';
import { FloatingSubnavigation } from '../../components/ui/FloatingSubnavigation';

const OrdersView = lazy(() =>
  import('../../features/stocks/components/OrdersView').then((module) => ({ default: module.OrdersView })),
);
const UnsoldLossView = lazy(() =>
  import('../../features/stocks/components/UnsoldLossView').then((module) => ({ default: module.UnsoldLossView })),
);

export type ActiveTab = 'stock' | 'orders' | 'unsold_loss';

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
    stocks,
    expiringSoonItems,
    expiredItems,
    loading,
    locationOptions,
    declaringLossId,
    declareExpiredLoss,
  } = useStock();

  const kpiData = {
    totalPieces: stocks.reduce((acc, item) => acc + item.quantitePhysique, 0),
    totalLocations: new Set(stocks.map((item) => item.emplacementStockId)).size,
    expiringSoon: expiringSoonItems.length,
  };

  return (
    <>
      <StockHeader />
      <div className="pl-2 sm:pl-3 lg:pl-4">
      <StockAlertBanner items={[...expiredItems, ...expiringSoonItems].map((item) => ({
        id: String(item.id),
        name: item.fromageNom,
        code: item.numeroLotFabrication,
        daysRemaining: Math.ceil((new Date(item.dateDurabilite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        durabilityType: item.typeDateDurabilite,
      }))} />
      <StockKpiGrid data={kpiData} />

      <StockFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        locationOptions={locationOptions}
        groupByOptions={GROUP_BY_OPTIONS}
      />

      {loading ? (
        <div className="mt-5 rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 bg-white/50 sm:p-8">
          Chargement du stock fini...
        </div>
      ) : (
        <StockList
          groupedItems={groupedItems}
          hasResults={hasResults}
          declaringLossId={declaringLossId}
          onDeclareExpiredLoss={declareExpiredLoss}
        />
      )}
      </div>
    </>
  );
};

export const StockSale: React.FC = () => {
  const [activeTab, setActiveTab] = usePersistentTab<ActiveTab>('subnavigation:stock-sales', 'stock');

  return (
    <div className="min-h-screen bg-background py-2 font-sans text-[#2c2825] sm:px-1 sm:py-3">
      <div className="mx-auto max-w-[1440px]">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
          className="w-full gap-5"
        >
          <PageTabsPortal>
            <FloatingSubnavigation
              value={activeTab}
              items={[
                { value: 'stock', label: 'Stock', icon: Archive },
                { value: 'orders', label: 'Commande', icon: ClipboardList },
                { value: 'unsold_loss', label: 'Invendu & Perte', icon: TriangleAlert },
              ]}
              onValueChange={setActiveTab}
              ariaLabel="Navigation du stock et des ventes"
            />
          </PageTabsPortal>

          <TabsContent value="stock" className="m-0">
            <StockView />
          </TabsContent>
          <TabsContent value="orders" className="m-0">
            <Suspense fallback={<LazyContentFallback />}>
              <OrdersView />
            </Suspense>
          </TabsContent>
          <TabsContent value="unsold_loss" className="m-0">
            <Suspense fallback={<LazyContentFallback />}>
              <UnsoldLossView />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StockSale;
