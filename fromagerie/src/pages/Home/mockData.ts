import { type CheeseBatch, type Cellar, type ProductionPlanItem } from './types';

export const CHEESE_COLORS: Record<string, string> = {
  Camembert: '#2d5a27', // Dark Green
  Brie: '#c85a32',      // Rust
  Comté: '#d97706',     // Amber
  Emmental: '#0284c7',  // Sky Blue
  Chèvre: '#8b5cf6',    // Purple
};

export const MOCK_TURNINGS: CheeseBatch[] = [
  { id: '1', code: 'CAM-001', type: 'Camembert', color: CHEESE_COLORS.Camembert, location: 'A-1', lastTurned: '13 janv. (J-2)', quantity: 12, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui" },
  { id: '2', code: 'CAM-003', type: 'Camembert', color: CHEESE_COLORS.Camembert, location: 'A-3', lastTurned: '13 janv. (J-2)', quantity: 12, progressPercent: 33, expectedReleaseDate: '20 janv.', dueStatus: 'Demain' },
  { id: '3', code: 'BRI-001', type: 'Brie', color: CHEESE_COLORS.Brie, location: 'A-4', lastTurned: '13 janv. (J-2)', quantity: 8, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui" },
  { id: '4', code: 'CHE-002', type: 'Chèvre', color: CHEESE_COLORS.Chèvre, location: 'A-8', lastTurned: '13 janv. (J-2)', quantity: 16, progressPercent: 43, expectedReleaseDate: '22 janv.', dueStatus: 'J+7' },
];

export const MOCK_RELEASES: CheeseBatch[] = [
  { id: '1', code: 'CAM-001', type: 'Camembert', color: CHEESE_COLORS.Camembert, location: 'A - A-1', lastTurned: '', quantity: 12, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui" },
  { id: '2', code: 'BRI-001', type: 'Brie', color: CHEESE_COLORS.Brie, location: 'A - A-4', lastTurned: '', quantity: 8, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui" },
  { id: '3', code: 'EMM-001', type: 'Emmental', color: CHEESE_COLORS.Emmental, location: 'B - B-1', lastTurned: '', quantity: 4, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui", note: 'Meules 12 kg' },
  { id: '4', code: 'COM-001', type: 'Comté', color: CHEESE_COLORS.Comté, location: 'B - B-3', lastTurned: '', quantity: 3, progressPercent: 100, expectedReleaseDate: '15 janv.', dueStatus: "Aujourd'hui", note: '90j atteint' },
  { id: '5', code: 'CHE-001', type: 'Chèvre', color: CHEESE_COLORS.Chèvre, location: 'A - A-7', lastTurned: '', quantity: 24, progressPercent: 85, expectedReleaseDate: '16 janv.', dueStatus: 'Demain' },
  { id: '6', code: 'CAM-002', type: 'Camembert', color: CHEESE_COLORS.Camembert, location: 'A - A-2', lastTurned: '', quantity: 18, progressPercent: 70, expectedReleaseDate: '22 janv.', dueStatus: 'J+7' },
];

export const MOCK_CELLARS: Cellar[] = [
  {
    id: 'c1',
    name: 'Cave A',
    description: 'Croûte fleurie',
    temp: 12,
    humidity: 95,
    capacity: 60,
    occupied: 90, // Suroccupé d'après l'image !
    batches: [
      { type: 'Camembert', count: 42, color: CHEESE_COLORS.Camembert },
      { type: 'Brie', count: 28, color: CHEESE_COLORS.Brie },
      { type: 'Chèvre', count: 40, color: CHEESE_COLORS.Chèvre },
    ]
  },
  {
    id: 'c2',
    name: 'Cave B',
    description: 'Affinage lent',
    temp: 14,
    humidity: 85,
    capacity: 40,
    occupied: 14,
    batches: [
      { type: 'Comté', count: 10, color: CHEESE_COLORS.Comté },
      { type: 'Emmental', count: 10, color: CHEESE_COLORS.Emmental },
    ]
  }
];

export const MOCK_PLANNING: ProductionPlanItem[] = [
  { type: 'Camembert', color: CHEESE_COLORS.Camembert, cellarName: 'Cave A', freeSlots: -30, neededSlots: 6, possibleBatches: -5, expectedRelease: '05 févr. (+21j)', status: 'Cave pleine' },
  { type: 'Brie', color: CHEESE_COLORS.Brie, cellarName: 'Cave A', freeSlots: -30, neededSlots: 4, possibleBatches: -8, expectedRelease: '12 févr. (+28j)', status: 'Cave pleine' },
  { type: 'Comté', color: CHEESE_COLORS.Comté, cellarName: 'Cave B', freeSlots: 26, neededSlots: 2, possibleBatches: 13, expectedRelease: '15 avr. (+90j)', status: 'Faisable' },
  { type: 'Emmental', color: CHEESE_COLORS.Emmental, cellarName: 'Cave B', freeSlots: 26, neededSlots: 2, possibleBatches: 13, expectedRelease: '16 mars (+60j)', status: 'Faisable' },
  { type: 'Chèvre', color: CHEESE_COLORS.Chèvre, cellarName: 'Cave A', freeSlots: -30, neededSlots: 8, possibleBatches: -4, expectedRelease: '29 janv. (+14j)', status: 'Cave pleine' },
];