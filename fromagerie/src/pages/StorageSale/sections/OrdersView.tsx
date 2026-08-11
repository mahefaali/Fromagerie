// components/orders/OrdersView.tsx
import React from 'react';
import { useOrders } from './../hooks/useOrders';
import { OrderCard } from './OrderCard';
import { CreateOrderModal } from './CreateOrderModal';
import { type OrderFilterStatus } from './../types/orders';

const FILTERS: { id: OrderFilterStatus; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'reserved', label: 'Réservée' },
  { id: 'prepared', label: 'Préparée' },
  { id: 'delivered', label: 'Livrée' },
  { id: 'cancelled', label: 'Annulée' },
];

export const OrdersView: React.FC = () => {
  const {
    orders,
    activeFilter,
    setActiveFilter,
    statusCounts,
    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateOrder,
    handleDeleteOrder,
  } = useOrders();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2c2825] flex items-center gap-2">
            📋 Gestion des commandes
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Réservation, bon de préparation, livraison réelle et facturation.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-[#2d4a27] hover:bg-[#22391e] text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          + Nouvelle commande
        </button>
      </div>

      {/* Badges de filtrage */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count = statusCounts[f.id];
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-[#2d4a27] text-white border-[#2d4a27]'
                  : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Liste des commandes */}
      {orders.length > 0 ? (
        <div>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onDelete={handleDeleteOrder} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500 text-sm bg-white/40">
          Aucune commande pour ce filtre.
        </div>
      )}

      {/* Modale d'ajout de commande */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};