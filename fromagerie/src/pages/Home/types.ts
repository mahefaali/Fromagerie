export type CheeseType = 'Camembert' | 'Brie' | 'Emmental' | 'Comté' | 'Chèvre';

export interface CheeseBatch {
  id: string;
  code: string;               // ex: "CAM-001"
  type: CheeseType;
  color: string;              // Couleur Tailwind associée au type
  location: string;           // ex: "A-1" ou "Cave A - Shelf 1"
  lastTurned: string;         // ex: "13 janv. (J-2)"
  quantity: number;
  progressPercent: number;    // Avancement de l'affinage
  expectedReleaseDate: string;// ex: "15 janv."
  dueStatus: 'Aujourd\'hui' | 'Demain' | 'J+7' | 'En retard';
  note?: string;
}

export interface Cellar {
  id: string;
  name: string;
  description: string;
  temp: number;
  humidity: number;
  capacity: number;
  occupied: number;
  batches: { type: CheeseType; count: number; color: string }[];
}

export interface ProductionPlanItem {
  type: CheeseType;
  color: string;
  cellarName: string;
  freeSlots: number;
  neededSlots: number;
  possibleBatches: number;
  expectedRelease: string;
  status: 'Faisable' | 'Cave pleine';
}