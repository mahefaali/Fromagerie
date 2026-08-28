import React, { useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import { useOrders } from './../hooks/useOrders';
import { OrderCard } from './OrderCard';
import { CreateOrderModal } from './CreateOrderModal';
import { PreparationSlipModal } from './PreparationSlipModal';
import { RegisterDeliveryModal } from './RegisterDeliveryModal';
import { InvoiceModal } from './InvoiceModal';
import { type Order, type OrderFilterStatus } from './../types/orders';
import { ShoppingBag, } from 'lucide-react';

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
    allOrders,
    activeFilter,
    setActiveFilter,
    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateOrder,
    handleDeleteOrder,
    handleMarkAsPrepared,
    handleConfirmOrder,
    handleCreateClient,
    handleRegisterDelivery,
    handleCreateInvoice,
    clients,
    fromages,
  } = useOrders();

  // État local pour gérer la modale du bon de préparation
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);


  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const handleInvoiceSubmit = (data: {
    orderId: string;
    paymentMethod: string;
    invoiceNote: string;
    invoicedDate: string;
  }) => {
    handleCreateInvoice(data);
  };


  // Calcul des compteurs de filtres
  const statusCounts: Record<OrderFilterStatus, number> = useMemo(() => {
    const dataSource = allOrders ?? orders;
    return dataSource.reduce<Record<OrderFilterStatus, number>>(
      (acc, order) => {
        acc.all++;
        const status = order.status;
        if (status === 'reserved' || status === 'pending') {
          acc.reserved++;
          acc.pending++;
        } else if (status && status in acc) {
          acc[status]++;
        }
        return acc;
      },
      { all: 0, draft: 0, reserved: 0, pending: 0, prepared: 0, delivered: 0, cancelled: 0 }
    );
  }, [allOrders, orders]);

  return (
    <div>

      <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2c2825] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
              Gestion des commandes
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
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${isActive
                ? 'bg-[#2d4a27] text-white border-[#2d4a27]'
                : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {f.label} ({statusCounts[f.id] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Liste des commandes */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder}
              onOpenPreparationSlip={(ord) => setSelectedOrderForSlip(ord)}
              onOpenRegisterDelivery={(ord) => setSelectedOrderForDelivery(ord)}
              onOpenInvoice={(ord) => setSelectedOrderForInvoice(ord)}
              onConfirm={handleConfirmOrder}
            />
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
        clients={clients}
        fromages={fromages}
        onCreateClient={handleCreateClient}
      />

      {/* Modale du Bon de Préparation */}
      <PreparationSlipModal
        isOpen={Boolean(selectedOrderForSlip)}
        order={selectedOrderForSlip}
        onClose={() => setSelectedOrderForSlip(null)}
        onMarkAsPrepared={handleMarkAsPrepared}
      />

      {/* Modale Enregistrer la Livraison */}
      <RegisterDeliveryModal
        isOpen={Boolean(selectedOrderForDelivery)}
        order={selectedOrderForDelivery}
        onClose={() => setSelectedOrderForDelivery(null)}
        onSubmit={handleRegisterDelivery}
      />

      {/* Rendu de la Modale Facture */}
      <InvoiceModal
        isOpen={Boolean(selectedOrderForInvoice)}
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  );
};
