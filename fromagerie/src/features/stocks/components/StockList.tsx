import React from 'react';
import { StockCard, type StockItem } from './StockCard';

interface StockListProps {
  groupedItems: Record<string, StockItem[]>;
  hasResults: boolean;
}

export const StockList: React.FC<StockListProps> = ({ groupedItems, hasResults }) => {
  if (!hasResults) {
    return (
      <div className="mt-8 flex items-center justify-center rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500 bg-white/50">
        Aucun produit fini en stock correspondant à votre recherche.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([groupTitle, items]) => {
        const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0);
        return (
          <div key={groupTitle} className="mt-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">{groupTitle}</h2>
              <span className="text-sm text-gray-500 font-medium">
                {totalQty} pièce(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <StockCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};