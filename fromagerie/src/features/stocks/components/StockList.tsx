import React, { useEffect, useMemo, useState } from 'react';
import { PaginationControls } from '../../../components/ui/pagination-controls';
import { StockCard, type StockItem } from './StockCard';

interface StockListProps {
  groupedItems: Record<string, StockItem[]>;
  hasResults: boolean;
  declaringLossId?: string | null;
  onDeclareExpiredLoss?: (item: StockItem) => Promise<void>;
}

const ITEMS_PER_PAGE = 6;

export const StockList: React.FC<StockListProps> = ({
  groupedItems,
  hasResults,
  declaringLossId,
  onDeclareExpiredLoss,
}) => {
  const [page, setPage] = useState(1);
  const entries = useMemo(
    () => Object.entries(groupedItems).flatMap(([groupTitle, items]) =>
      items.map((item) => ({ groupTitle, item })),
    ),
    [groupedItems],
  );
  const pageCount = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [groupedItems]);

  const pageGroups = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return entries.slice(start, start + ITEMS_PER_PAGE).reduce<Record<string, StockItem[]>>(
      (groups, { groupTitle, item }) => {
        (groups[groupTitle] ??= []).push(item);
        return groups;
      },
      {},
    );
  }, [entries, page]);

  if (!hasResults) {
    return (
      <div className="mt-5 flex items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 p-6 text-center text-stone-500 sm:p-8">
        Aucun produit fini en stock correspondant à votre recherche.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(pageGroups).map(([groupTitle, items]) => {
        const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0);
        return (
          <section key={groupTitle}>
            <div className="mb-2.5 flex items-center justify-between border-b border-gray-200 pb-1.5">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">{groupTitle}</h2>
              <span className="text-xs font-medium text-gray-500 sm:text-sm">
                {totalQty} pièce(s) sur cette page
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  declaringLoss={declaringLossId === item.id}
                  onDeclareExpiredLoss={onDeclareExpiredLoss}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex justify-end pb-16 lg:pb-12">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          label="Pagination des lots en stock"
        />
      </div>
    </div>
  );
};
