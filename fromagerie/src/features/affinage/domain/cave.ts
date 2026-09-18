// ---------- Types ----------
export type FabricationStatus = "planifiee" | "en_cours" | "affinage" | "terminee";

export type CareEventType = "retournement" | "lavage" | "observation";
export type CareEvent = {
  id: string;
  type: CareEventType;
  date: string;
  operator: string;
  product?: string;
  crouteState?: string;
  note?: string;
};

export type Fabrication = {
  id: string;
  recipeName: string;
  variant?: string;
  batchCode: string;
  date: string;
  milkLiters: number;
  yieldPieces: number;
  temperatureC: number;
  operator: string;
  status: FabricationStatus;
  notes?: string;
  caveId?: string;
  emplacementId?: string;
  affinageDays?: number;
  affinageStartDate?: string;
  careEvents?: CareEvent[];
};

export type Emplacement = {
  id: string;
  etagere: string;
  rangee: number;
  position: number;
  contenu?: string;
  fabricationId?: string;
};

export type EtagereConfig = {
  label: string;
  nbRangees: number;
  nbPositions: number;
  rangees?: Array<{ numero: number; ordre: number; capacite: number }>;
};

export type Cave = {
  id: string;
  nom: string;
  description: string;
  etageres: EtagereConfig[];
  temperatureCible: number;
  humiditeCible: number;
  ageMinJours: number;
  ageMaxJours: number;
  active: boolean;
  capaciteOccupee: number;
  capaciteDisponible: number;
  emplacements: Emplacement[];
};

// ---------- Helpers ----------
export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function etagereLabel(index: number): string {
  let n = index;
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function buildEmplacements(
  etageres: EtagereConfig[],
  previous: Emplacement[] = [],
): Emplacement[] {
  const prevMap = new Map<string, Emplacement>();
  for (const e of previous) {
    prevMap.set(`${e.etagere}-${e.rangee}-${e.position}`, e);
  }
  const list: Emplacement[] = [];
  for (const et of etageres) {
    const rangees = et.rangees ?? Array.from(
      { length: et.nbRangees },
      (_, index) => ({ numero: index + 1, ordre: index + 1, capacite: et.nbPositions }),
    );
    for (const rangee of rangees) {
      for (let p = 1; p <= rangee.capacite; p++) {
        const r = rangee.numero;
        const key = `${et.label}-${r}-${p}`;
        const existing = prevMap.get(key);
        list.push(
          existing ?? { id: newId(), etagere: et.label, rangee: r, position: p },
        );
      }
    }
  }
  return list;
}

export function capaciteFor(etageres: EtagereConfig[]): number {
  return etageres.reduce(
    (total, etagere) => total + (etagere.rangees
      ? etagere.rangees.reduce((sum, rangee) => sum + rangee.capacite, 0)
      : etagere.nbRangees * etagere.nbPositions),
    0,
  );
}
