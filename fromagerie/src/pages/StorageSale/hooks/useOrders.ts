import { useState, useMemo } from 'react';
import { type Order, type OrderFilterStatus } from '../types/orders';
import { MOCK_ORDERS } from '../constants/orders.constants';

export interface CreateOrderItemInput {
  id: string;
  productName: string;
  quantity: number;
  unit: 'kg' | 'u';
  pricePerUnit: number;
}

export interface CreateOrderPayload {
  clientName: string;
  contactInfo?: string;
  expectedDeliveryDate: string;
  note?: string;
  items: CreateOrderItemInput[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeFilter, setActiveFilter] = useState<OrderFilterStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      reserved: orders.filter((o) => o.status === 'reserved').length,
      prepared: orders.filter((o) => o.status === 'prepared').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((order) => order.status === activeFilter);
  }, [orders, activeFilter]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleCreateOrder = (payload: CreateOrderPayload) => {
    const totalAmount = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    const newOrder: Order = {
      id: Date.now().toString(),
      code: `CMD-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: payload.clientName,
      orderDate: '10 août 2026', // ou new Date().toLocaleDateString('fr-FR')
      expectedDeliveryDate: payload.expectedDeliveryDate,
      status: 'reserved', // Toute nouvelle commande démarre en Réservée
      totalAmount,
      items: payload.items.map((item) => ({
        id: item.id,
        name: item.productName || 'Fromage non spécifié',
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    orders: filteredOrders,
    activeFilter,
    setActiveFilter,
    statusCounts,
    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateOrder,
    handleDeleteOrder,
  };
};