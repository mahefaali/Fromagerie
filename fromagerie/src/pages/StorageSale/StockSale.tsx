import React, { lazy, Suspense, useState } from 'react';
import { Archive, ClipboardList, TriangleAlert } from 'lucide-react';
import { StockHeader } from '../../features/stocks/components/StockHeader';
import { StockAlertBanner } from '../../features/stocks/components/StockAlertBanner';
import { StockKpiGrid } from '../../features/stocks/components/StockKpiGrid';
import { StockFilters } from '../../features/stocks/components/StockFilters';
import { StockList } from '../../features/stocks/components/StockList';
import { useStock } from '../../features/stocks/useStock';
import { GROUP_BY_OPTIONS } from '../../features/stocks/stock.constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LazyContentFallback } from '../../components/common/LazyContentFallback';

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
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500 bg-white/50">
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
    </>
  );
};

export const StockSale: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stock');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 font-sans text-[#2c2825]">
      <div className="max-w-7xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
          className="w-full gap-6"
        >
          <TabsList className="max-w-2xl grid grid-cols-3">
            <TabsTrigger value="stock">
              <Archive className="size-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ClipboardList className="size-4" />
              Commande
            </TabsTrigger>
            <TabsTrigger value="unsold_loss">
              <TriangleAlert className="size-4" />
              Invendu &amp; Perte
            </TabsTrigger>
          </TabsList>

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
