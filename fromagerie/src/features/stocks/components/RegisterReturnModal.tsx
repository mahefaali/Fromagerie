import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { Input } from './../../../components/ui/input';

export interface ReturnItemFormState {
  cheeseName: string;
  deliveredQuantity: number;
  returnedQuantity: number;
  actuallySold: number;
  destination: 'stock' | 'loss';
  storageLocation: string;
  dlc: string;
  reason: string;
}

interface RegisterReturnModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    returnDate: string;
    operator: string;
    generalNote: string;
    items: ReturnItemFormState[];
  }) => void;
}

export const RegisterReturnModal: React.FC<RegisterReturnModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmit,
}) => {
  const [returnDate, setReturnDate] = useState<string>('2026-08-20');
  const [operator, setOperator] = useState<string>('');
  const [generalNote, setGeneralNote] = useState<string>('');
  const [items, setItems] = useState<ReturnItemFormState[]>([]);

  useEffect(() => {
    if (order && order.items) {
      const initialItems: ReturnItemFormState[] = order.items.map((item: any) => {
        const delivered = Number(item.quantity || 0);
        const returned = Number(item.returnedQuantity || 0);
        return {
          cheeseName: item.cheeseName || item.name || 'Fromage',
          deliveredQuantity: delivered,
          returnedQuantity: returned,
          actuallySold: delivered - returned,
          destination: 'loss',
          storageLocation: 'Chambre froide de vente',
          dlc: '2026-08-20',
          reason: '',
        };
      });
      setItems(initialItems);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleReturnedQtyChange = (index: number, val: string) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const finalReturned = Math.min(qty, item.deliveredQuantity);
        return {
          ...item,
          returnedQuantity: finalReturned,
          actuallySold: item.deliveredQuantity - finalReturned,
        };
      })
    );
  };

  const handleItemChange = (index: number, field: keyof ReturnItemFormState, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSubmit({
      orderId: order.id,
      returnDate,
      operator,
      generalNote,
      items,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-20 sm:pb-4">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-stone-200">
        
        {/* Header */}
        <div className="p-6 pb-3 flex items-start justify-between relative shrink-0">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Retour d'invendus — <span className="font-semibold">{order.orderNumber || order.id}</span>
            </h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Pour chaque produit retourné, choisissez sa destination : remis en stock (revendable) ou déclaré en perte (non commercialisable).
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-800">Date du retour</label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-stone-100/70 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-800">Opérateur</label>
                <Input
                  type="text"
                  placeholder="Nom"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
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
                    livré {item.deliveredQuantity} unite · retour possible {item.deliveredQuantity}
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

                {/* Destination Radio */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-800 block">Destination</label>
                  <div className="flex items-center gap-6 text-sm font-medium text-stone-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`destination-${index}`}
                        value="stock"
                        checked={item.destination === 'stock'}
                        onChange={() => handleItemChange(index, 'destination', 'stock')}
                        className="accent-[#2d4a27] h-4 w-4"
                      />
                      <span>Remis en stock (revendable)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`destination-${index}`}
                        value="loss"
                        checked={item.destination === 'loss'}
                        onChange={() => handleItemChange(index, 'destination', 'loss')}
                        className="accent-[#2d4a27] h-4 w-4"
                      />
                      <span>Déclaré en perte</span>
                    </label>
                  </div>
                </div>

                {/* Lieu de stockage & DLC (Affiche uniquement si remis en stock) */}
                {item.destination === 'stock' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-800">Lieu de stockage</label>
                      <select
                        value={item.storageLocation}
                        onChange={(e) => handleItemChange(index, 'storageLocation', e.target.value)}
                        className="w-full bg-stone-100/80 border border-stone-300 rounded-xl text-stone-900 font-medium h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      >
                        <option value="Chambre froide de vente">Chambre froide de vente</option>
                        <option value="Cave d'affinage">Cave d'affinage</option>
                        <option value="Stock principal">Stock principal</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-800">Date limite (DLC)</label>
                      <Input
                        type="date"
                        value={item.dlc}
                        onChange={(e) => handleItemChange(index, 'dlc', e.target.value)}
                        className="bg-stone-100/80 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                      />
                    </div>
                  </div>
                )}

                {/* Motif / observation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-800">Motif / observation</label>
                  <Input
                    type="text"
                    placeholder="Ex. Croûte marquée, invendu marché"
                    value={item.reason}
                    onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                    className="bg-stone-100/80 border-stone-300 rounded-xl text-stone-900 font-medium h-10 text-sm focus-visible:ring-stone-400"
                  />
                </div>
              </div>
            ))}

            {/* Note générale */}
            <div className="space-y-1.5 pb-2">
              <label className="text-xs font-semibold text-stone-800">Note générale</label>
              <textarea
                rows={3}
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                className="w-full bg-stone-100/70 border border-stone-300 rounded-xl text-stone-900 font-medium p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>
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