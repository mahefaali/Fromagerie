import { useEffect, useState, type FormEvent } from "react";

import { AppDialogContent } from "../../../components/ui/app-dialog";
import { Dialog } from "../../../components/ui/dialog";
import { NumericInput } from "../../../components/ui/numeric-input";
import type { Order } from "../types/orders";
import { createReturnItems, getOrderCheeseLabel, localDateToday, updateReturnedQuantity, type ReturnItemFormState } from "./return/returnForm.utils";

export type { ReturnItemFormState } from "./return/returnForm.utils";

interface RegisterReturnModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: { orderId: string; returnDate: string; items: ReturnItemFormState[] }) => void | Promise<boolean | void>;
}

export function RegisterReturnModal({ isOpen, order, onClose, onSubmit }: RegisterReturnModalProps) {
  const [returnDate, setReturnDate] = useState(localDateToday);
  const [items, setItems] = useState<ReturnItemFormState[]>([]);
  const [emptyQuantities, setEmptyQuantities] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItems(order ? createReturnItems(order) : []);
    setReturnDate(localDateToday());
    setEmptyQuantities(new Set());
  }, [order]);

  const handleReturnedQtyChange = (index: number, value: number | null) => {
    setEmptyQuantities((previous) => {
      const next = new Set(previous);
      if (value === null) next.add(index);
      else next.delete(index);
      return next;
    });
    if (value !== null) setItems((previous) => previous.map((item, itemIndex) => itemIndex === index ? updateReturnedQuantity(item, String(value)) : item));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!order || emptyQuantities.size > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const saved = await onSubmit({ orderId: order.id, returnDate, items });
      if (saved !== false) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen && order !== null} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      {order && (
        <AppDialogContent
          title={`Retour d'invendus — ${getOrderCheeseLabel(order)}`}
          description="Les produits retournés sont automatiquement déclarés en perte et ne sont pas revendables."
          className="max-w-2xl"
          footer={
            <>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-11 rounded-xl border border-[#e2dacb] bg-white px-5 py-2.5 text-sm font-semibold text-[#2c2825] disabled:opacity-50">Annuler</button>
              <button type="submit" form="register-return-form" disabled={isSubmitting || emptyQuantities.size > 0} className="min-h-11 rounded-xl bg-[#2d4a27] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#233a1e] disabled:opacity-50">Enregistrer le retour</button>
            </>
          }
        >
          <form id="register-return-form" onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="return-date" className="text-xs font-semibold text-[#2c2825]">Date du retour</label>
              <input id="return-date" type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} required className="block h-10 w-full rounded-xl border border-[#e2dacb] bg-[#f5f2eb]/70 px-3 text-sm text-[#2c2825] focus:border-[#2d4a27] focus:outline-none" />
            </div>

            {items.map((item, index) => {
              const itemKey = item.reservationId ?? item.stockId ?? `${item.cheeseName}-${index}`;
              const returnedQuantityId = `returned-quantity-${itemKey}`;
              return (
                <div key={itemKey} className="space-y-4 rounded-2xl border border-[#e2dacb]/80 bg-[#f5f2eb]/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#2c2825]">{item.cheeseName}</h3>
                    <span className="text-xs text-gray-600">Livré {item.deliveredQuantity} unité · retour possible {Math.max(0, item.deliveredQuantity - item.previousReturnedQuantity)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor={returnedQuantityId} className="text-xs font-semibold text-[#2c2825]">Quantité retournée</label>
                      <NumericInput id={returnedQuantityId} min={0} max={Math.max(0, item.deliveredQuantity - item.previousReturnedQuantity)} integer required value={item.returnedQuantity} onValueChange={(value) => handleReturnedQtyChange(index, value)} className="h-10 bg-white font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-xs font-semibold text-[#2c2825]">Vendu réellement</span>
                      <output className="flex h-10 items-center rounded-xl border border-[#e2dacb] bg-[#f5f2eb] px-3 text-sm font-semibold text-[#2c2825]">{item.actuallySold}</output>
                    </div>
                  </div>
                </div>
              );
            })}
          </form>
        </AppDialogContent>
      )}
    </Dialog>
  );
}
