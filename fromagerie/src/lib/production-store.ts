import { useSyncExternalStore } from "react";

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
};

export type Cave = {
  id: string;
  nom: string;
  description: string;
  etageres: EtagereConfig[];
  temperatureCible: number;
  humiditeCible: number;
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
    for (let r = 1; r <= et.nbRangees; r++) {
      for (let p = 1; p <= et.nbPositions; p++) {
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
  return etageres.reduce((n, e) => n + e.nbRangees * e.nbPositions, 0);
}

// ---------- Initial data ----------
const initialFabrications: Fabrication[] = [
  {
    id: newId(),
    recipeName: "Camembert fermier",
    variant: "Nature",
    batchCode: "CAM-2026-118",
    date: "2026-07-01",
    milkLiters: 220,
    yieldPieces: 48,
    temperatureC: 32,
    operator: "Marie L.",
    status: "affinage",
    notes: "Caillage régulier, moulage à 14h.",
  },
  {
    id: newId(),
    recipeName: "Tomme de montagne",
    variant: "Nature",
    batchCode: "TOM-2026-042",
    date: "2026-06-28",
    milkLiters: 640,
    yieldPieces: 8,
    temperatureC: 34,
    operator: "Jean P.",
    status: "terminee",
  },
  {
    id: newId(),
    recipeName: "Camembert fermier",
    variant: "Aux herbes de Provence",
    batchCode: "CAM-H-2026-119",
    date: "2026-07-03",
    milkLiters: 180,
    yieldPieces: 40,
    temperatureC: 32,
    operator: "Marie L.",
    status: "en_cours",
  },
  {
    id: newId(),
    recipeName: "Bleu d'auvergne",
    variant: "Nature",
    batchCode: "BLE-2026-014",
    date: "2026-07-05",
    milkLiters: 300,
    yieldPieces: 24,
    temperatureC: 30,
    operator: "Sofia M.",
    status: "planifiee",
  },
];

const initialCaves: Cave[] = [
  (() => {
    const etageres: EtagereConfig[] = [
      { label: "A", nbRangees: 3, nbPositions: 5 },
      { label: "B", nbRangees: 2, nbPositions: 4 },
      { label: "C", nbRangees: 1, nbPositions: 6 },
    ];
    const base = buildEmplacements(etageres);
    const filled = new Map<string, string>([
      ["A-1-1", "Tomme L-241102"],
      ["A-1-2", "Tomme L-241102"],
      ["A-2-1", "Bleu L-241028"],
      ["B-1-2", "Tomme L-241031"],
    ]);
    return {
      id: "cave-1",
      nom: "Cave d'affinage principale",
      description:
        "Cave voûtée en pierre, affinage longue durée des pâtes pressées.",
      etageres,
      temperatureCible: 11,
      humiditeCible: 92,
      emplacements: base.map((e) => {
        const c = filled.get(`${e.etagere}-${e.rangee}-${e.position}`);
        return c ? { ...e, contenu: c } : e;
      }),
    };
  })(),
  (() => {
    const etageres: EtagereConfig[] = [
      { label: "A", nbRangees: 2, nbPositions: 3 },
      { label: "B", nbRangees: 1, nbPositions: 4 },
    ];
    const base = buildEmplacements(etageres);
    const filled = new Map<string, string>([
      ["A-1-1", "Camembert L-241107"],
      ["A-1-2", "Camembert L-241107"],
    ]);
    return {
      id: "cave-2",
      nom: "Cave à pâtes molles",
      description: "Environnement humide dédié aux camemberts et bries.",
      etageres,
      temperatureCible: 13,
      humiditeCible: 95,
      emplacements: base.map((e) => {
        const c = filled.get(`${e.etagere}-${e.rangee}-${e.position}`);
        return c ? { ...e, contenu: c } : e;
      }),
    };
  })(),
];

// ---------- Store ----------
type State = {
  fabrications: Fabrication[];
  caves: Cave[];
};

let state: State = {
  fabrications: initialFabrications,
  caves: initialCaves,
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  emit();
}

export function useProductionStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

// ---------- Fabrication actions ----------
export const fabricationActions = {
  add(f: Fabrication) {
    setState((s) => ({ ...s, fabrications: [f, ...s.fabrications] }));
  },
  remove(id: string) {
    setState((s) => {
      const f = s.fabrications.find((x) => x.id === id);
      const caves = f?.emplacementId
        ? s.caves.map((c) =>
            c.id === f.caveId
              ? {
                  ...c,
                  emplacements: c.emplacements.map((e) =>
                    e.id === f.emplacementId
                      ? { ...e, contenu: undefined, fabricationId: undefined }
                      : e,
                  ),
                }
              : c,
          )
        : s.caves;
      return {
        fabrications: s.fabrications.filter((x) => x.id !== id),
        caves,
      };
    });
  },
  advance(id: string) {
    const order: FabricationStatus[] = [
      "planifiee",
      "en_cours",
      "affinage",
      "terminee",
    ];
    setState((s) => ({
      ...s,
      fabrications: s.fabrications.map((f) => {
        if (f.id !== id) return f;
        const idx = order.indexOf(f.status);
        return { ...f, status: order[Math.min(idx + 1, order.length - 1)] };
      }),
    }));
  },
  addCareEvent(id: string, event: Omit<CareEvent, "id">) {
    setState((s) => ({
      ...s,
      fabrications: s.fabrications.map((f) =>
        f.id === id
          ? { ...f, careEvents: [{ id: newId(), ...event }, ...(f.careEvents ?? [])] }
          : f,
      ),
    }));
  },
  removeCareEvent(id: string, eventId: string) {
    setState((s) => ({
      ...s,
      fabrications: s.fabrications.map((f) =>
        f.id === id
          ? { ...f, careEvents: (f.careEvents ?? []).filter((e) => e.id !== eventId) }
          : f,
      ),
    }));
  },
};

// ---------- Cave actions ----------
export const caveActions = {
  upsert(cave: Cave) {
    setState((s) => {
      const exists = s.caves.some((c) => c.id === cave.id);
      return {
        ...s,
        caves: exists
          ? s.caves.map((c) => (c.id === cave.id ? cave : c))
          : [...s.caves, cave],
      };
    });
  },
  remove(id: string) {
    setState((s) => ({
      ...s,
      caves: s.caves.filter((c) => c.id !== id),
      fabrications: s.fabrications.map((f) =>
        f.caveId === id ? { ...f, caveId: undefined, emplacementId: undefined } : f,
      ),
    }));
  },
  setContenu(caveId: string, empId: string, contenu: string | undefined) {
    setState((s) => ({
      ...s,
      caves: s.caves.map((c) =>
        c.id === caveId
          ? {
              ...c,
              emplacements: c.emplacements.map((e) =>
                e.id === empId
                  ? contenu
                    ? { ...e, contenu, fabricationId: undefined }
                    : { ...e, contenu: undefined, fabricationId: undefined }
                  : e,
              ),
            }
          : c,
      ),
      // if we cleared a slot linked to a fabrication, unlink it
      fabrications: s.fabrications.map((f) => {
        if (!contenu && f.caveId === caveId && f.emplacementId === empId) {
          return { ...f, caveId: undefined, emplacementId: undefined };
        }
        return f;
      }),
    }));
  },
  /** Place a fabrication ready-for-affinage into the first N free slots of a cave. */
  placeInAffinage(caveId: string, fabricationId: string, affinageDays?: number): { ok: boolean; reason?: string } {
    let result: { ok: boolean; reason?: string } = { ok: true };
    setState((s) => {
      const cave = s.caves.find((c) => c.id === caveId);
      const fab = s.fabrications.find((f) => f.id === fabricationId);
      if (!cave || !fab) {
        result = { ok: false, reason: "Introuvable" };
        return s;
      }
      const needed = Math.max(1, fab.yieldPieces || 1);
      const freeIdxs: number[] = [];
      cave.emplacements.forEach((e, i) => {
        if (!e.contenu && freeIdxs.length < needed) freeIdxs.push(i);
      });
      if (freeIdxs.length < needed) {
        result = {
          ok: false,
          reason: `Espace insuffisant : ${freeIdxs.length} libre(s) sur ${needed} requis.`,
        };
        return s;
      }
      const label = `${fab.recipeName}${fab.variant && fab.variant !== "Nature" ? ` (${fab.variant})` : ""} — ${fab.batchCode}`;
      const firstEmpId = cave.emplacements[freeIdxs[0]].id;
      const freeSet = new Set(freeIdxs);
      return {
        caves: s.caves.map((c) =>
          c.id === caveId
            ? {
                ...c,
                emplacements: c.emplacements.map((e, i) =>
                  freeSet.has(i)
                    ? { ...e, contenu: label, fabricationId: fab.id }
                    : e,
                ),
              }
            : c,
        ),
        fabrications: s.fabrications.map((f) =>
          f.id === fab.id
            ? { ...f, status: "affinage", caveId, emplacementId: firstEmpId, affinageDays: affinageDays ?? f.affinageDays, affinageStartDate: f.affinageStartDate ?? new Date().toISOString().slice(0, 10) }
            : f,
        ),
      };
    });
    return result;
  },

};
