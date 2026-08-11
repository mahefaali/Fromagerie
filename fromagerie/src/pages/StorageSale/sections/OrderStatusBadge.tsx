import React from 'react';
import { type OrderStatus } from './../types/orders';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  reserved: { label: 'Réservée', className: 'bg-[#c85a32] text-white' },
  prepared: { label: 'Préparée', className: 'bg-[#2d4a27] text-white' },
  delivered: { label: 'Livrée', className: 'bg-[#e5dec9] text-[#2c2825]' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};