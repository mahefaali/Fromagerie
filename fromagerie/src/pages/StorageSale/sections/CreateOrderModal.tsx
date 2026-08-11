// components/orders/CreateOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. Import du portal
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import { type CreateOrderPayload, type CreateOrderItemInput } from './../hooks/useOrders';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOrderPayload) => void;
}

const CHEESE_OPTIONS = [
  'Camembert fermier',
  'Tomme de montagne',
  'Saint-Nectaire',
  'Comté AOP 18 mois',
  'Brie de Meaux',
];

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [clientName, setClientName] = useState('Épicerie du Val');
  const [contactInfo, setContactInfo] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-08-13');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<CreateOrderItemInput[]>([
    {
      id: '1',
      productName: '',
      quantity: 1,
      unit: 'u',
      pricePerUnit: 0,
    },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productName: '',
        quantity: 1,
        unit: 'u',
        pricePerUnit: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof CreateOrderItemInput,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    onSubmit({
      clientName,
      contactInfo,
      expectedDeliveryDate,
      note,
      items,
    });
  };

  // 2. Utilisation de createPortal pour monter la modale sur document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-hidden">
      <div className="bg-[#fcfbfa] w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-[#e2dacb] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 flex items-start justify-between border-b border-[#e2dacb]/40 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#2c2825]">Nouvelle commande</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              La commande réserve le stock : elle n'est pas encore livrée.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto min-h-0">
          <div className="p-5 sm:p-6 space-y-5">
            {/* Client & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom du client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f2eb] border border-transparent focus:border-[#2d4a27] focus:bg-white text-sm outline-none transition-all"
              />
              <input
                type="text"
                placeholder="email / téléphone"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f2eb] border border-transparent focus:border-[#2d4a27] focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Date de livraison souhaitée
              </label>
              <div className="relative max-w-xs">
                <input
                  type="text"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f5f2eb] border border-transparent focus:border-[#2d4a27] focus:bg-white text-sm outline-none transition-all"
                />
                <Calendar className="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Produits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#2c2825]">Produits commandés</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Ligne
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#f5f2eb]/70 rounded-2xl border border-[#e2dacb]/60 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:border-[#2d4a27]"
                      >
                        <option value="">Type de fromage</option>
                        {CHEESE_OPTIONS.map((cheese) => (
                          <option key={cheese} value={cheese}>
                            {cheese}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Quantité</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(item.id, 'quantity', Number(e.target.value))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:border-[#2d4a27]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Unité</label>
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`unit-${item.id}`}
                              value="kg"
                              checked={item.unit === 'kg'}
                              onChange={() => handleItemChange(item.id, 'unit', 'kg')}
                              className="accent-[#2d4a27]"
                            />
                            kg
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`unit-${item.id}`}
                              value="u"
                              checked={item.unit === 'u'}
                              onChange={() => handleItemChange(item.id, 'unit', 'u')}
                              className="accent-[#2d4a27]"
                            />
                            unités
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Prix unitaire (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.pricePerUnit}
                          onChange={(e) =>
                            handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:border-[#2d4a27]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Note</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f2eb] border border-transparent focus:border-[#2d4a27] focus:bg-white text-sm outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-[#f5f2eb]/40 border-t border-[#e2dacb]/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0eae1] hover:bg-[#e4dcce] text-gray-800 text-sm font-semibold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2d4a27] hover:bg-[#233a1e] text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              Enregistrer la commande
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // 3. Cible d'injection
  );
};