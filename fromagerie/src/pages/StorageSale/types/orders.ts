export type OrderStatus = 'reserved' | 'prepared' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'u';
  pricePerUnit: number;
  batchCode?: string; // ex: CAM-2026-110
  location?: string;  // ex: Chambre froide de vente
  deliveredQuantity?: number;
  gap?: number;       // ex: -3.00
}

export interface Order {
  id: string;
  code: string;               // ex: CMD-2026-287
  clientName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  deliveryDate?: string;
  invoicedDate?: string;
  paymentMethod?: string;
}

export type OrderFilterStatus = 'all' | OrderStatus;