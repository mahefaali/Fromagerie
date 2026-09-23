import { useEffect, useMemo, useState } from "react";
import { BarChart3, Coins, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { PaginationControls } from "../../../components/ui/pagination-controls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { Order } from "../types/orders";
import type { AverageProductionCost, LossCauseSummary, LossLogEntry, MonthlyLossRate, OrderReturns } from "./unsoldLoss.types";
import { orderItemKey } from "./unsoldLoss.utils";

export function ReturnsTab({ orders, returns, onSelect }: { orders: Order[]; returns: OrderReturns; onSelect: (order: Order) => void }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(orders.length / 8));
  const visibleOrders = useMemo(() => {
    const start = (page - 1) * 8;
    return orders.slice(start, start + 8);
  }, [orders, page]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  if (orders.length === 0) return <EmptyState>Aucune commande livrée pour l'instant.</EmptyState>;

  return <div className="space-y-3">
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white/70 shadow-sm">
      <Table className="min-w-[720px] table-fixed">
        <TableHeader className="bg-stone-100/80">
          <TableRow className="hover:bg-stone-100/80">
            <TableHead className="w-[18%] px-3 text-xs">Commande</TableHead>
            <TableHead className="w-[18%] px-3 text-xs">Client</TableHead>
            <TableHead className="w-[16%] px-3 text-xs">Livraison</TableHead>
            <TableHead className="w-[12%] px-3 text-right text-xs">Livrée</TableHead>
            <TableHead className="w-[12%] px-3 text-right text-xs">Retournée</TableHead>
            <TableHead className="w-[11%] px-3 text-right text-xs">Vendue</TableHead>
            <TableHead className="w-[13%] px-3 text-right text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleOrders.map((order) => {
            const saved = returns[order.id];
            const items = order.items.map((item) => ({ ...item, returnedQuantity: saved?.items[orderItemKey(item)] ?? item.returnedQuantity ?? 0 }));
            const delivered = items.reduce((sum, item) => sum + Number(item.deliveredQuantity ?? item.quantity ?? 0), 0);
            const returned = items.reduce((sum, item) => sum + Number(item.returnedQuantity ?? 0), 0);

            return <TableRow key={order.id} className="bg-white/40">
              <TableCell className="px-3 py-2.5 font-mono text-xs font-semibold text-stone-800">
                <span className="block truncate" title={order.code || order.id}>{order.code || order.id}</span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-xs font-medium text-stone-700">
                <span className="block truncate" title={order.clientName || "Client"}>{order.clientName || "Client"}</span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-xs text-stone-600">{order.deliveryDate || "Livrée"}</TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold text-stone-800">{delivered}</TableCell>
              <TableCell className="px-3 py-2.5 text-right">
                <span className="block text-sm font-semibold text-stone-800">{returned}</span>
                {saved?.returnCount ? <span className="block text-[10px] text-stone-500">{saved.returnCount} retour(s)</span> : null}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold text-stone-800">{delivered - returned}</TableCell>
              <TableCell className="px-3 py-2.5 text-right">
                <Button onClick={() => onSelect({ ...order, items })} size="sm" className="h-8 rounded-lg bg-[#2d4a27] px-2.5 text-xs font-medium text-white hover:bg-[#233a1e]">
                  <RotateCcw className="size-3.5" /> Retour
                </Button>
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
      {pageCount > 1 ? <div className="flex justify-end border-t border-stone-200 bg-stone-50/70 px-3 py-2.5">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          label="Pagination des retours d'invendus"
          className="border-stone-200 bg-white text-stone-700 [&_button]:border-stone-200"
        />
      </div> : null}
    </div>
  </div>;
}

export function LossJournalTab({ entries, onDelete }: { entries: LossLogEntry[]; onDelete: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(entries.length / 8));
  const visibleEntries = useMemo(() => {
    const start = (page - 1) * 8;
    return entries.slice(start, start + 8);
  }, [entries, page]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  if (entries.length === 0) return <EmptyState>Aucun journal de perte enregistré.</EmptyState>;

  return <div className="overflow-hidden rounded-xl border border-stone-200 bg-white/70 shadow-sm">
    <Table className="min-w-[780px] table-fixed">
      <TableHeader className="bg-stone-100/80">
        <TableRow className="hover:bg-stone-100/80">
          <TableHead className="w-[18%] px-3 text-xs">Fromage</TableHead>
          <TableHead className="w-[15%] px-3 text-xs">Date</TableHead>
          <TableHead className="w-[20%] px-3 text-xs">Référence</TableHead>
          <TableHead className="w-[18%] px-3 text-xs">Cause</TableHead>
          <TableHead className="w-[10%] px-3 text-right text-xs">Quantité</TableHead>
          <TableHead className="w-[14%] px-3 text-right text-xs">Coût</TableHead>
          <TableHead className="w-[5%] px-3 text-right text-xs"><span className="sr-only">Action</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleEntries.map((entry) => <TableRow key={entry.id} className="bg-white/40">
          <TableCell className="px-3 py-2.5">
            <span className="block truncate text-xs font-semibold text-stone-900" title={entry.cheeseName}>{entry.cheeseName}</span>
            <span className="mt-0.5 inline-flex rounded-md bg-[#c84c28] px-1.5 py-0.5 text-[10px] font-semibold text-white">{entry.badgeText}</span>
          </TableCell>
          <TableCell className="px-3 py-2.5 text-xs text-stone-600">{entry.dateFormatted}</TableCell>
          <TableCell className="px-3 py-2.5 text-xs text-stone-600">
            <span className="block truncate" title={`${entry.lotNumber} · ${entry.orderNumber}`}>{entry.lotNumber} · {entry.orderNumber}</span>
            <span className="block truncate text-[10px] text-stone-500" title={entry.clientName}>{entry.clientName}</span>
          </TableCell>
          <TableCell className="px-3 py-2.5 text-xs text-stone-600">
            <span className="block truncate" title={entry.reason}>{entry.reason}</span>
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right text-sm font-semibold text-stone-800">{entry.quantity} pcs</TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <span className="block text-sm font-bold text-[#c84c28]">{entry.totalCost.toFixed(2)} €</span>
            <span className="block text-[10px] text-stone-500">{entry.quantity} × {entry.unitCost.toFixed(2)} €</span>
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <button type="button" onClick={() => onDelete(entry.id)} className="inline-flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Supprimer la perte" aria-label={`Supprimer la perte ${entry.cheeseName}`}>
              <Trash2 className="size-4" />
            </button>
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    {pageCount > 1 ? <div className="flex justify-end border-t border-stone-200 bg-stone-50/70 px-3 py-2.5">
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        label="Pagination du journal des pertes"
        className="border-stone-200 bg-white text-stone-700 [&_button]:border-stone-200"
      />
    </div> : null}
  </div>;
}

export function LossAnalysisTab({ causes, rates }: { causes: LossCauseSummary[]; rates: MonthlyLossRate[] }) {
  return <div className="space-y-6"><section className="space-y-3"><div className="flex items-center gap-2 text-lg font-semibold text-stone-900"><BarChart3 className="size-5 text-[#2d4a27]" /><h2>Pourquoi je perds : causes par fromage</h2></div>{causes.length === 0 ? <EmptyState compact>Aucune perte enregistrée pour le moment.</EmptyState> : <div className="space-y-2">{causes.map((item) => <div key={`${item.name}-${item.badgeText}`} className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/80 p-4"><div><h3 className="text-base font-bold text-stone-900">{item.name}</h3><p className="mt-0.5 text-xs font-medium text-stone-500">{item.badgeText}</p></div><div className="text-right"><span className="block text-base font-bold text-stone-900">{item.totalQty} pcs</span><span className="mt-0.5 block text-xs font-medium text-stone-500">{item.totalCost.toFixed(2)} €</span></div></div>)}</div>}</section>
    <section className="space-y-3"><h2 className="text-lg font-semibold text-stone-900">Taux de perte par fromage et par mois</h2>{rates.length === 0 ? <EmptyState compact>Aucune entrée en stock ni perte enregistrée.</EmptyState> : <div className="space-y-3">{rates.map((row) => <div key={`${row.cheeseName}-${row.month}`} className="space-y-3 rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/80 p-4"><div className="flex items-center justify-between"><h3 className="text-base font-bold text-stone-900">{row.cheeseName} <span className="font-normal text-stone-500">— {row.monthLabel}</span></h3><span className="text-base font-bold text-stone-900">{row.lossRate.toFixed(1)} % de perte</span></div><div className="h-3 w-full overflow-hidden rounded-full bg-[#E2DFD8]"><div className="h-full rounded-full bg-[#2d4a27] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, row.lossRate))}%` }} /></div><p className="text-xs font-medium text-stone-500">{row.lostQuantity} perdu(s) · {row.enteredQuantity} entré(s) en stock · {row.lostCost.toFixed(2)} € de perte</p></div>)}</div>}</section>
  </div>;
}

export function ProductionCostsTab({ averages, averagesLoading }: {
  averages: AverageProductionCost[];
  averagesLoading: boolean;
}) {
  return <section className="space-y-3">
    <div>
      <h2 className="text-base font-semibold text-stone-900">Coût moyen de production par fromage</h2>
      <p className="mt-0.5 text-xs text-stone-500">Moyenne pondérée calculée avec le coût total et le nombre de pièces des lots finalisés.</p>
    </div>
    {averagesLoading ? <div className="rounded-xl border border-dashed border-stone-300 bg-white/40 p-5 text-center text-sm text-stone-500">Calcul des coûts moyens...</div> : averages.length === 0 ? <EmptyState compact>Aucun coût finalisé disponible pour les fabrications enregistrées.</EmptyState> : <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {averages.map((average) => <div key={average.fromageId} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white/70 p-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e7eee3] text-[#2d4a27]"><Coins className="size-4" /></span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-stone-900" title={average.cheeseName}>{average.cheeseName}</h3>
            <p className="text-[11px] text-stone-500">{average.lotCount} lot(s) · {average.unitCount} pièce(s)</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <strong className="block text-base text-[#2d4a27]">{average.averageUnitCost.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
          <span className="text-[10px] text-stone-500">par pièce</span>
        </div>
      </div>)}
    </div>}
  </section>;
}

function EmptyState({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <div className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/40 px-4 ${compact ? "py-8" : "py-12"}`}><span className="text-sm font-medium text-stone-500">{children}</span></div>;
}
