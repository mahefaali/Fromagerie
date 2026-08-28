import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';
import { type Order } from './../types/orders';

interface PreparationSlipModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onMarkAsPrepared?: (orderId: string) => void;
}

export const PreparationSlipModal: React.FC<PreparationSlipModalProps> = ({
  isOpen,
  order,
  onClose,
  onMarkAsPrepared,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  // Vérifie si la commande a déjà été préparée
  const isAlreadyPrepared = order.status === 'prepared' || order.status === 'delivered';

  const handleConfirmPrepared = () => {
    if (onMarkAsPrepared) {
      onMarkAsPrepared(order.id);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#fcfbfa] w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2dacb] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-[#e2dacb]/40">
          <div>
            <h2 className="text-lg font-extrabold text-[#2c2825]">
              Bon de préparation — {order.code || order.id}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.clientName} · livraison le {order.expectedDeliveryDate}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            À PRÉPARER
          </h3>

          <div className="space-y-3">
            {order.items?.map((item) => {
              const itemName = item.name || item.productName || 'Article';
              const location = item.location || 'Chambre froide de vente';
              const batchCode = item.batchCode || 'LOT-CAM-2026-110';

              return (
                <div
                  key={item.id}
                  className="bg-[#f5f2eb]/80 rounded-2xl p-4 border border-[#e2dacb]/80 space-y-1.5"
                >
                  <div className="font-extrabold text-sm text-[#2c2825]">
                    {item.quantity} {item.unit} {itemName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>
                      → {location} · Lot {batchCode} ({item.quantity})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#f5f2eb]/40 border-t border-[#e2dacb]/60 flex items-center justify-end gap-3">
          {isAlreadyPrepared ? (
            /* Affichage pour une commande déjà préparée */
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b34e2a] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              Fermer
            </button>
          ) : (
            /* Affichage initial pour validation de la préparation */
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#f0eae1] hover:bg-[#e4dcce] text-[#2c2825] text-xs font-bold transition-all cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleConfirmPrepared}
                className="px-5 py-2.5 rounded-xl bg-[#2d4a27] hover:bg-[#233a1e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Marquer préparée (décrémenter le stock)
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};