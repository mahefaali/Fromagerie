import { Plus, Trash2 } from "lucide-react";

import type { OrderFormItem } from "./createOrderForm";

interface OrderItemsFieldsProps {
  items: OrderFormItem[];
  fromages: Array<{ id: number; nom: string }>;
  onAdd: () => void;
  onRemove: (rowId: string) => void;
  onSelectCheese: (rowId: string, cheeseId: string) => void;
  onUpdate: <K extends keyof OrderFormItem>(rowId: string, field: K, value: OrderFormItem[K]) => void;
}

export function OrderItemsFields({ items, fromages, onAdd, onRemove, onSelectCheese, onUpdate }: OrderItemsFieldsProps) {
  return <div>
    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[#2c2825]">Produits commandés</h3>
      <button type="button" onClick={onAdd} className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all hover:bg-gray-50"><Plus className="size-3.5" /> Ligne</button>
    </div>
    <div className="space-y-3">{items.map((item, index) => <div key={item.rowId} className="space-y-3 rounded-2xl border border-[#e2dacb]/60 bg-[#f5f2eb]/70 p-4">
      <div className="flex items-center gap-2">
        <select aria-label={`Fromage de la ligne ${index + 1}`} value={item.cheeseId} onChange={(event) => onSelectCheese(item.rowId, event.target.value)} className={inputClass}>
          <option value="">Type de fromage</option>{fromages.map((cheese) => <option key={cheese.id} value={cheese.id}>{cheese.nom}</option>)}
        </select>
        <button type="button" onClick={() => onRemove(item.rowId)} disabled={items.length === 1} className="p-2 text-red-600 transition-colors hover:text-red-800 disabled:opacity-30" aria-label={`Supprimer la ligne ${index + 1}`}><Trash2 className="size-4" /></button>
      </div>
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
        <Field label="Quantité"><input aria-label={`Quantité de la ligne ${index + 1}`} type="number" min="1" value={item.quantity} onChange={(event) => onUpdate(item.rowId, "quantity", Number(event.target.value))} className={inputClass} /></Field>
        <Field label="Unité"><label className="flex cursor-pointer items-center gap-1.5 pt-1 text-xs"><input type="radio" name={`unit-${item.rowId}`} value="u" checked={item.unit === "u"} onChange={() => onUpdate(item.rowId, "unit", "u")} className="accent-[#2d4a27]" /> unités</label></Field>
        <Field label="Prix unitaire (€)"><input aria-label={`Prix unitaire de la ligne ${index + 1}`} type="number" step="0.01" value={item.pricePerUnit} onChange={(event) => onUpdate(item.rowId, "pricePerUnit", Number(event.target.value))} className={inputClass} /></Field>
      </div>
    </div>)}</div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="mb-1 block text-[11px] text-gray-600">{label}</span>{children}</div>;
}

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2d4a27]";
