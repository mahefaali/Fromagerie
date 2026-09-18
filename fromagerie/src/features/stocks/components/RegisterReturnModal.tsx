import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { Order } from "../types/orders";
import {
  createReturnItems,
  getOrderCheeseLabel,
  localDateToday,
  updateReturnedQuantity,
  type ReturnItemFormState,
} from "./return/returnForm.utils";

export type { ReturnItemFormState } from "./return/returnForm.utils";

interface RegisterReturnModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    returnDate: string;
    items: ReturnItemFormState[];
  }) => void | Promise<boolean | void>;
}

export const RegisterReturnModal: React.FC<RegisterReturnModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmit,
}) => {
  const [returnDate, setReturnDate] = useState(localDateToday);
  const [items, setItems] = useState<ReturnItemFormState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!order) {
      setItems([]);
      return;
    }

    setItems(createReturnItems(order));
    setReturnDate(localDateToday());
  }, [order]);

  if (!isOpen || !order) return null;

  const cheeseLabel = getOrderCheeseLabel(order);

  const handleReturnedQtyChange = (index: number, val: string) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => itemIndex === index ? updateReturnedQuantity(item, val) : item)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      const saved = await onSubmit({ orderId: order.id, returnDate, items });
      if (saved !== false) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-20 sm:pb-4">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-stone-200">
        
        {/* Header */}
        <div className="p-6 pb-3 flex items-start justify-between relative shrink-0">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Retour d'invendus — <span className="font-semibold">{cheeseLabel}</span>
            </h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Les produits retournés sont automatiquement déclarés en perte et ne sont pas revendables.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer la fenêtre de retour"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-200/50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Form Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5">
            {/* Top Fields: Date & Opérateur */}
            <div>
              <div className="space-y-1.5">
                <label htmlFor="return-date" className="text-xs font-semibold text-stone-800">Date du retour</label>
                <Input
                  id="return-date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-stone-100/70 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                />
              </div>
            </div>

            {/* Cards par article */}
            {items.map((item, index) => {
              const itemKey = item.reservationId ?? item.stockId ?? `${item.cheeseName}-${index}`;
              const returnedQuantityId = `returned-quantity-${itemKey}`;
              const actuallySoldId = `actually-sold-${itemKey}`;

              return (
                <div
                key={itemKey}
                className="bg-stone-100/50 border border-stone-300/70 rounded-2xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm">{item.cheeseName}</h3>
                  <span className="text-xs font-medium text-stone-500">
                    livré {item.deliveredQuantity} unité · retour possible {Math.max(0, item.deliveredQuantity - item.previousReturnedQuantity)}
                  </span>
                </div>

                {/* Quantités */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={returnedQuantityId} className="text-xs font-semibold text-stone-800">Quantité retournée</label>
                    <Input
                      id={returnedQuantityId}
                      type="number"
                      min="0"
                      max={Math.max(0, item.deliveredQuantity - item.previousReturnedQuantity)}
                      value={item.returnedQuantity}
                      onChange={(e) => handleReturnedQtyChange(index, e.target.value)}
                      className="bg-stone-100/80 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={actuallySoldId} className="text-xs font-semibold text-stone-800">Vendu réellement</label>
                    <Input
                      id={actuallySoldId}
                      type="number"
                      disabled
                      value={item.actuallySold}
                      className="bg-stone-200/50 border-stone-300 rounded-xl text-stone-900 font-semibold h-10 text-sm"
                    />
                  </div>
                </div>

                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#FAF7F2] border-t border-stone-200/80 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-stone-100/80 border-stone-300 text-stone-800 hover:bg-stone-200 rounded-xl px-5 py-2.5 font-semibold text-sm cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2d4a27] hover:bg-[#233a1e] text-white rounded-xl px-5 py-2.5 font-semibold text-sm shadow-xs cursor-pointer"
            >
              Enregistrer le retour
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
