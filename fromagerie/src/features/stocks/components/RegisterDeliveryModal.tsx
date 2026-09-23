import { useEffect, useState, type FormEvent } from "react";

import { AppDialogContent } from "../../../components/ui/app-dialog";
import { Dialog } from "../../../components/ui/dialog";
import { NumericInput } from "../../../components/ui/numeric-input";
import type { Order } from "../types/orders";

interface RegisterDeliveryModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    deliveryDate: string;
    deliveryNote: string;
    deliveredItems: { itemId: string; deliveredQuantity: number; gap: number }[];
  }) => void;
}

const getTodayISO = () => new Date().toISOString().split("T")[0];

export function RegisterDeliveryModal({ isOpen, order, onClose, onSubmit }: RegisterDeliveryModalProps) {
  const [deliveryDate, setDeliveryDate] = useState(getTodayISO);
  const [deliveredQuantities, setDeliveredQuantities] = useState<Record<string, number | null>>({});
  const [deliveryNote, setDeliveryNote] = useState("");

  useEffect(() => {
    if (!order) return;
    setDeliveryDate(getTodayISO());
    setDeliveryNote("");
    const initialQtys: Record<string, number> = {};
    order.items?.forEach((item) => {
      initialQtys[item.id] = item.deliveredQuantity ?? item.quantity;
    });
    setDeliveredQuantities(initialQtys);
  }, [order]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) return;
    if (order.items.some((item) => deliveredQuantities[item.id] === null)) return;

    const deliveredItems = order.items.map((item) => {
      const deliveredQuantity = deliveredQuantities[item.id] ?? item.quantity;
      return { itemId: item.id, deliveredQuantity, gap: deliveredQuantity - item.quantity };
    });
    onSubmit({ orderId: order.id, deliveryDate, deliveryNote, deliveredItems });
    onClose();
  };

  return (
    <Dialog open={isOpen && order !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      {order && (
        <AppDialogContent
          title={`Enregistrer la livraison — ${order.code || order.id}`}
          description="Saisissez les quantités réellement livrées ; les écarts sont conservés."
          footer={
            <>
              <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-[#f0eae1] px-5 py-2.5 text-xs font-bold text-[#2c2825] hover:bg-[#e4dcce]">Annuler</button>
              <button type="submit" form="register-delivery-form" className="min-h-11 rounded-xl bg-[#2d4a27] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#233a1e]">Enregistrer</button>
            </>
          }
        >
          <form id="register-delivery-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="delivery-date" className="block text-xs font-bold text-[#2c2825]">Date de livraison</label>
              <input id="delivery-date" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} required className="w-full rounded-xl border border-[#e2dacb] bg-[#f5f2eb]/70 px-3.5 py-2.5 text-sm font-medium text-[#2c2825] focus:border-[#2d4a27] focus:outline-none" />
            </div>

            <div className="space-y-3">
              {order.items.map((item) => {
                const itemName = item.name || item.productName || "Article";
                const unit = item.unit || "u";
                const deliveredValue = deliveredQuantities[item.id] === undefined ? item.quantity : deliveredQuantities[item.id];
                const gap = deliveredValue === null ? 0 : deliveredValue - item.quantity;
                const formattedGap = gap > 0 ? `+${gap.toFixed(2)} ${unit}` : `${gap.toFixed(2)} ${unit}`;
                return (
                  <div key={item.id} className="space-y-3 rounded-2xl border border-[#e2dacb]/80 bg-[#f5f2eb]/60 p-4">
                    <div className="text-sm font-extrabold text-[#2c2825]">{itemName}</div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div><span className="mb-1 block text-xs font-medium text-gray-500">Commandé</span><span className="text-sm font-extrabold text-[#2c2825]">{item.quantity} {unit}</span></div>
                      <div>
                        <label htmlFor={`delivered-quantity-${item.id}`} className="mb-1 block text-xs font-medium text-gray-500">Livré ({unit}) — {itemName}</label>
                        <NumericInput id={`delivered-quantity-${item.id}`} value={deliveredValue} onValueChange={(quantity) => setDeliveredQuantities((previous) => ({ ...previous, [item.id]: quantity }))} min={0} precision={2} required className="bg-white/90 font-bold" />
                      </div>
                    </div>
                    {gap !== 0 && <div className="pt-1 text-xs font-semibold text-[#c85a32]">Écart : {formattedGap}</div>}
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="delivery-note" className="block text-xs font-bold text-[#2c2825]">Note de livraison</label>
              <textarea id="delivery-note" rows={3} value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} className="w-full resize-none rounded-xl border border-[#e2dacb] bg-[#f5f2eb]/50 p-3 text-sm text-[#2c2825] focus:border-[#2d4a27] focus:outline-none" />
            </div>
          </form>
        </AppDialogContent>
      )}
    </Dialog>
  );
}
