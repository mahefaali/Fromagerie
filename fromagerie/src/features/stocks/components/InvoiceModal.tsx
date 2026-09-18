import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';
import { type Order } from './../types/orders';

interface InvoiceModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    paymentMethod: string;
  }) => void;
  onDownloadPdf?: (order: Order) => void;
}

const PAYMENT_METHODS = [
  'Virement',
  'Carte bancaire',
  'Espèces',
  'Chèque',
  'Prélèvement',
];

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmit,
  onDownloadPdf,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('Virement');

  useEffect(() => {
    if (order) {
      setPaymentMethod(order.paymentMethod || 'Virement');
    }
  }, [order]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;
  const isAlreadyInvoiced = Boolean(order.invoicedDate);

  // Calcul dynamique des sous-totaux basés sur les quantités réellement livrées
  const itemsWithSubtotals = order.items?.map((item) => {
    const qty = item.deliveredQuantity ?? item.quantity ?? 0;
    const price = item.pricePerUnit ?? 0;
    const subtotal = qty * price;
    const itemName = item.name || (item as unknown as { productName?: string }).productName || 'Article';
    return {
      ...item,
      itemName,
      effectiveQty: qty,
      subtotal,
    };
  }) ?? [];

  const calculatedTotal = itemsWithSubtotals.reduce((sum, i) => sum + i.subtotal, 0);
  const totalAmount = isAlreadyInvoiced && order.invoicedTotal !== undefined
    ? order.invoicedTotal
    : calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyInvoiced) {
      onClose();
      return;
    }
    onSubmit({
      orderId: order.id,
      paymentMethod,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#fcfbfa] w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2dacb] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* En-tête */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-[#e2dacb]/40 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[#2c2825]">
              {order.invoiceNumber ? `Facture ${order.invoiceNumber}` : `Facture — ${order.code || order.id}`}
            </h2>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {order.clientName}
            </p>
            {order.invoicedDate && <p className="text-xs text-gray-500 mt-1">Facturée le {order.invoicedDate}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Liste des articles facturés */}
          <div className="space-y-3">
            {itemsWithSubtotals.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm text-[#2c2825]"
              >
                <div>
                  <div>{item.itemName} · {item.effectiveQty} {item.unit || 'u'} × {item.pricePerUnit?.toFixed(2)} €</div>
                  {item.deliveredQuantity !== undefined && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Prévu : {item.quantity} {item.unit || 'u'} · livré : {item.deliveredQuantity} {item.unit || 'u'}
                      {item.gap !== 0 && <span className="text-[#c85a32] font-semibold"> · écart : {item.gap}</span>}
                    </div>
                  )}
                </div>
                <span className="font-bold">{item.subtotal.toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <hr className="border-t border-[#e2dacb]" />

          {/* Ligne du Total */}
          <div className="flex items-center justify-between text-base font-extrabold text-[#2c2825]">
            <span>Total</span>
            <span className="text-lg">{totalAmount.toFixed(2)} €</span>
          </div>

          {/* Mode de paiement */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-[#2c2825]">
              Mode de paiement
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isAlreadyInvoiced}
              className="w-full bg-[#f5f2eb]/70 border border-[#e2dacb] rounded-xl px-3.5 py-2.5 text-sm text-[#2c2825] font-medium focus:outline-none focus:border-[#2d4a27] transition-all cursor-pointer"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Pied de modale / Boutons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            {isAlreadyInvoiced && <button type="button" onClick={() => onDownloadPdf?.(order)} className="flex items-center gap-2 rounded-xl border border-[#2d4a27] bg-white px-5 py-2.5 text-xs font-bold text-[#2d4a27] hover:bg-[#edf3eb]">
              <Download className="size-4" /> Télécharger le PDF
            </button>}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0eae1] hover:bg-[#e4dcce] text-[#2c2825] text-xs font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
            {!isAlreadyInvoiced && <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2d4a27] hover:bg-[#233a1e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Valider la facture
            </button>}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
