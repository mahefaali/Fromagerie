// constants/orders.constants.ts

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: 'kg' | 'u';
  pricePerUnit: number;
}

export interface Order {
  id: string;
  clientName: string;
  contactInfo?: string;
  expectedDeliveryDate: string;
  note?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    clientName: 'Épicerie du Val',
    contactInfo: '06 12 34 56 78',
    expectedDeliveryDate: '2026-08-13',
    note: 'Livrer avant 10h le matin.',
    status: 'pending',
    createdAt: '2026-08-11',
    items: [
      {
        id: 'item-1',
        productName: 'Camembert fermier',
        quantity: 1,
        unit: 'u',
        pricePerUnit: 7.5,
      },
    ],
  },
  {
    id: 'ord-002',
    clientName: 'Fromagerie de la Place',
    contactInfo: 'contact@fromagerie-place.fr',
    expectedDeliveryDate: '2026-08-15',
    note: 'Emballage sous vide souhaité.',
    status: 'pending',
    createdAt: '2026-08-10',
    items: [
      {
        id: 'item-2',
        productName: 'Tomme de montagne',
        quantity: 5,
        unit: 'u',
        pricePerUnit: 24.0,
      },
      {
        id: 'item-3',
        productName: 'Comté AOP 18 mois',
        quantity: 2,
        unit: 'kg',
        pricePerUnit: 22.0,
      },
    ],
  },
];