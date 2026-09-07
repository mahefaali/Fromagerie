import { BarChart3, Coins, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { Order } from "../types/orders";
import type { LossCauseSummary, LossLogEntry, MonthlyLossRate, OrderReturns, ProductionCostItem } from "./unsoldLoss.types";
import { orderItemKey } from "./unsoldLoss.utils";

export function ReturnsTab({ orders, returns, onSelect }: { orders: Order[]; returns: OrderReturns; onSelect: (order: Order) => void }) {
  if (orders.length === 0) return <EmptyState>Aucune commande livrée pour l'instant.</EmptyState>;
  return <div className="space-y-4">{orders.map((order) => {
    const saved = returns[order.id];
    const items = order.items.map((item) => ({ ...item, returnedQuantity: saved?.items[orderItemKey(item)] ?? item.returnedQuantity ?? 0 }));
    const delivered = items.reduce((sum, item) => sum + Number(item.deliveredQuantity ?? item.quantity ?? 0), 0);
    const returned = items.reduce((sum, item) => sum + Number(item.returnedQuantity ?? 0), 0);
    return <div key={order.id} className="space-y-4 rounded-2xl border border-stone-300/80 bg-[#F2ECE1]/80 p-5">
      <div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-bold text-stone-900">{order.code || order.id} <span className="font-normal text-stone-600">— {order.clientName || "Client"}</span></h3><p className="mt-0.5 text-xs font-medium text-stone-500">{order.deliveryDate ? `Livrée le ${order.deliveryDate}` : "Commande livrée"}</p></div><Button onClick={() => onSelect({ ...order, items })} className="flex items-center gap-2 rounded-xl bg-[#2d4a27] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#233a1e]"><RotateCcw className="size-4" />Enregistrer un retour</Button></div>
      <div className="grid max-w-lg grid-cols-3 gap-4 py-1"><Metric label="Quantité livrée" value={delivered} /><Metric label="Quantité retournée" value={returned} /><Metric label="Vendu réellement" value={delivered - returned} /></div>
      {saved?.returnCount ? <p className="text-xs font-medium text-stone-500">{saved.returnCount} retour(s) enregistré(s)</p> : null}
    </div>;
  })}</div>;
}

export function LossJournalTab({ entries, onDelete }: { entries: LossLogEntry[]; onDelete: (id: string) => void }) {
  if (entries.length === 0) return <EmptyState>Aucun journal de perte enregistré.</EmptyState>;
  return <div className="space-y-3">{entries.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/80 p-4"><div className="space-y-1"><div className="flex items-center gap-2"><h3 className="text-base font-bold text-stone-900">{entry.cheeseName}</h3><span className="rounded-md bg-[#c84c28] px-2 py-0.5 text-[11px] font-semibold text-white">{entry.badgeText}</span></div><p className="text-xs font-medium text-stone-500">{entry.dateFormatted} · {entry.lotNumber} · {entry.orderNumber} · {entry.clientName}</p><p className="pt-0.5 text-xs text-stone-600">{entry.reason}</p></div><div className="flex shrink-0 items-center gap-4"><div className="text-right"><span className="block text-base font-bold text-stone-900">{entry.quantity} pcs</span><span className="mt-0.5 block text-xs font-medium text-stone-500">{entry.quantity} × {entry.unitCost.toFixed(2)} € = <span className="font-bold text-[#c84c28]">{entry.totalCost.toFixed(2)} €</span></span></div><button type="button" onClick={() => onDelete(entry.id)} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-stone-200/50 hover:text-red-600" title="Supprimer la perte" aria-label={`Supprimer la perte ${entry.cheeseName}`}><Trash2 className="size-4" /></button></div></div>)}</div>;
}

export function LossAnalysisTab({ causes, rates }: { causes: LossCauseSummary[]; rates: MonthlyLossRate[] }) {
  return <div className="space-y-6"><section className="space-y-3"><div className="flex items-center gap-2 text-lg font-semibold text-stone-900"><BarChart3 className="size-5 text-[#2d4a27]" /><h2>Pourquoi je perds : causes par fromage</h2></div>{causes.length === 0 ? <EmptyState compact>Aucune perte enregistrée pour le moment.</EmptyState> : <div className="space-y-2">{causes.map((item) => <div key={`${item.name}-${item.badgeText}`} className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/80 p-4"><div><h3 className="text-base font-bold text-stone-900">{item.name}</h3><p className="mt-0.5 text-xs font-medium text-stone-500">{item.badgeText}</p></div><div className="text-right"><span className="block text-base font-bold text-stone-900">{item.totalQty} pcs</span><span className="mt-0.5 block text-xs font-medium text-stone-500">{item.totalCost.toFixed(2)} €</span></div></div>)}</div>}</section>
    <section className="space-y-3"><h2 className="text-lg font-semibold text-stone-900">Taux de perte par fromage et par mois</h2>{rates.length === 0 ? <EmptyState compact>Aucune entrée en stock ni perte enregistrée.</EmptyState> : <div className="space-y-3">{rates.map((row) => <div key={`${row.cheeseName}-${row.month}`} className="space-y-3 rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/80 p-4"><div className="flex items-center justify-between"><h3 className="text-base font-bold text-stone-900">{row.cheeseName} <span className="font-normal text-stone-500">— {row.monthLabel}</span></h3><span className="text-base font-bold text-stone-900">{row.lossRate.toFixed(1)} % de perte</span></div><div className="h-3 w-full overflow-hidden rounded-full bg-[#E2DFD8]"><div className="h-full rounded-full bg-[#2d4a27] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, row.lossRate))}%` }} /></div><p className="text-xs font-medium text-stone-500">{row.lostQuantity} perdu(s) · {row.enteredQuantity} entré(s) en stock · {row.lostCost.toFixed(2)} € de perte</p></div>)}</div>}</section>
  </div>;
}

export function ProductionCostsTab({ costs, onChange, onSave }: { costs: ProductionCostItem[]; onChange: (id: string, value: string) => void; onSave: (item: ProductionCostItem) => void }) {
  return <div className="space-y-4"><p className="text-sm font-medium text-stone-500">Coût de production estimé par pièce : il sert au calcul automatique du coût des pertes (quantité perdue × coût unitaire).</p><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{costs.map((cheese) => <div key={cheese.id} className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/60 p-3.5 shadow-sm"><div className="flex items-center gap-2.5 text-sm font-medium text-stone-800"><Coins className="size-4 text-stone-500" /><span>{cheese.name}</span></div><div className="flex items-center gap-2"><Input type="number" step="0.1" value={cheese.unitCost} onChange={(event) => onChange(cheese.id, event.target.value)} className="h-9 w-24 rounded-xl border-stone-200 bg-stone-100/80 text-right font-medium text-stone-900 focus-visible:ring-stone-400" /><Button type="button" onClick={() => onSave(cheese)} className="rounded-xl bg-[#2d4a27] px-3 py-2 text-xs text-white hover:bg-[#233a1e]">Enregistrer</Button><span className="text-sm font-medium text-stone-600">€</span></div></div>)}</div></div>;
}

function EmptyState({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <div className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/40 px-4 ${compact ? "py-8" : "py-12"}`}><span className="text-sm font-medium text-stone-500">{children}</span></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div><span className="block text-xs font-medium text-stone-500">{label}</span><span className="text-lg font-semibold text-stone-900">{value}</span></div>;
}
