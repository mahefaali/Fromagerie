// components/orders/OrderStatusBadge.tsx
import React from 'react';
import { type OrderStatus } from './../types/orders';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-200 text-gray-700' },
  reserved: { label: 'Réservée', className: 'bg-[#c85a32] text-white' },
  pending: { label: 'Réservée', className: 'bg-[#c85a32] text-white' },
  prepared: { label: 'Préparée', className: 'bg-[#2d4a27] text-white' },
  delivered: { label: 'Livrée', className: 'bg-[#e5dec9] text-[#2c2825]' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
};

const DEFAULT_CONFIG = {
  label: 'Brouillon',
  className: 'bg-gray-200 text-gray-700',
};

export const OrderStatusBadge: React.FC<{ status?: OrderStatus | string }> = ({ status }) => {
  // Ternaire sécurisée : élimine la chaîne vide "" du type déduit par TypeScript
  const config = (status ? STATUS_CONFIG[status] : undefined) ?? DEFAULT_CONFIG;

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};
