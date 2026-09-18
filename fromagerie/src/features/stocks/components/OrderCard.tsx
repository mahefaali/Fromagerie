import React, { useState } from 'react';
import { type Order } from './../types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Trash2, FileText, Truck, Receipt, User, Calendar, AlertTriangle, X, Download } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onDelete: (id: string) => void;
  onOpenPreparationSlip?: (order: Order) => void;
  onOpenRegisterDelivery?: (order: Order) => void;
  onOpenInvoice?: (order: Order) => void;
  onDownloadDelivery?: (order: Order) => void;
  onConfirm?: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onDelete,
  onOpenPreparationSlip,
  onOpenRegisterDelivery,
  onOpenInvoice,
  onDownloadDelivery,
  onConfirm,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isDelivered = order.status === 'delivered';
  const isPrepared = order.status === 'prepared';
  const isInvoiced = Boolean(order.invoicedDate);

  // Calcul du total général basé sur les quantités livrées si la commande est livrée
  const totalAmount =
    order.items?.reduce((sum, item) => {
      const price = item.pricePerUnit || 0;
      const effectiveQty =
        isDelivered && item.deliveredQuantity !== undefined
          ? item.deliveredQuantity
          : item.quantity || 0;
      return sum + effectiveQty * price;
    }, 0) ?? (order.totalAmount ?? 0);

  const handleConfirmDelete = () => {
    onDelete(order.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="bg-[#f3eee2] rounded-2xl p-6 border border-[#e2dacb] shadow-xs mb-4">
        {/* Header carte */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-lg font-bold text-[#2c2825]">
            <User className="w-5 h-5 text-gray-600" />
            <span>{order.clientName}</span>
            {order.code && (
              <span className="text-xs font-normal text-gray-500 uppercase">{order.code}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-700 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Supprimer la commande"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {order.orderDate ? `Commandée le ${order.orderDate} · ` : ''}
            Livraison souhaitée le {order.expectedDeliveryDate}
          </span>
        </div>

        {/* Liste des articles */}
        <div className="space-y-2 mb-4">
          {order.items?.map((item) => {
            const qty = item.quantity || 0;
            const price = item.pricePerUnit || 0;
            const deliveredQty = item.deliveredQuantity;
            const itemName = item.name || (item as unknown as { productName?: string }).productName || 'Article';

            const effectiveQty = isDelivered && deliveredQty !== undefined ? deliveredQty : qty;
            const itemTotal = effectiveQty * price;

            const gap = item.gap ?? (deliveredQty !== undefined ? deliveredQty - qty : 0);
            const formattedGap = gap > 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2);

            return (
              <div key={item.id} className="bg-[#ebd9c8]/30 rounded-xl p-3 border border-[#e2cfbd]">
                <div className="flex justify-between font-semibold text-sm text-[#2c2825]">
                  <span>{itemName}</span>
                  <span>{itemTotal.toFixed(2)} €</span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {deliveredQty === undefined ? `${qty} ${item.unit} × ${price.toFixed(2)} €` : `Prévu : ${qty} ${item.unit} · livré : ${deliveredQty} ${item.unit}`}
                  {deliveredQty !== undefined && (
                    <span className="ml-1">
                      {gap !== 0 && (
                        <span className="text-[#c85a32] font-semibold ml-1">
                          (écart {formattedGap})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {item.batchCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    {(isDelivered ? deliveredQty : qty) ?? qty} × {item.batchCode} ({item.location})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Meta Livrée & Facturée */}
        {isDelivered && (
          <div className="text-xs text-gray-600 space-y-1 mb-4 pt-2 border-t border-[#e2dacb]/60">
            {order.deliveryDate && (
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Livrée le {order.deliveryDate}</span>
              </div>
            )}
            {order.invoicedDate && (
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>
                  Facturée le {order.invoicedDate}
                  {order.paymentMethod ? ` · ${order.paymentMethod}` : ''} · {totalAmount.toFixed(2)} €
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer Total et Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e2dacb]/40">
          <div className="font-extrabold text-base text-[#2c2825]">
            Total : {totalAmount.toFixed(2)} €
          </div>
          <div className="flex items-center gap-2">
            {order.status === 'draft' && <button type="button" onClick={() => onConfirm?.(order.id)} className="px-4 py-2 bg-[#c85a32] text-white rounded-xl text-xs font-bold hover:bg-[#b34e2a]">Confirmer et réserver</button>}
            {order.status !== 'draft' && order.status !== 'cancelled' && <button
                onClick={() => onOpenPreparationSlip?.(order)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Bon de préparation
              </button>}

            {/* Affiché uniquement si la commande est PRÉPARÉE */}
            {isPrepared && (
              <button
                type="button"
                onClick={() => onOpenRegisterDelivery?.(order)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2d4a27] text-white rounded-xl text-xs font-bold hover:bg-[#233a1e] transition-all cursor-pointer shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                Enregistrer la livraison
              </button>
            )}

            {/* Affiché si la commande est LIVRÉE */}
            {isDelivered && (
              <>
                <button type="button" onClick={() => onDownloadDelivery?.(order)} className="flex items-center gap-2 rounded-xl border border-[#2d4a27] bg-white px-4 py-2 text-xs font-semibold text-[#2d4a27] shadow-xs hover:bg-[#edf3eb]">
                  <Download className="size-4" /> Bon de livraison
                </button>
                <button
                  type="button"
                  onClick={() => onOpenInvoice?.(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2d4a27] text-white rounded-xl text-xs font-semibold hover:bg-[#233a1e] shadow-xs transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  {isInvoiced ? 'Voir la facture' : 'Facturer'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#fcfbfa] border border-[#e2dacb] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2c2825]">
                  Supprimer la commande
                </h3>
                <p className="text-xs text-gray-500">
                  {order.code ? `Référence : ${order.code}` : order.clientName}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette commande pour{' '}
              <strong className="text-[#2c2825]">{order.clientName}</strong> ? Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer transition-all shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
