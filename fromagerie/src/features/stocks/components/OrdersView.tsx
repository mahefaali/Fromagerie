import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useOrders } from './../hooks/useOrders';
import { OrderCard } from './OrderCard';
import { CreateOrderModal } from './CreateOrderModal';
import { PreparationSlipModal } from './PreparationSlipModal';
import { RegisterDeliveryModal } from './RegisterDeliveryModal';
import { InvoiceModal } from './InvoiceModal';
import { type Order, type OrderFilterStatus } from './../types/orders';
import { ShoppingBag, } from 'lucide-react';
import { orderApi } from '../api/stockApi';
import { downloadDocument } from '../utils/downloadDocument';
import { PaginationControls } from '../../../components/ui/pagination-controls';

const ORDERS_PER_PAGE = 5;

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
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orders, page]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  const downloadPdf = async (kind: 'preparation' | 'delivery' | 'invoice', order: Order) => {
    try {
      const blob = kind === 'preparation'
        ? await orderApi.preparationPdf(Number(order.id))
        : kind === 'delivery'
          ? await orderApi.deliveryPdf(Number(order.id))
          : await orderApi.invoicePdf(order.invoiceId!);
      const reference = kind === 'preparation' ? order.code : kind === 'delivery' ? order.deliveryNumber : order.invoiceNumber;
      downloadDocument(blob, `${kind === 'preparation' ? 'bon-preparation' : kind === 'delivery' ? 'bon-livraison' : 'facture'}-${reference ?? order.id}.pdf`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Téléchargement du document impossible');
    }
  };

  const handleInvoiceSubmit = (data: {
    orderId: string;
    paymentMethod: string;
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

      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#2c2825] sm:text-2xl">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
              Gestion des commandes
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Réservation, bon de préparation, livraison réelle et facturation.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2d4a27] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#22391e] sm:w-auto"
        >
          + Nouvelle commande
        </button>
      </div>

      <div className="pl-2 sm:pl-3 lg:pl-4">
      {/* Badges de filtrage */}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les commandes par statut">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              aria-pressed={isActive}
              className={`min-h-11 px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d4a27] ${isActive
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch">
          {paginatedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder}
              onOpenPreparationSlip={(ord) => setSelectedOrderForSlip(ord)}
              onOpenRegisterDelivery={(ord) => setSelectedOrderForDelivery(ord)}
              onOpenInvoice={(ord) => setSelectedOrderForInvoice(ord)}
              onDownloadDelivery={(ord) => void downloadPdf('delivery', ord)}
              onConfirm={handleConfirmOrder}
            />
          ))}
          <PaginationControls
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            label="Pagination des commandes"
            className="mb-16 justify-self-end lg:col-span-2 lg:mb-12"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/40 p-6 text-center text-sm text-gray-500 sm:p-8">
          Aucune commande pour ce filtre.
        </div>
      )}

      {/* Modale d'ajout de commande */}
      </div>

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
        onDownloadPdf={(order) => void downloadPdf('preparation', order)}
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
        onDownloadPdf={(order) => void downloadPdf('invoice', order)}
      />
    </div>
  );
};
