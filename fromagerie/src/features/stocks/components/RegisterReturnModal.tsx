import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { Input } from './../../../components/ui/input';

export interface ReturnItemFormState {
  cheeseName: string;
  stockId?: number;
  reservationId?: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  previousReturnedQuantity: number;
  actuallySold: number;
}

interface RegisterReturnModalProps {
  isOpen: boolean;
  order: any | null;
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
  const [returnDate, setReturnDate] = useState<string>('2026-08-20');
  const [items, setItems] = useState<ReturnItemFormState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order && order.items) {
      const initialItems: ReturnItemFormState[] = order.items.map((item: any) => {
        const delivered = Number(item.deliveredQuantity ?? item.quantity ?? 0);
        const returned = Number(item.returnedQuantity || 0);
        return {
          cheeseName: item.cheeseName || item.name || 'Fromage',
          stockId: item.stockId,
          reservationId: item.reservationId,
          deliveredQuantity: delivered,
          returnedQuantity: 0,
          previousReturnedQuantity: returned,
          actuallySold: delivered - returned,
        };
      });
      setItems(initialItems);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const cheeseNames = [...new Set(order.items.map((item: any) => item.cheeseName || item.name || item.productName || 'Fromage'))];
  const cheeseLabel = cheeseNames.join(', ');

  const handleReturnedQtyChange = (index: number, val: string) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const finalReturned = Math.min(qty, item.deliveredQuantity - item.previousReturnedQuantity);
        return {
          ...item,
          returnedQuantity: finalReturned,
          actuallySold: item.deliveredQuantity - item.previousReturnedQuantity - finalReturned,
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
                <label className="text-xs font-semibold text-stone-800">Date du retour</label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-stone-100/70 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                />
              </div>
            </div>

            {/* Cards par article */}
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-stone-100/50 border border-stone-300/70 rounded-2xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm">{item.cheeseName}</h3>
                  <span className="text-xs font-medium text-stone-500">
                    livré {item.deliveredQuantity} unite · retour possible {item.deliveredQuantity - item.previousReturnedQuantity}
                  </span>
                </div>

                {/* Quantités */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">Quantité retournée</label>
                    <Input
                      type="number"
                      min="0"
                      max={item.deliveredQuantity}
                      value={item.returnedQuantity}
                      onChange={(e) => handleReturnedQtyChange(index, e.target.value)}
                      className="bg-stone-100/80 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">Vendu réellement</label>
                    <Input
                      type="number"
                      disabled
                      value={item.actuallySold}
                      className="bg-stone-200/50 border-stone-300 rounded-xl text-stone-900 font-semibold h-10 text-sm"
                    />
                  </div>
                </div>

              </div>
            ))}
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
