import { type SelectOption } from './sections/StockFilters';
import { type ExpiringCheese } from './sections/StockAlertBanner';
import { type StockItem } from './sections/StockCard';

export const LOCATION_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tous les lieux' },
  { value: 'cold_room', label: 'Chambre froide de vente' },
  { value: 'back_room', label: 'Réserve arrière' },
  { value: 'market', label: 'Comptoir marché' },
];

export const GROUP_BY_OPTIONS: SelectOption[] = [
  { value: 'type', label: 'Grouper par type de fromage' },
  { value: 'location', label: 'Grouper par localisation' },
  { value: 'release_date', label: 'Grouper par date de sortie' },
];

export const MOCK_EXPIRING_ITEMS: ExpiringCheese[] = [
  { id: '1', name: 'Camembert fermier', code: 'CAM-2026-110', daysRemaining: 6 },
  { id: '2', name: "Bleu d'auvergne", code: 'BLE-2026-008', daysRemaining: 2 },
];

export const MOCK_STOCK_ITEMS: (StockItem & { locationValue?: string })[] = [
  {
    id: '2',
    name: "Bleu d'auvergne",
    code: 'BLE-2026-008',
    quantity: 5,
    unit: 'pcs',
    affinageEndDate: '17 juil. 2026',
    dlcDate: '08 août 2026',
    daysBeforeDlc: 2,
    price: 55.00,
    isExpiringSoon: true,
    locationValue: 'cold_room',
  },
];