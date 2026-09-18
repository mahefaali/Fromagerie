export type OrderStatus = 'draft' | 'reserved' | 'pending' | 'prepared' | 'delivered' | 'cancelled';

// Ajout du type pour le filtrage (inclut 'all' pour afficher toutes les commandes)
export type OrderFilterStatus = 'all' | OrderStatus;

export interface OrderItem {
  id: string;
  name?: string;           // Ex: 'Camembert fermier'
  productName?: string;    // Alias de name
  quantity: number;
  unit: 'kg' | 'u' | string;
  returnedQuantity?: number;
  pricePerUnit: number;
  
  // Champs spécifiques livraison / préparation
  deliveredQuantity?: number;
  gap?: number;
  batchCode?: string;
  location?: string;
  stockId?: number;
  reservationId?: number;
  lineId?: string;
}

export interface Order {
  id: string;
  code?: string;
  clientName: string;
  contactInfo?: string;
  status: OrderStatus;
  
  // Dates
  orderDate?: string;
  createdAt?: string;
  expectedDeliveryDate: string;
  deliveryDate?: string;
  deliveryId?: number;
  deliveryNumber?: string;
  invoicedDate?: string;
  invoiceId?: number;
  invoiceNumber?: string;
  invoicedTotal?: number;
  
  // Paiement & Notes
  paymentMethod?: string;
  note?: string;
  
  // Produits & Calculs
  items: OrderItem[];
  totalAmount?: number;
}

// Types pour la création de commande
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
