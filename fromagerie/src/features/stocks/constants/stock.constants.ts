export interface CheeseStockInfo {
  available: number;
  defaultPrice: number;
  defaultUnit: 'kg' | 'u';
}

// Map du stock disponible par fromage (réservations déduites)
export const CHEESE_STOCK_MAP: Record<string, CheeseStockInfo> = {
  'Camembert fermier': {
    available: 12,
    defaultPrice: 7.50,
    defaultUnit: 'u',
  },
  'Tomme de montagne': {
    available: 5,
    defaultPrice: 24.00,
    defaultUnit: 'u',
  },
  'Saint-Nectaire': {
    available: 8,
    defaultPrice: 18.50,
    defaultUnit: 'kg',
  },
  'Comté AOP 18 mois': {
    available: 15,
    defaultPrice: 22.00,
    defaultUnit: 'kg',
  },
  'Brie de Meaux': {
    available: 3,
    defaultPrice: 16.00,
    defaultUnit: 'kg',
  },
};

export const CHEESE_OPTIONS = Object.keys(CHEESE_STOCK_MAP);

// Types de mouvements de stock
export const STOCK_MOVEMENT_TYPES = {
  IN: 'IN',                 // Entrée
  OUT: 'OUT',               // Sortie
  TRANSFER: 'TRANSFER',     // Transfert d'un emplacement/cave à un autre
  ADJUSTMENT: 'ADJUSTMENT', // Ajustement manuel d'inventaire
  WASTE: 'WASTE',           // Perte, casse, coulure, dégradation
  RETURN: 'RETURN',         // Retour client / fournisseur
} as const;

export type StockMovementType = typeof STOCK_MOVEMENT_TYPES[keyof typeof STOCK_MOVEMENT_TYPES];

// Statuts des niveaux de stock
export const STOCK_STATUS = {
  IN_STOCK: 'IN_STOCK',         // Niveaux normaux
  LOW_STOCK: 'LOW_STOCK',       // Seuil d'alerte atteint
  OUT_OF_STOCK: 'OUT_OF_STOCK', // Rupture de stock
  OVERSTOCKED: 'OVERSTOCKED',   // Surstockage
  EXPIRED: 'EXPIRED',           // Produit périmé
} as const;

export type StockStatus = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

// Libellés pour l'affichage dans l'interface (UI)
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  [STOCK_STATUS.IN_STOCK]: 'En stock',
  [STOCK_STATUS.LOW_STOCK]: 'Stock bas',
  [STOCK_STATUS.OUT_OF_STOCK]: 'Rupture de stock',
  [STOCK_STATUS.OVERSTOCKED]: 'Surstock',
  [STOCK_STATUS.EXPIRED]: 'Périmé',
};

// Couleurs associées (Compatibles Tailwind CSS)
export const STOCK_STATUS_COLORS: Record<StockStatus, { bg: string; text: string; badge: string }> = {
  [STOCK_STATUS.IN_STOCK]: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  [STOCK_STATUS.LOW_STOCK]: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  [STOCK_STATUS.OUT_OF_STOCK]: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  [STOCK_STATUS.OVERSTOCKED]: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  [STOCK_STATUS.EXPIRED]: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' },
};

// Unités de mesure
export const STOCK_UNITS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  PIECE: 'pcs',
  UNIT: 'unité',
  BOX: 'boîte',
  PALLET: 'palette',
} as const;

export type StockUnit = typeof STOCK_UNITS[keyof typeof STOCK_UNITS];

// Motifs de régularisation / ajustement
export const ADJUSTMENT_REASONS = {
  INVENTORY_COUNT: 'INVENTORY_COUNT',
  DAMAGE: 'DAMAGE',
  EXPIRATION: 'EXPIRATION',
  CORRECTION: 'CORRECTION',
  OTHER: 'OTHER',
} as const;

// Seuils par défaut
export const STOCK_DEFAULTS = {
  MIN_ALERT_THRESHOLD: 5,
  MAX_ALERT_THRESHOLD: 100,
  DEFAULT_UNIT: STOCK_UNITS.UNIT,
} as const;