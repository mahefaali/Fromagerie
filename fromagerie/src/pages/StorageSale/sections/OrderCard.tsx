import React from 'react';
import { type Order } from './../types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Trash2, FileText, Truck, Receipt, User, Calendar } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onDelete: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onDelete }) => {
  return (
    <div className="bg-[#f3eee2] rounded-2xl p-6 border border-[#e2dacb] shadow-sm mb-4">
      {/* Header carte */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-lg font-bold">
          <User className="w-5 h-5 text-gray-600" />
          <span>{order.clientName}</span>
          <span className="text-xs font-normal text-gray-500 uppercase">{order.code}</span>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <button 
            onClick={() => onDelete(order.id)} 
            className="text-red-700 hover:text-red-900 transition-colors p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>Commandée le {order.orderDate} · Livraison souhaitée le {order.expectedDeliveryDate}</span>
      </div>

      {/* Liste des articles */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="bg-[#ebd9c8]/30 rounded-xl p-3 border border-[#e2cfbd]">
            <div className="flex justify-between font-semibold text-sm">
              <span>{item.name}</span>
              <span>{(item.quantity * item.pricePerUnit).toFixed(2)} €</span>
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {item.quantity} {item.unit} × {item.pricePerUnit.toFixed(2)} €
              {item.deliveredQuantity !== undefined && (
                <span className="ml-1">
                  · livré : {item.deliveredQuantity} {item.unit}{' '}
                  {item.gap && <span className="text-red-600 font-medium">(écart {item.gap.toFixed(2)})</span>}
                </span>
              )}
            </div>
            {item.batchCode && (
              <div className="text-xs text-gray-500 mt-1">
                {item.quantity} × {item.batchCode} ({item.location})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meta Livrée & Facturée */}
      {order.status === 'delivered' && (
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
              <span>Facturée le {order.invoicedDate} · {order.paymentMethod} · {order.totalAmount.toFixed(2)} €</span>
            </div>
          )}
        </div>
      )}

      {/* Footer Total et Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="font-extrabold text-base">
          Total : {order.totalAmount.toFixed(2)} €
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 shadow-sm transition-all">
            <FileText className="w-4 h-4" />
            Bon de préparation
          </button>

          {order.status === 'prepared' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2d4a27] text-white rounded-xl text-xs font-semibold hover:bg-[#233a1e] shadow-sm transition-all">
              <Truck className="w-4 h-4" />
              Enregistrer la livraison
            </button>
          )}

          {order.status === 'delivered' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2d4a27] text-white rounded-xl text-xs font-semibold hover:bg-[#233a1e] shadow-sm transition-all">
              <Receipt className="w-4 h-4" />
              Voir la facture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};