import { type SelectOption } from './components/StockFilters';
import { type ExpiringCheese } from './components/StockAlertBanner';
import { type StockItem } from './components/StockCard';

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
  { id: '1', name: 'Camembert fermier', code: 'CAM-2026-110', daysRemaining: 6, durabilityType: 'DLC' },
  { id: '2', name: "Bleu d'auvergne", code: 'BLE-2026-008', daysRemaining: 2, durabilityType: 'DDM' },
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
    durabilityType: 'DLC',
    isExpiringSoon: true,
    locationValue: 'cold_room',
  },
];
