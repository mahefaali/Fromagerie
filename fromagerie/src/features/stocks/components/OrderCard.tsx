import React, { useState } from 'react';
import { type Order } from './../types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Trash2, FileText, Truck, Receipt, User, Calendar, AlertTriangle, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';

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
      <div className="flex h-full flex-col rounded-2xl border border-[#e2dacb] bg-[#f3eee2] p-4 shadow-xs sm:p-5">
        {/* Header carte */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-bold text-[#2c2825]">
            <User className="w-5 h-5 text-gray-600" />
            <span className="break-words">{order.clientName}</span>
            {order.code && (
              <span className="text-xs font-normal text-gray-500 uppercase">{order.code}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label={`Supprimer la commande ${order.code || order.clientName}`}
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
                <div className="flex flex-wrap justify-between gap-1 font-semibold text-sm text-[#2c2825]">
                  <span className="break-words">{itemName}</span>
                  <span className="shrink-0">{itemTotal.toFixed(2)} €</span>
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
        <div className="mt-auto flex flex-col gap-3 border-t border-[#e2dacb]/40 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-extrabold text-base text-[#2c2825]">
            Total : {totalAmount.toFixed(2)} €
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-[#e2dacb] bg-[#fcfbfa] text-[#2c2825] shadow-2xl sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-left text-base font-bold">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertTriangle className="size-5" /></span>
              Supprimer la commande
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-xs text-gray-500">{order.code ? `Référence : ${order.code}` : order.clientName}</AlertDialogDescription>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">Êtes-vous sûr de vouloir supprimer cette commande pour <strong className="text-[#2c2825]">{order.clientName}</strong> ? Cette action est irréversible.</p>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 rounded-xl border-[#e2dacb] bg-white text-[#2c2825]">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="min-h-11 rounded-xl bg-red-600 text-white hover:bg-red-700">Confirmer la suppression</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
